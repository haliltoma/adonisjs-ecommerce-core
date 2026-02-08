import Order from '#models/order'
import OrderItem from '#models/order_item'
import OrderTransaction from '#models/order_transaction'
import OrderStatusHistory from '#models/order_status_history'
import Cart from '#models/cart'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import string from '@adonisjs/core/helpers/string'

interface CreateOrderDTO {
  cartId: string
  customerId: string
  billingAddress: {
    firstName: string
    lastName: string
    company?: string
    address1: string
    address2?: string
    city: string
    state?: string
    postalCode: string
    country: string
    phone?: string
  }
  shippingAddress?: {
    firstName: string
    lastName: string
    company?: string
    address1: string
    address2?: string
    city: string
    state?: string
    postalCode: string
    country: string
    phone?: string
  }
  shippingMethod?: string
  shippingCost?: number
  notes?: string
}

interface OrderFilters {
  storeId: string
  customerId?: string
  status?: string
  paymentStatus?: string
  fulfillmentStatus?: string
  search?: string
  dateFrom?: DateTime
  dateTo?: DateTime
  sortBy?: 'orderNumber' | 'createdAt' | 'total'
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
type PaymentStatus = 'pending' | 'authorized' | 'paid' | 'partially_refunded' | 'refunded' | 'failed'
type FulfillmentStatus = 'unfulfilled' | 'partially_fulfilled' | 'fulfilled'

export default class OrderService {
  async createFromCart(data: CreateOrderDTO, userId?: number): Promise<Order> {
    return await db.transaction(async (trx) => {
      const cart = await Cart.query({ client: trx })
        .where('id', data.cartId)
        .whereNull('completedAt')
        .preload('items', (query) => {
          query.preload('product').preload('variant')
        })
        .firstOrFail()

      if (cart.items.length === 0) {
        throw new Error('Cart is empty')
      }

      if (!cart.email) {
        throw new Error('Cart email is required')
      }

      const orderNumber = await this.generateOrderNumber(cart.storeId)

      const order = await Order.create(
        {
          storeId: cart.storeId,
          customerId: data.customerId,
          orderNumber,
          email: cart.email,
          phone: data.billingAddress.phone || null,
          status: 'pending',
          paymentStatus: 'pending',
          fulfillmentStatus: 'unfulfilled',
          currencyCode: cart.currencyCode,
          subtotal: cart.subtotal,
          discountTotal: cart.discountTotal,
          couponCode: cart.couponCode,
          shippingTotal: data.shippingCost || 0,
          taxTotal: cart.taxTotal,
          grandTotal: cart.grandTotal + (data.shippingCost || 0),
          billingAddress: data.billingAddress,
          shippingAddress: data.shippingAddress || data.billingAddress,
          shippingMethod: data.shippingMethod,
          notes: data.notes,
          placedAt: DateTime.now(),
          metadata: {},
        },
        { client: trx }
      )

      // Create order items from cart items
      for (const cartItem of cart.items) {
        await OrderItem.create(
          {
            orderId: order.id,
            productId: cartItem.productId,
            variantId: cartItem.variantId || undefined,
            sku: cartItem.sku,
            title: cartItem.title,
            variantTitle: cartItem.variant?.title || undefined,
            quantity: cartItem.quantity,
            unitPrice: cartItem.unitPrice,
            discountAmount: 0,
            taxAmount: 0,
            totalPrice: cartItem.totalPrice,
            weight: cartItem.product?.weight,
            thumbnailUrl: cartItem.product?.images?.[0]?.url,
            properties: cartItem.metadata || {},
            fulfilledQuantity: 0,
            returnedQuantity: 0,
          },
          { client: trx }
        )
      }

      // Create initial status history
      await OrderStatusHistory.create(
        {
          orderId: order.id,
          status: 'pending',
          type: 'status_change',
          title: 'Order created',
          description: 'Order was placed',
          userId,
        },
        { client: trx }
      )

      // Mark cart as converted
      cart.completedAt = DateTime.now()
      await cart.useTransaction(trx).save()

      return order
    })
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
    userId?: number
  ): Promise<Order> {
    return await db.transaction(async (trx) => {
      const order = await Order.query({ client: trx }).where('id', orderId).firstOrFail()

      const previousStatus = order.status
      order.status = status
      await order.useTransaction(trx).save()

      await OrderStatusHistory.create(
        {
          orderId: order.id,
          previousStatus,
          status,
          type: 'status_change',
          title: `Status changed to ${status}`,
          description: note,
          userId,
        },
        { client: trx }
      )

      return order
    })
  }

  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order> {
    const order = await Order.findOrFail(orderId)
    order.paymentStatus = paymentStatus
    await order.save()
    return order
  }

