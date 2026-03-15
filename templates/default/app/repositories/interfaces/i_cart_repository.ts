/**
 * Cart Repository Interface
 *
 * Defines the contract for cart data access operations.
 */

import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import Cart from '#models/cart'

export interface CreateCartData {
  storeId: string
  customerId?: string
  sessionId?: string
  email?: string
  currencyCode?: string
}

export interface UpdateCartData {
  email?: string
  currencyCode?: string
  couponCode?: string
  discountId?: string
  discountTotal?: number
  subtotal?: number
  taxTotal?: number
  shippingTotal?: number
  grandTotal?: number
  completedAt?: DateTime | null
  notes?: string
}

export type TransactionCallback<T> = (trx: any) => Promise<T>

export default interface ICartRepository {
  /**
   * Find cart by ID
   */
  findById(id: string, trx?: any): Promise<Cart | null>

  /**
   * Find cart by customer
   */
  findByCustomer(storeId: string, customerId: string, trx?: any): Promise<Cart | null>

  /**
   * Find cart by session
   */
  findBySession(storeId: string, sessionId: string, trx?: any): Promise<Cart | null>

  /**
   * Find or create cart for customer
   */
  findOrCreateByCustomer(storeId: string, customerId: string): Promise<Cart>

  /**
   * Find or create cart for session
   */
  findOrCreateBySession(storeId: string, sessionId: string): Promise<Cart>

  /**
   * Create new cart
   */
  create(data: CreateCartData, trx?: any): Promise<Cart>

  /**
   * Update cart
   */
  update(cart: Cart, data: UpdateCartData, trx?: any): Promise<Cart>

  /**
   * Delete cart
   */
  delete(id: string, trx?: any): Promise<void>

  /**
   * Mark cart as completed
   */
  markCompleted(id: string, trx?: any): Promise<void>

  /**
   * Get active (incomplete) carts
   */
  getActiveCarts(storeId: string, page?: number, limit?: number): Promise<ModelPaginatorContract<Cart>>

  /**
   * Get abandoned carts (older than X hours)
   */
  getAbandonedCarts(storeId: string, hoursOld: number = 24): Promise<Cart[]>

  /**
   * Execute callback within a transaction
   */
  transaction<T>(callback: TransactionCallback<T>): Promise<T>

  /**
   * Clear cart (remove all items)
   */
  clearItems(cartId: string, trx?: any): Promise<void>
}
