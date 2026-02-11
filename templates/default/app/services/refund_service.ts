import Refund from '#models/refund'
import RefundItem from '#models/refund_item'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import OrderTransaction from '#models/order_transaction'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import { PaymentProvider } from '#contracts/payment_provider'
import InventoryService from './inventory_service.js'

interface CreateRefundDTO {
  orderId: string
  reason?: string
  notes?: string
  items: { orderItemId: string; quantity: number; restock: boolean }[]
  refundShipping?: boolean
}

export default class RefundService {
  private inventoryService: InventoryService

  constructor() {
    this.inventoryService = new InventoryService()
  }

  async create(data: CreateRefundDTO, userId?: number): Promise<Refund> {
    return await db.transaction(async (trx) => {
      const order = await Order.query({ client: trx })
        .where('id', data.orderId)
        .preload('items')
        .firstOrFail()

      // Validate items and calculate refund amount
      let refundAmount = 0

      for (const item of data.items) {
        const orderItem = order.items.find((oi) => oi.id === item.orderItemId)
        if (!orderItem) {
          throw new Error(`Order item ${item.orderItemId} not found`)
        }

        const availableQuantity = orderItem.quantity - orderItem.returnedQuantity
        if (item.quantity > availableQuantity) {
          throw new Error(
            `Cannot refund ${item.quantity} units of ${orderItem.title}. Only ${availableQuantity} available.`
          )
        }

        // Calculate item refund amount
        const itemRefundAmount = (orderItem.totalPrice / orderItem.quantity) * item.quantity
        refundAmount += itemRefundAmount
      }

      // Add shipping refund if applicable
      if (data.refundShipping && order.shippingTotal > 0) {
        refundAmount += order.shippingTotal
      }

      const refund = await Refund.create(
        {
          orderId: data.orderId,
          amount: Math.round(refundAmount * 100) / 100,
          reason: data.reason,
          notes: data.notes,
          status: 'pending',
          refundedBy: userId,
        },
        { client: trx }
      )

      // Create refund items
      for (const item of data.items) {
        const orderItem = order.items.find((oi) => oi.id === item.orderItemId)!
        const itemAmount = (orderItem.totalPrice / orderItem.quantity) * item.quantity

        await RefundItem.create(
          {
            refundId: refund.id,
            orderItemId: item.orderItemId,
            quantity: item.quantity,
            amount: Math.round(itemAmount * 100) / 100,
            restock: item.restock,
          },
          { client: trx }
        )

        // Update order item refunded quantity
        await OrderItem.query({ client: trx })
          .where('id', item.orderItemId)
          .increment('returnedQuantity', item.quantity)
      }

      return refund
    })
  }

  async process(refundId: string): Promise<Refund> {
    return await db.transaction(async (trx) => {
      const refund = await Refund.query({ client: trx })
        .where('id', refundId)
        .preload('items', (query) => {
          query.preload('orderItem')
        })
        .preload('order')
        .firstOrFail()

      if (refund.status !== 'pending') {
        throw new Error('Refund has already been processed')
      }

      // Find the capture transaction to get the gateway reference
      const captureTransaction = await OrderTransaction.query({ client: trx })
        .where('orderId', refund.orderId)
        .where('type', 'capture')
        .where('status', 'success')
        .orderBy('createdAt', 'desc')
        .first()

      const paymentProvider = await app.container.make(PaymentProvider)
      const gatewayTransactionId = captureTransaction?.gatewayTransactionId

      let transactionSuccess = false
      let gatewayResponse: Record<string, unknown> = {}
      let refundGatewayId: string | null = null

      if (gatewayTransactionId && paymentProvider.supportsRefunds) {
        // Process refund via payment provider
        const result = await paymentProvider.refundPayment(
          gatewayTransactionId,
          refund.amount,
          refund.reason || undefined
        )
        transactionSuccess = result.success
        gatewayResponse = result.gatewayResponse
        refundGatewayId = result.refundId
      } else {
        // Manual provider or no gateway reference — auto-approve
        transactionSuccess = true
        gatewayResponse = { provider: 'manual', note: 'No gateway transaction to refund' }
      }

      if (transactionSuccess) {
        refund.status = 'processed'
        await refund.useTransaction(trx).save()

        // Create refund transaction
        await OrderTransaction.create(
          {
            orderId: refund.orderId,
            type: 'refund',
            amount: refund.amount,
            currencyCode: refund.order.currencyCode,
            paymentMethod: refund.order.paymentMethod || paymentProvider.name,
            gatewayTransactionId: refundGatewayId || undefined,
            status: 'success',
            gatewayResponse,
          },
          { client: trx }
        )

        // Restock items if requested
        for (const item of refund.items) {
          if (item.restock && item.orderItem.variantId) {
            // Get default location for the store
            const order = await Order.query({ client: trx })
              .where('id', refund.orderId)
              .firstOrFail()

            const locations = await this.inventoryService.getLocations(order.storeId)
            const defaultLocation = locations.find((l) => l.isFulfillmentCenter) || locations[0]

            if (defaultLocation) {
              await this.inventoryService.adjustStock({
                variantId: item.orderItem.variantId,
                locationId: defaultLocation.id,
                quantity: item.quantity,
                type: 'returned',
                reason: `Refund ${refund.id}`,
                referenceType: 'refund',
                referenceId: refund.id,
              })
            }
          }
        }

        // Update order payment status
        await this.updateOrderPaymentStatus(refund.orderId, trx)
      } else {
        refund.status = 'failed'
        await refund.useTransaction(trx).save()
      }

      return refund
    })
  }

