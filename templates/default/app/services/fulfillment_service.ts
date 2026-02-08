import Fulfillment from '#models/fulfillment'
import FulfillmentItem from '#models/fulfillment_item'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

interface CreateFulfillmentDTO {
  orderId: string
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
  notes?: string
  items: { orderItemId: string; quantity: number }[]
}

interface UpdateFulfillmentDTO {
  trackingNumber?: string
  trackingUrl?: string
  carrier?: string
  notes?: string
  status?: 'pending' | 'shipped' | 'in_transit' | 'delivered' | 'failed' | 'returned'
}

export default class FulfillmentService {
  async create(data: CreateFulfillmentDTO, userId?: string): Promise<Fulfillment> {
    return await db.transaction(async (trx) => {
      const order = await Order.query({ client: trx })
        .where('id', data.orderId)
        .preload('items')
        .firstOrFail()

      // Validate items
      for (const item of data.items) {
        const orderItem = order.items.find((oi) => oi.id === item.orderItemId)
        if (!orderItem) {
          throw new Error(`Order item ${item.orderItemId} not found`)
        }

        const remainingQuantity = orderItem.quantity - orderItem.fulfilledQuantity
        if (item.quantity > remainingQuantity) {
          throw new Error(
            `Cannot fulfill ${item.quantity} units of ${orderItem.title}. Only ${remainingQuantity} remaining.`
          )
        }
      }

      const fulfillment = await Fulfillment.create(
        {
          orderId: data.orderId,
          status: 'pending',
          trackingNumber: data.trackingNumber || null,
          trackingUrl: data.trackingUrl || null,
          carrier: data.carrier || null,
          notes: data.notes || null,
          metadata: userId ? { fulfilledBy: userId } : {},
        },
        { client: trx }
      )

      // Create fulfillment items and update order items
      for (const item of data.items) {
        await FulfillmentItem.create(
          {
            fulfillmentId: fulfillment.id,
            orderItemId: item.orderItemId,
            quantity: item.quantity,
          },
          { client: trx }
        )

        // Update order item fulfilled quantity
        await OrderItem.query({ client: trx })
          .where('id', item.orderItemId)
          .increment('fulfilledQuantity', item.quantity)
      }

      // Update order fulfillment status
      await this.updateOrderFulfillmentStatus(order.id, trx)

      return fulfillment
    })
  }

  async update(fulfillmentId: string, data: UpdateFulfillmentDTO): Promise<Fulfillment> {
    const fulfillment = await Fulfillment.findOrFail(fulfillmentId)

    fulfillment.merge({
      trackingNumber: data.trackingNumber,
      trackingUrl: data.trackingUrl,
      carrier: data.carrier,
      notes: data.notes,
      status: data.status,
    })

    if (data.status === 'shipped' && !fulfillment.shippedAt) {
      fulfillment.shippedAt = DateTime.now()
    }

    if (data.status === 'delivered' && !fulfillment.deliveredAt) {
      fulfillment.deliveredAt = DateTime.now()
    }

    await fulfillment.save()
    return fulfillment
  }

  async ship(
    fulfillmentId: string,
    trackingInfo?: { trackingNumber?: string; trackingUrl?: string; carrier?: string }
  ): Promise<Fulfillment> {
    const fulfillment = await Fulfillment.findOrFail(fulfillmentId)

    fulfillment.status = 'shipped'
    fulfillment.shippedAt = DateTime.now()

    if (trackingInfo?.trackingNumber) {
      fulfillment.trackingNumber = trackingInfo.trackingNumber
    }
    if (trackingInfo?.trackingUrl) {
      fulfillment.trackingUrl = trackingInfo.trackingUrl
    }
    if (trackingInfo?.carrier) {
      fulfillment.carrier = trackingInfo.carrier
    }

    await fulfillment.save()

    // Update order status
    const order = await Order.findOrFail(fulfillment.orderId)
    if (order.status === 'processing' || order.status === 'confirmed') {
      order.status = 'shipped'
      await order.save()
    }

    return fulfillment
  }

  async markDelivered(fulfillmentId: string): Promise<Fulfillment> {
    const fulfillment = await Fulfillment.findOrFail(fulfillmentId)

    fulfillment.status = 'delivered'
    fulfillment.deliveredAt = DateTime.now()
    await fulfillment.save()

    // Check if all fulfillments are delivered
    const order = await Order.query()
      .where('id', fulfillment.orderId)
      .preload('fulfillments')
      .firstOrFail()

    const allDelivered = order.fulfillments.every((f) => f.status === 'delivered')
    if (allDelivered && order.fulfillmentStatus === 'fulfilled') {
      order.status = 'delivered'
      await order.save()
    }

    return fulfillment
  }

  async cancel(fulfillmentId: string): Promise<Fulfillment> {
    return await db.transaction(async (trx) => {
      const fulfillment = await Fulfillment.query({ client: trx })
        .where('id', fulfillmentId)
        .preload('items')
        .firstOrFail()

      if (fulfillment.status === 'delivered') {
        throw new Error('Cannot cancel a delivered fulfillment')
      }

      fulfillment.status = 'failed'
      await fulfillment.useTransaction(trx).save()

      // Restore fulfilled quantities on order items
      for (const item of fulfillment.items) {
        await OrderItem.query({ client: trx })
          .where('id', item.orderItemId)
          .decrement('fulfilledQuantity', item.quantity)
      }

      // Update order fulfillment status
      await this.updateOrderFulfillmentStatus(fulfillment.orderId, trx)

      return fulfillment
    })
  }

  async findById(fulfillmentId: string): Promise<Fulfillment | null> {
    return await Fulfillment.query()
      .where('id', fulfillmentId)
      .preload('items', (query) => {
        query.preload('orderItem')
      })
      .first()
  }

  async getOrderFulfillments(orderId: string): Promise<Fulfillment[]> {
    return await Fulfillment.query()
      .where('orderId', orderId)
      .preload('items', (query) => {
        query.preload('orderItem')
      })
      .orderBy('createdAt', 'desc')
  }

  async getUnfulfilledItems(orderId: string): Promise<OrderItem[]> {
    return await OrderItem.query()
      .where('orderId', orderId)
      .whereRaw('quantity > fulfilled_quantity')
  }

  async isFullyFulfilled(orderId: string): Promise<boolean> {
    const unfulfilledItems = await this.getUnfulfilledItems(orderId)
    return unfulfilledItems.length === 0
  }

  private async updateOrderFulfillmentStatus(orderId: string, trx: any): Promise<void> {
    const order = await Order.query({ client: trx })
      .where('id', orderId)
      .preload('items')
      .firstOrFail()

    const totalItems = order.items.reduce((sum, item) => sum + item.quantity, 0)
    const fulfilledItems = order.items.reduce((sum, item) => sum + item.fulfilledQuantity, 0)

    let fulfillmentStatus: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled'

    if (fulfilledItems === 0) {
      fulfillmentStatus = 'unfulfilled'
    } else if (fulfilledItems >= totalItems) {
      fulfillmentStatus = 'fulfilled'
    } else {
      fulfillmentStatus = 'partially_fulfilled'
    }

    order.fulfillmentStatus = fulfillmentStatus
    await order.useTransaction(trx).save()
  }
}
