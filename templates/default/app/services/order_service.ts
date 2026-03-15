/**
 * Order Service (Refactored)
 *
 * Orchestrates order-related operations following SOLID principles.
 * Depends on abstractions (repositories) and delegates specific tasks to specialized classes.
 */

import Order from '#models/order'
import OrderTransaction from '#models/order_transaction'
import Cart from '#models/cart'
import { DateTime } from 'luxon'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import type IOrderRepository from '#repositories/interfaces/i_order_repository'
import type ICartRepository from '#repositories/interfaces/i_cart_repository'
import OrderItemFactory from '#services/order/order_item_factory'
import OrderStatusManager from '#services/order/order_status_manager'
import OrderNumberGenerator from '#services/order/order_number_generator'

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
  constructor(
    private orderRepository: IOrderRepository,
    private cartRepository: ICartRepository,
    private orderItemFactory: OrderItemFactory,
    private statusManager: OrderStatusManager,
    private numberGenerator: OrderNumberGenerator
  ) {}

  /**
   * Create order from cart (SRP: Orchestrate the workflow)
   */
  async createFromCart(data: CreateOrderDTO, userId?: number): Promise<Order> {
    return await this.orderRepository.transaction(async (trx) => {
      // 1. Get and validate cart
      const cart = await this.cartRepository.findById(data.cartId, trx)

      if (!cart) {
        throw new Error('Cart not found')
      }

      if (!cart || cart.items.length === 0) {
        throw new Error('Cart is empty')
      }

      if (!cart.email) {
        throw new Error('Cart email is required')
      }

      // 2. Generate order number
      const orderNumber = await this.numberGenerator.generate(cart.storeId)

      // 3. Create order
      const order = await this.orderRepository.create(
        {
          storeId: cart.storeId,
          customerId: data.customerId,
          orderNumber,
          email: cart.email,
          phone: data.billingAddress.phone || null,
          status: 'pending',
          paymentStatus: 'pending',
          fulfillmentStatus: 'unfulfilled',
          currencyCode: cart.currencyCode || 'USD',
          subtotal: cart.subtotal || 0,
          discountTotal: cart.discountTotal || 0,
          couponCode: cart.couponCode,
          discountId: cart.discountId,
          shippingTotal: data.shippingCost || 0,
          taxTotal: cart.taxTotal || 0,
          grandTotal: Number(cart.grandTotal || 0) + (data.shippingCost || 0),
          billingAddress: data.billingAddress,
          shippingAddress: data.shippingAddress || data.billingAddress,
          shippingMethod: data.shippingMethod,
          notes: data.notes,
          userId,
        },
        trx
      )

      // 4. Create order items from cart items
      await this.orderItemFactory.createFromCartItems(order.id, cart.items, trx)

      // 5. Record initial status
      await this.statusManager.recordInitialStatus(order.id, userId, trx)

      // 6. Mark cart as completed
      await this.cartRepository.markCompleted(data.cartId, trx)

      return order
    })
  }

  /**
   * Update order status
   */
  async updateStatus(
    orderId: string,
    status: OrderStatus,
    note?: string,
    userId?: number
  ): Promise<Order> {
    return await this.orderRepository.transaction(async (trx) => {
      const order = await this.orderRepository.findById(orderId, trx)

      if (!order) {
        throw new Error(`Order not found: ${orderId}`)
      }

      const previousStatus = order.status

      const updatedOrder = await this.orderRepository.update(
        orderId,
        { status },
        trx
      )

      // Record status change in history
      await this.statusManager.recordStatusChange(
        orderId,
        previousStatus as OrderStatus,
        status,
        userId,
        note,
        trx
      )

      return updatedOrder
    })
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(orderId: string, paymentStatus: PaymentStatus): Promise<Order> {
    const order = await this.orderRepository.findById(orderId)

    if (!order) {
      throw new Error(`Order not found: ${orderId}`)
    }

    return await this.orderRepository.update(orderId, { paymentStatus })
  }

  /**
   * Update fulfillment status
   */
  async updateFulfillmentStatus(
    orderId: string,
    fulfillmentStatus: FulfillmentStatus
  ): Promise<Order> {
    const order = await this.orderRepository.findById(orderId)

    if (!order) {
      throw new Error(`Order not found: ${orderId}`)
    }

    return await this.orderRepository.update(orderId, { fulfillmentStatus })
  }

  /**
   * Add payment transaction to order
   */
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
    // Verify order exists
    const order = await this.orderRepository.findById(orderId)

    if (!order) {
      throw new Error(`Order not found: ${orderId}`)
    }

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

  /**
   * Find order by ID with relationships
   */
  async findById(orderId: string): Promise<Order | null> {
    const order = await this.orderRepository.findById(orderId)

    if (!order) {
      return null
    }

    // Load relationships
    await order.load('items', (query) => {
      query.preload('product')
    })

    await order.load('transactions')
    await order.load('statusHistory')
    await order.load('fulfillments', (query) => {
      query.preload('items')
    })
    await order.load('refunds', (query) => {
      query.preload('items')
    })

    return order
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(storeId: string, orderNumber: string): Promise<Order | null> {
    const order = await this.orderRepository.findByOrderNumber(orderNumber, storeId)

    if (!order) {
      return null
    }

    // Load relationships
    await order.load('items')
    await order.load('transactions')

    return order
  }

  /**
   * List orders with filters
   */
  async list(filters: OrderFilters): Promise<ModelPaginatorContract<Order>> {
    return await this.orderRepository.list({
      storeId: filters.storeId,
      customerId: filters.customerId,
      status: filters.status,
      paymentStatus: filters.paymentStatus,
      fulfillmentStatus: filters.fulfillmentStatus,
      search: filters.search,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      sortBy: filters.sortBy,
      sortDir: filters.sortDir,
      page: filters.page,
      limit: filters.limit,
    })
  }

  /**
   * Get customer orders
   */
  async getCustomerOrders(
    customerId: string,
    storeId: string,
    page: number = 1,
    limit: number = 10
  ) {
    return await this.orderRepository.findByCustomerId(customerId, storeId, page, limit)
  }

  /**
   * Cancel order
   */
  async cancel(orderId: string, reason?: string, userId?: number): Promise<Order> {
    return await this.updateStatus(orderId, 'cancelled', reason, userId)
  }

  /**
   * Get order statistics
   */
  async getOrderStats(storeId: string, dateFrom?: DateTime, dateTo?: DateTime) {
    return await this.orderRepository.getStatistics(storeId, dateFrom, dateTo)
  }
}
