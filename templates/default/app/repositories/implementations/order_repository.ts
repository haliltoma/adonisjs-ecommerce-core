/**
 * Order Repository Implementation
 *
 * Concrete implementation of order data access using Lucid ORM.
 * This handles all database operations for orders.
 */

import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Order from '#models/order'
import type IOrderRepository, {
  CreateOrderData,
  UpdateOrderData,
  OrderFilters,
  TransactionCallback,
} from '../interfaces/i_order_repository'

export default class OrderRepository implements IOrderRepository {
  /**
   * Find order by ID
   */
  async findById(id: string, trx?: any): Promise<Order | null> {
    const query = Order.query(trx ? { client: trx } : undefined)

    return await query.where('id', id).first()
  }

  /**
   * Find order by order number
   */
  async findByOrderNumber(orderNumber: string, storeId: string, trx?: any): Promise<Order | null> {
    const query = Order.query(trx ? { client: trx } : undefined)

    return await query.where('orderNumber', orderNumber).where('storeId', storeId).first()
  }

  /**
   * Create new order
   */
  async create(data: CreateOrderData, trx?: any): Promise<Order> {
    return await Order.create(
      {
        storeId: data.storeId,
        customerId: data.customerId,
        orderNumber: data.orderNumber,
        email: data.email,
        phone: data.phone,
        status: data.status,
        paymentStatus: data.paymentStatus,
        fulfillmentStatus: data.fulfillmentStatus,
        currencyCode: data.currencyCode,
        subtotal: data.subtotal,
        discountTotal: data.discountTotal,
        couponCode: data.couponCode,
        discountId: data.discountId,
        shippingTotal: data.shippingTotal,
        taxTotal: data.taxTotal,
        grandTotal: data.grandTotal,
        billingAddress: data.billingAddress,
        shippingAddress: data.shippingAddress,
        shippingMethod: data.shippingMethod,
        notes: data.notes,
        createdById: data.userId,
      },
      trx ? { client: trx } : undefined
    )
  }

  /**
   * Update order
   */
  async update(id: string, data: UpdateOrderData, trx?: any): Promise<Order> {
    const order = await this.findById(id, trx)

    if (!order) {
      throw new Error(`Order not found: ${id}`)
    }

    order.merge(data)
    await order.save(trx ? { client: trx } : undefined)

    return order
  }

  /**
   * Delete order (soft delete)
   */
  async delete(id: string, trx?: any): Promise<void> {
    const order = await this.findById(id, trx)

    if (!order) {
      throw new Error(`Order not found: ${id}`)
    }

    await order.delete(trx ? { client: trx } : undefined)
  }

  /**
   * List orders with filters and pagination
   */
  async list(filters: OrderFilters): Promise<any> {
    const query = Order.query()

    // Store filter is always required
    query.where('storeId', filters.storeId)

    // Customer filter
    if (filters.customerId) {
      query.where('customerId', filters.customerId)
    }

    // Status filters
    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.paymentStatus) {
      query.where('paymentStatus', filters.paymentStatus)
    }

    if (filters.fulfillmentStatus) {
      query.where('fulfillmentStatus', filters.fulfillmentStatus)
    }

    // Date range filter
    if (filters.dateFrom) {
      query.where('createdAt', '>=', filters.dateFrom.toSQL())
    }

    if (filters.dateTo) {
      query.where('createdAt', '<=', filters.dateTo.toSQL())
    }

    // Search filter
    if (filters.search) {
      query.where((subQuery) => {
        subQuery
          .where('orderNumber', 'LIKE', `%${filters.search}%`)
          .orWhere('email', 'LIKE', `%${filters.search}%`)
          .orWhereIn('id', (subSubQuery) => {
            subSubQuery
              .select('orderId')
              .from('order_items')
              .where('productName', 'LIKE', `%${filters.search}%`)
          })
      })
    }

    // Sorting
    const sortBy = filters.sortBy || 'createdAt'
    const sortDir = filters.sortDir || 'desc'
    query.orderBy(sortBy, sortDir)

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 20

    return await query.paginate(page, limit)
  }

  /**
   * Execute callback within a transaction
   */
  async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
    return await db.transaction(callback)
  }

  /**
   * Get orders by customer ID
   */
  async findByCustomerId(
    customerId: string,
    storeId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    return await Order.query()
      .where('storeId', storeId)
      .where('customerId', customerId)
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)
  }

  /**
   * Get orders by status
   */
  async findByStatus(
    storeId: string,
    status: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    return await Order.query()
      .where('storeId', storeId)
      .where('status', status)
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)
  }

  /**
   * Search orders by term
   */
  async search(
    storeId: string,
    searchTerm: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    return await Order.query()
      .where('storeId', storeId)
      .where((subQuery) => {
        subQuery
          .where('orderNumber', 'LIKE', `%${searchTerm}%`)
          .orWhere('email', 'LIKE', `%${searchTerm}%`)
          .orWhereIn('id', (subSubQuery) => {
            subSubQuery
              .select('orderId')
              .from('order_items')
              .where('productName', 'LIKE', `%${searchTerm}%`)
          })
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)
  }

  /**
   * Get order statistics for a store
   */
  async getStatistics(
    storeId: string,
    dateFrom?: DateTime,
    dateTo?: DateTime
  ): Promise<{
    total: number
    totalRevenue: number
    pendingCount: number
    shippedCount: number
    deliveredCount: number
    cancelledCount: number
  }> {
    const query = Order.query().where('storeId', storeId)

    if (dateFrom) {
      query.where('createdAt', '>=', dateFrom.toSQL())
    }

    if (dateTo) {
      query.where('createdAt', '<=', dateTo.toSQL())
    }

    const [totalResult, revenueResult, statusCounts] = await Promise.all([
      // Total orders
      db
        .from('orders')
        .count('* as count')
        .where('storeId', storeId)
        .modify((qb) => {
          if (dateFrom) qb.where('createdAt', '>=', dateFrom.toSQL())
          if (dateTo) qb.where('createdAt', '<=', dateTo.toSQL())
        })
        .first(),

      // Total revenue
      db
        .from('orders')
        .sum('grandTotal as revenue')
        .where('storeId', storeId)
        .whereIn('status', ['confirmed', 'processing', 'shipped', 'delivered'])
        .modify((qb) => {
          if (dateFrom) qb.where('createdAt', '>=', dateFrom.toSQL())
          if (dateTo) qb.where('createdAt', '<=', dateTo.toSQL())
        })
        .first(),

      // Status counts
      db
        .from('orders')
        .select('status')
        .count('* as count')
        .where('storeId', storeId)
        .whereIn('status', ['pending', 'shipped', 'delivered', 'cancelled'])
        .modify((qb) => {
          if (dateFrom) qb.where('createdAt', '>=', dateFrom.toSQL())
          if (dateTo) qb.where('createdAt', '<=', dateTo.toSQL())
        })
        .groupBy('status'),
    ])

    const total = Number(totalResult?.count || 0)
    const totalRevenue = Number(revenueResult[0]?.revenue || 0)

    const pendingCount =
      Number(statusCounts.find((s) => s.status === 'pending')?.count || 0)
    const shippedCount =
      Number(statusCounts.find((s) => s.status === 'shipped')?.count || 0)
    const deliveredCount =
      Number(statusCounts.find((s) => s.status === 'delivered')?.count || 0)
    const cancelledCount =
      Number(statusCounts.find((s) => s.status === 'cancelled')?.count || 0)

    return {
      total,
      totalRevenue,
      pendingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
    }
  }
}