  async cancel(refundId: string): Promise<Refund> {
    return await db.transaction(async (trx) => {
      const refund = await Refund.query({ client: trx })
        .where('id', refundId)
        .preload('items')
        .firstOrFail()

      if (refund.status !== 'pending') {
        throw new Error('Only pending refunds can be cancelled')
      }

      // Restore refunded quantities on order items
      for (const item of refund.items) {
        await OrderItem.query({ client: trx })
          .where('id', item.orderItemId)
          .decrement('returnedQuantity', item.quantity)
      }

      // Delete refund
      await RefundItem.query({ client: trx }).where('refundId', refundId).delete()
      await refund.useTransaction(trx).delete()

      return refund
    })
  }

  async findById(refundId: string): Promise<Refund | null> {
    return await Refund.query()
      .where('id', refundId)
      .preload('items', (query) => {
        query.preload('orderItem')
      })
      .preload('order')
      .preload('refundedByUser')
      .first()
  }

  async getOrderRefunds(orderId: string): Promise<Refund[]> {
    return await Refund.query()
      .where('orderId', orderId)
      .preload('items', (query) => {
        query.preload('orderItem')
      })
      .orderBy('createdAt', 'desc')
  }

  async getRefundableItems(orderId: string): Promise<OrderItem[]> {
    return await OrderItem.query()
      .where('orderId', orderId)
      .whereRaw('quantity > refunded_quantity')
  }

  async getTotalRefunded(orderId: string): Promise<number> {
    const refunds = await Refund.query()
      .where('orderId', orderId)
      .where('status', 'processed')

    return refunds.reduce((sum, refund) => sum + refund.amount, 0)
  }

  async canRefund(orderId: string): Promise<{ canRefund: boolean; maxAmount: number }> {
    const order = await Order.findOrFail(orderId)
    const totalRefunded = await this.getTotalRefunded(orderId)
    const maxAmount = order.grandTotal - totalRefunded

    return {
      canRefund: maxAmount > 0,
      maxAmount: Math.round(maxAmount * 100) / 100,
    }
  }

  private async updateOrderPaymentStatus(orderId: string, trx: any): Promise<void> {
    const order = await Order.query({ client: trx }).where('id', orderId).firstOrFail()

    const totalRefunded = await Refund.query({ client: trx })
      .where('orderId', orderId)
      .where('status', 'processed')
      .sum('amount as total')
      .first()

    const refundedAmount = Number(totalRefunded?.$extras.total || 0)

    if (refundedAmount >= order.grandTotal) {
      order.paymentStatus = 'refunded'
      order.status = 'refunded'
    } else if (refundedAmount > 0) {
      order.paymentStatus = 'partially_refunded'
    }

    await order.useTransaction(trx).save()
  }
}