  async updateFulfillmentStatus(
    orderId: string,
    fulfillmentStatus: FulfillmentStatus
  ): Promise<Order> {
    const order = await Order.findOrFail(orderId)
    order.fulfillmentStatus = fulfillmentStatus
    await order.save()
    return order
  }

  async addTransaction(
    orderId: string,
    data: {
      type: 'authorization' | 'capture' | 'refund' | 'void'
      amount: number
      currencyCode: string
      paymentMethod: string
      gatewayTransactionId?: string
      status: 'pending' | 'success' | 'failed'
      gatewayResponse?: Record<string, unknown>
    }
  ): Promise<OrderTransaction> {
    return await OrderTransaction.create({
      orderId,
      type: data.type,
      amount: data.amount,
      currencyCode: data.currencyCode,
      paymentMethod: data.paymentMethod,
      gatewayTransactionId: data.gatewayTransactionId,
      status: data.status,
      gatewayResponse: data.gatewayResponse || {},
      processedAt: data.status === 'success' ? DateTime.now() : null,
    })
  }

  async findById(orderId: string): Promise<Order | null> {
    return await Order.query()
      .where('id', orderId)
      .preload('items', (query) => {
        query.preload('product')
      })
      .preload('transactions')
      .preload('statusHistory')
      .preload('fulfillments', (query) => {
        query.preload('items')
      })
      .preload('refunds', (query) => {
        query.preload('items')
      })
      .first()
  }

  async findByOrderNumber(storeId: string, orderNumber: string): Promise<Order | null> {
    return await Order.query()
      .where('storeId', storeId)
      .where('orderNumber', orderNumber)
      .preload('items')
      .preload('transactions')
      .first()
  }

  async list(filters: OrderFilters): Promise<ModelPaginatorContract<Order>> {
    const query = Order.query()
      .where('storeId', filters.storeId)
      .preload('items')
      .preload('customer')

    if (filters.customerId) {
      query.where('customerId', filters.customerId)
    }

    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.paymentStatus) {
      query.where('paymentStatus', filters.paymentStatus)
    }

    if (filters.fulfillmentStatus) {
      query.where('fulfillmentStatus', filters.fulfillmentStatus)
    }

    if (filters.search) {
      query.where((builder) => {
        builder
          .whereILike('orderNumber', `%${filters.search}%`)
          .orWhereILike('email', `%${filters.search}%`)
      })
    }

    if (filters.dateFrom) {
      query.where('createdAt', '>=', filters.dateFrom.toISO()!)
    }

    if (filters.dateTo) {
      query.where('createdAt', '<=', filters.dateTo.toISO()!)
    }

    const sortBy = filters.sortBy || 'createdAt'
    const sortDir = filters.sortDir || 'desc'
    query.orderBy(sortBy, sortDir)

    return await query.paginate(filters.page || 1, filters.limit || 20)
  }

  async getCustomerOrders(customerId: string, page: number = 1, limit: number = 10) {
    return await Order.query()
      .where('customerId', customerId)
      .preload('items')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)
  }

  async cancel(orderId: string, reason?: string, userId?: number): Promise<Order> {
    return await this.updateStatus(orderId, 'cancelled', reason, userId)
  }

  async getOrderStats(storeId: string, dateFrom?: DateTime, dateTo?: DateTime) {
    const query = Order.query().where('storeId', storeId)

    if (dateFrom) {
      query.where('createdAt', '>=', dateFrom.toISO()!)
    }
    if (dateTo) {
      query.where('createdAt', '<=', dateTo.toISO()!)
    }

    const stats = await query
      .select(
        db.raw('COUNT(*) as total_orders'),
        db.raw('SUM(grand_total) as total_revenue'),
        db.raw('AVG(grand_total) as average_order_value'),
        db.raw("COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders"),
        db.raw("COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders"),
        db.raw("COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders"),
        db.raw("COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders"),
        db.raw("COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders")
      )
      .first()

    return stats?.$extras || {}
  }

  private async generateOrderNumber(_storeId: string): Promise<string> {
    const prefix = 'ORD'
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = string.random(4).toUpperCase()
    return `${prefix}-${timestamp}-${random}`
  }
}
