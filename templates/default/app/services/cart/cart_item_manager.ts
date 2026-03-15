/**
 * Cart Item Manager
 *
 * Responsible for managing cart items.
 * Single Responsibility: Add, update, and remove cart items.
 */

import type { Cart } from '@adonisjs/lucid/types/model'
import CartItem from '#models/cart_item'
import Product from '#models/product'
import ProductVariant from '#models/product_variant'

export interface AddItemData {
  productId: string
  variantId?: string
  quantity: number
  metadata?: Record<string, any>
}

export default class CartItemManager {
  /**
   * Add item to cart
   */
  async addItem(
    cart: Cart,
    data: AddItemData,
    productRepository: any,
    trx?: any
  ): Promise<CartItem> {
    // Validate product exists
    const product = await productRepository.findById(data.productId)

    if (!product) {
      throw new Error('Product not found')
    }

    if (product.status !== 'active') {
      throw new Error('Product is not available')
    }

    // Get variant if specified
    let variant: ProductVariant | null = null

    if (data.variantId) {
      variant = await ProductVariant.find(data.variantId)

      if (!variant || variant.productId !== product.id) {
        throw new Error('Invalid product variant')
      }

      if (variant.quantityAvailable !== null && variant.quantityAvailable < data.quantity) {
        throw new Error('Insufficient stock')
      }
    } else if (
      product.trackQuantity &&
      (product.quantityAvailable || 0) < data.quantity
    ) {
      throw new Error('Insufficient stock')
    }

    // Check if item already exists in cart
    const existingItem = cart.items.find(
      (item) =>
        item.productId === data.productId && item.variantId === data.variantId
    )

    if (existingItem) {
      // Update quantity of existing item
      return await this.updateItemQuantity(
        cart,
        existingItem,
        existingItem.quantity + data.quantity,
        trx
      )
    }

    // Create new cart item
    return await CartItem.create(
      {
        cartId: cart.id,
        productId: product.id,
        variantId: data.variantId,
        sku: variant?.sku || product.sku || '',
        title: product.title,
        variantTitle: variant?.title,
        quantity: data.quantity,
        unitPrice: variant?.price || product.price || 0,
        totalPrice: 0, // Will be recalculated
        weight: product.weight,
        metadata: data.metadata || {},
        discountAmount: 0,
      },
      { client: trx }
    )
  }

  /**
   * Update item quantity
   */
  async updateItemQuantity(
    cart: Cart,
    item: CartItem,
    newQuantity: number,
    trx?: any
  ): Promise<CartItem> {
    if (newQuantity <= 0) {
      return await this.removeItem(cart, item, trx)
    }

    // Check stock availability
    const product = await Product.find(item.productId)

    if (product && product.trackQuantity) {
      const availableQuantity = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)?.quantityAvailable
        : product.quantityAvailable

      if (availableQuantity !== null && availableQuantity < newQuantity) {
        throw new Error('Insufficient stock')
      }
    }

    // Update quantity
    item.quantity = newQuantity
    item.totalPrice = item.quantity * item.unitPrice - (item.discountAmount || 0)

    await item.save(trx ? { client: trx } : undefined)

    return item
  }

  /**
   * Remove item from cart
   */
  async removeItem(cart: Cart, item: CartItem, trx?: any): Promise<void> {
    await item.delete(trx ? { client: trx } : undefined)
  }

  /**
   * Clear all items from cart
   */
  async clearItems(cart: Cart, trx?: any): Promise<void> {
    for (const item of cart.items) {
      await this.removeItem(cart, item, trx)
    }
  }

  /**
   * Merge items from guest cart to customer cart
   */
  async mergeItems(
    sourceCart: Cart,
    targetCart: Cart,
    trx?: any
  ): Promise<void> {
    for (const sourceItem of sourceCart.items) {
      const targetItem = targetCart.items.find(
        (item) =>
          item.productId === sourceItem.productId &&
          item.variantId === sourceItem.variantId
      )

      if (targetItem) {
        // Update quantity
        await this.updateItemQuantity(
          targetCart,
          targetItem,
          targetItem.quantity + sourceItem.quantity,
          trx
        )
      } else {
        // Add item to target cart
        await CartItem.create(
          {
            cartId: targetCart.id,
            productId: sourceItem.productId,
            variantId: sourceItem.variantId,
            sku: sourceItem.sku,
            title: sourceItem.title,
            variantTitle: sourceItem.variantTitle,
            quantity: sourceItem.quantity,
            unitPrice: sourceItem.unitPrice,
            totalPrice: sourceItem.totalPrice,
            weight: sourceItem.weight,
            metadata: sourceItem.metadata,
            discountAmount: sourceItem.discountAmount,
          },
          { client: trx }
        )
      }
    }
  }
}
