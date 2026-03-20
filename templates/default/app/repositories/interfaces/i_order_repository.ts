/**
 * Order Repository Interface
 *
 * Defines the contract for order data access operations.
 * This allows us to decouple business logic from data access implementation.
 */

import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import Order from '#models/order'

export interface CreateOrderData {
  storeId: string
  customerId: string | null
  orderNumber: string
  email: string
  phone?: string | null
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'completed' | 'cancelled' | 'refunded'
  paymentStatus:
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'partially_refunded'
  | 'refunded'
  | 'failed'
  | 'voided'
  fulfillmentStatus: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'returned' | 'partially_returned'
  currencyCode: string
  subtotal: number
  discountTotal: number
  couponCode?: string | null
  discountId?: string | null
  shippingTotal: number
  taxTotal: number
  grandTotal: number
  billingAddress: Record<string, any>
  shippingAddress?: Record<string, any> | null
  shippingMethod?: string | null
  shippingMethodTitle?: string | null
  paymentMethod?: string | null
  paymentMethodTitle?: string | null
  notes?: string | null
  internalNotes?: string | null
  regionId?: string | null
  salesChannelId?: string | null
  metadata?: Record<string, any>
  ipAddress?: string | null
  userAgent?: string | null
}

export interface UpdateOrderData {
  status?: string
  paymentStatus?: string
  fulfillmentStatus?: string
  subtotal?: number
  discountTotal?: number
  shippingTotal?: number
  taxTotal?: number
  grandTotal?: number
  billingAddress?: Record<string, any>
  shippingAddress?: Record<string, any>
  shippingMethod?: string
  notes?: string
  cancelledAt?: DateTime
  completedAt?: DateTime
}

export interface OrderFilters {
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

export type TransactionCallback<T> = (trx: any) => Promise<T>

export default interface IOrderRepository {
  /**
   * Find order by ID
   */
  findById(id: string, trx?: any): Promise<Order | null>

  /**
   * Find order by order number
   */
  findByOrderNumber(orderNumber: string, storeId: string, trx?: any): Promise<Order | null>

  /**
   * Create new order
   */
  create(data: CreateOrderData, trx?: any): Promise<Order>

  /**
   * Update order
   */
  update(id: string, data: UpdateOrderData, trx?: any): Promise<Order>

  /**
   * Delete order (soft delete)
   */
  delete(id: string, trx?: any): Promise<void>

  /**
   * List orders with filters and pagination
   */
  list(filters: OrderFilters): Promise<ModelPaginatorContract<Order>>

  /**
   * Execute callback within a transaction
   */
  transaction<T>(callback: TransactionCallback<T>): Promise<T>

  /**
   * Get orders by customer ID
   */
  findByCustomerId(
    customerId: string,
    storeId: string,
    page?: number,
    limit?: number
  ): Promise<ModelPaginatorContract<Order>>

  /**
   * Get orders by status
   */
  findByStatus(
    storeId: string,
    status: string,
    page?: number,
    limit?: number
  ): Promise<ModelPaginatorContract<Order>>

  /**
   * Search orders by term
   */
  search(
    storeId: string,
    searchTerm: string,
    page?: number,
    limit?: number
  ): Promise<ModelPaginatorContract<Order>>

  /**
   * Get order statistics for a store
   */
  getStatistics(storeId: string, dateFrom?: DateTime, dateTo?: DateTime): Promise<{
    total: number
    totalRevenue: number
    pendingCount: number
    shippedCount: number
    deliveredCount: number
    cancelledCount: number
  }>
}
