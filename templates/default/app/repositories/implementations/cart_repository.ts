/**
 * Cart Repository Implementation
 *
 * Concrete implementation of cart data access using Lucid ORM.
 */

import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Cart from '#models/cart'
import type ICartRepository, {
  CreateCartData,
  UpdateCartData,
  TransactionCallback,
} from '../interfaces/i_cart_repository'

export default class CartRepository implements ICartRepository {
  /**
   * Find cart by ID
   */
  async findById(id: string, trx?: any): Promise<Cart> {
    const query = Cart.query(trx ? { client: trx } : undefined)
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('product').preload('variant')
      })

    return await query.where('id', id).first()
  }

  /**
   * Find cart by customer
   */
  async findByCustomer(storeId: string, customerId: string, trx?: any): Promise<Cart> {
    const query = Cart.query(trx ? { client: trx } : undefined)

    return await query
      .where('storeId', storeId)
      .where('customerId', customerId)
      .whereNull('completedAt')
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('product').preload('variant')
      })
      .first()
  }

  /**
   * Find cart by session
   */
  async findBySession(storeId: string, sessionId: string, trx?: any): Promise<Cart> {
    const query = Cart.query(trx ? { client: trx } : undefined)

    return await query
      .where('storeId', storeId)
      .where('sessionId', sessionId)
      .whereNull('completedAt')
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('product').preload('variant')
      })
      .first()
  }

  /**
   * Find or create cart for customer
   */
  async findOrCreateByCustomer(storeId: string, customerId: string): Promise<Cart> {
    let cart = await this.findByCustomer(storeId, customerId)

    if (!cart) {
      cart = await this.create({
        storeId,
        customerId,
        currencyCode: 'USD', // Default from store config
      })
    }

    return cart
  }

  /**
   * Find or create cart for session
   */
  async findOrCreateBySession(storeId: string, sessionId: string): Promise<Cart> {
    let cart = await this.findBySession(storeId, sessionId)

    if (!cart) {
      cart = await this.create({
        storeId,
        sessionId,
        currencyCode: 'USD', // Default from store config
      })
    }

    return cart
  }

  /**
   * Create new cart
   */
  async create(data: CreateCartData, trx?: any): Promise<Cart> {
    return await Cart.create(data, trx ? { client: trx } : undefined)
  }

  /**
   * Update cart
   */
  async update(cartId: string, data: UpdateCartData, trx?: any): Promise<void> {
    const updateData: any = {
      subtotal: data.subtotal ?? 0,
      discount_total: data.discountTotal ?? 0,
      tax_total: data.taxTotal ?? 0,
      shipping_total: data.shippingTotal ?? 0,
      grand_total: data.grandTotal ?? 0,
      total_items: data.totalItems ?? 0,
      updated_at: DateTime.now().toSQL(),
    }

    // Only update optional fields if they are provided
    if (data.couponCode !== undefined) updateData.coupon_code = data.couponCode
    if (data.discountId !== undefined) updateData.discount_id = data.discountId
    if (data.shippingAddressId !== undefined) updateData.shipping_address_id = data.shippingAddressId
    if (data.billingAddressId !== undefined) updateData.billing_address_id = data.billingAddressId
    if (data.shippingMethod !== undefined) updateData.shipping_method = data.shippingMethod
    if (data.paymentMethod !== undefined) updateData.payment_method = data.paymentMethod

    const query = trx ? trx.from('carts') : db.from('carts')
    await query.where('id', cartId).update(updateData)
  }

  /**
   * Delete cart
   */
  async delete(id: string, trx?: any): Promise<void> {
    const cart = await this.findById(id, trx)
    if (cart) {
      await cart.delete(trx ? { client: trx } : undefined)
    }
  }

  /**
   * Mark cart as completed
   */
  async markCompleted(id: string, trx?: any): Promise<void> {
    await db.from('carts')
      .where('id', id)
      .update({
        completedAt: DateTime.now().toSQL(),
        updatedAt: DateTime.now().toSQL(),
      })
  }

  /**
   * Get active (incomplete) carts
   */
  async getActiveCarts(
    storeId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    return await Cart.query()
      .where('storeId', storeId)
      .whereNull('completedAt')
      .orderBy('updatedAt', 'desc')
      .paginate(page, limit)
  }

  /**
   * Get abandoned carts (older than X hours)
   */
  async getAbandonedCarts(storeId: string, hoursOld: number = 24): Promise<Cart[]> {
    const cutoffDate = DateTime.now().minus({ hours: hoursOld })

    return await Cart.query()
      .where('storeId', storeId)
      .whereNull('completedAt')
      .where('updatedAt', '<', cutoffDate.toSQL())
      .preload('items')
      .orderBy('updatedAt', 'desc')
  }

  /**
   * Execute callback within a transaction
   */
  async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
    return await db.transaction(callback)
  }

  /**
   * Clear cart (remove all items)
   */
  async clearItems(cartId: string, trx?: any): Promise<void> {
    await CartItem.query({ client: trx }).where('cartId', cartId).delete()
  }
}
