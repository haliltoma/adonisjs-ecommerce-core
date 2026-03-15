/**
 * Order Item Factory
 *
 * Responsible for creating order items from cart items.
 * Single Responsibility: Convert cart items to order items.
 */

import OrderItem from '#models/order_item'
import { DateTime } from 'luxon'

export interface CreateOrderItemData {
  orderId: string
  productId: string
  variantId?: string
  sku: string
  title: string
  variantTitle?: string
  quantity: number
  unitPrice: number
  discountAmount: number
  taxAmount: number
  totalPrice: number
  weight?: number | null
  thumbnailUrl?: string | null
  properties?: Record<string, any>
}

export interface CartItemData {
  productId: string
  variantId?: string
  sku?: string
  title: string
  variant?: { title?: string } | null
  quantity: number
  unitPrice: number
  discountAmount?: number
  totalPrice: number
  metadata?: Record<string, any>
  product?: {
    weight?: number
    images?: Array<{ url?: string }>
  } | null
}

export default class OrderItemFactory {
  /**
   * Create order item from cart item
   */
  async createFromCartItem(
    orderId: string,
    cartItem: CartItemData,
    trx?: any
  ): Promise<OrderItem> {
    return await OrderItem.create(
      {
        orderId,
        productId: cartItem.productId,
        variantId: cartItem.variantId,
        sku: cartItem.sku || '',
        title: cartItem.title,
        variantTitle: cartItem.variant?.title,
        quantity: cartItem.quantity,
        unitPrice: cartItem.unitPrice,
        discountAmount: Number(cartItem.discountAmount || 0),
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

  /**
   * Create multiple order items from cart items
   */
  async createFromCartItems(
    orderId: string,
    cartItems: CartItemData[],
    trx?: any
  ): Promise<OrderItem[]> {
    const orderItems: OrderItem[] = []

    for (const cartItem of cartItems) {
      const orderItem = await this.createFromCartItem(orderId, cartItem, trx)
      orderItems.push(orderItem)
    }

    return orderItems
  }
}
