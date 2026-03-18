/**
 * Cart Service (Refactored)
 *
 * Orchestrates cart-related operations following SOLID principles.
 * Depends on abstractions (repositories) and delegates specific tasks to specialized classes.
 */

import Cart from '#models/cart'
import { DateTime } from 'luxon'
import type ICartRepository from '#repositories/interfaces/i_cart_repository'
import type IProductRepository from '#repositories/interfaces/i_product_repository'
import CartTotalsCalculator from '#services/cart/cart_totals_calculator'
import CartDiscountApplicator from '#services/cart/cart_discount_applicator'
import CartTaxCalculator from '#services/cart/cart_tax_calculator'
import CartItemManager from '#services/cart/cart_item_manager'
import CartValidator from '#services/cart/cart_validator'

interface AddToCartDTO {
  productId: string
  variantId?: string
  quantity: number
  metadata?: Record<string, unknown>
}

interface UpdateCartItemDTO {
  quantity: number
  metadata?: Record<string, unknown>
}

export default class CartService {
  constructor(
    private cartRepository: ICartRepository,
    private productRepository: IProductRepository,
    private totalsCalculator: CartTotalsCalculator,
    private discountApplicator: CartDiscountApplicator,
    private taxCalculator: CartTaxCalculator,
    private itemManager: CartItemManager,
    private validator: CartValidator,
    private discountService: any // Will be injected via container
  ) {}

  /**
   * Get or create cart for customer or session (SRP: Orchestrate)
   */
  async getOrCreateCart(
    storeId: string,
    customerId?: string,
    sessionId?: string
  ): Promise<Cart> {
    let cart: Cart | null = null

    if (customerId) {
      cart = await this.cartRepository.findByCustomer(storeId, customerId)
    } else if (sessionId) {
      cart = await this.cartRepository.findBySession(storeId, sessionId)
    }

    if (!cart) {
      cart = await this.cartRepository.create({
        storeId,
        customerId,
        sessionId,
        currencyCode: 'USD',
        discountTotal: 0,
        taxTotal: 0,
        shippingTotal: 0,
        grandTotal: 0,
        totalItems: 0,
        metadata: {},
      })
    }

    return cart
  }

  /**
   * Add item to cart
   */
  async addItem(cartId: string, data: AddToCartDTO): Promise<Cart> {
    return await this.cartRepository.transaction(async (trx) => {
      const cart = await this.cartRepository.findById(cartId, trx)

      if (!cart) {
        throw new Error('Cart not found')
      }

      // Load cart items for existing item check
      await cart.load('items')

      // Add item using item manager
      await this.itemManager.addItem(cart, data, this.productRepository, trx)

      // Recalculate cart totals
      await this.recalculateCart(cart, trx)

      return await this.cartRepository.findById(cartId, trx)
    })
  }

  /**
   * Update cart item
   */
  async updateItem(
    cartId: string,
    itemId: string,
    data: UpdateCartItemDTO
  ): Promise<Cart> {
    return await this.cartRepository.transaction(async (trx) => {
      const cart = await this.cartRepository.findById(cartId, trx)

      if (!cart) {
        throw new Error('Cart not found')
      }

      // Load cart items
      await cart.load('items')

      const item = cart.items.find((i) => i.id === itemId)

      if (!item) {
        throw new Error('Cart item not found')
      }

      // Update quantity
      await this.itemManager.updateItemQuantity(cart, item, data.quantity, trx)

      // Update metadata if provided
      if (data.metadata) {
        item.metadata = { ...item.metadata, ...data.metadata }
        await item.save(trx ? { client: trx } : undefined)
      }

      // Recalculate cart totals
      await this.recalculateCart(cart, trx)

      return await this.cartRepository.findById(cartId, trx)
    })
  }

  /**
   * Remove item from cart
   */
  async removeItem(cartId: string, itemId: string): Promise<Cart> {
    return await this.cartRepository.transaction(async (trx) => {
      const cart = await this.cartRepository.findById(cartId, trx)

      if (!cart) {
        throw new Error('Cart not found')
      }

      // Load cart items
      await cart.load('items')

      const item = cart.items.find((i) => i.id === itemId)

      if (!item) {
        throw new Error('Cart item not found')
      }

      // Remove item
      await this.itemManager.removeItem(cart, item, trx)

      // Recalculate cart totals
      await this.recalculateCart(cart, trx)

      return cart
    })
  }

  /**
   * Apply discount code to cart
   */
  async applyDiscount(cartId: string, couponCode: string): Promise<Cart> {
    return await this.cartRepository.transaction(async (trx) => {
      const cart = await this.cartRepository.findById(cartId, trx)

      if (!cart) {
        throw new Error('Cart not found')
      }

      // Load cart items for discount calculation
      await cart.load('items')

      // Validate coupon code format
      const validationResult = this.validator.validateCouponCode(couponCode)

      if (!validationResult.valid) {
        throw new Error(validationResult.errors.join(', '))
      }

      // Apply discount
      const result = await this.discountApplicator.applyDiscount(
        cart,
        couponCode,
        this.discountService
      )

      if (!result.success) {
        throw new Error(result.message || 'Failed to apply discount')
      }

      // Update cart with discount
      await this.cartRepository.update(
        cart.id,
        {
          couponCode: result.couponCode,
          discountId: result.discountId,
          discountTotal: result.discountTotal,
        },
        trx
      )

      // Recalculate cart totals
      await this.recalculateCart(cart, trx)

      return await this.cartRepository.findById(cartId, trx)
    })
  }

  /**
   * Remove discount from cart
   */
  async removeDiscount(cartId: string): Promise<Cart> {
    return await this.cartRepository.transaction(async (trx) => {
      const cart = await this.cartRepository.findById(cartId, trx)

      if (!cart) {
        throw new Error('Cart not found')
      }

      // Load cart items
      await cart.load('items')

      // Remove discount
      this.discountApplicator.removeDiscount(cart)

      await this.cartRepository.update(
        cart.id,
        {
          couponCode: null,
          discountId: null,
          discountTotal: 0,
        },
        trx
      )

      // Recalculate cart totals
      await this.recalculateCart(cart, trx)

      return await this.cartRepository.findById(cartId, trx)
    })
  }

  /**
   * Recalculate cart totals (SRP: Orchestrate calculation)
   */
  async recalculateCart(cart: Cart, trx?: any): Promise<void> {
    // Reload cart items to get latest data
    await cart.load('items')

    // Calculate subtotal
    const subtotal = this.totalsCalculator.calculateSubtotal(cart.items)

    // Calculate tax (if tax service available)
    let taxTotal = 0

    try {
      const taxResult = await this.taxCalculator.calculateTax(
        cart,
        subtotal,
        cart.discountTotal || 0,
        {} // Pass tax service if available
      )

      taxTotal = taxResult.taxTotal
    } catch (error) {
      // If tax calculation fails, use zero tax
      taxTotal = 0
    }

    // Calculate grand total - ensure discountTotal is not negative to prevent calculation errors
    const discountTotal = Math.max(0, Number(cart.discountTotal) || 0)
    const shippingTotal = Math.max(0, Number(cart.shippingTotal) || 0)

    const grandTotal = this.totalsCalculator.calculateGrandTotal({
      subtotal,
      discountTotal,
      taxTotal,
      shippingTotal,
    })

    // Update cart - also reset discountTotal and shippingTotal if they're negative
    await this.cartRepository.update(
      cart.id,
      {
        subtotal,
        discountTotal: discountTotal,
        shippingTotal: shippingTotal,
        taxTotal,
        grandTotal,
        totalItems: cart.items.reduce((sum, item) => sum + item.quantity, 0),
      },
      trx
    )
  }

  /**
   * Clear cart (remove all items)
   */
  async clearCart(cartId: string): Promise<void> {
    await this.cartRepository.transaction(async (trx) => {
      const cart = await this.cartRepository.findById(cartId, trx)

      if (!cart) {
        throw new Error('Cart not found')
      }

      // Clear all items
      await this.cartRepository.clearItems(cartId, trx)

      // Reset totals
      await this.cartRepository.update(
        cart.id,
        {
          discountTotal: 0,
          taxTotal: 0,
          shippingTotal: 0,
          grandTotal: 0,
          totalItems: 0,
          couponCode: null,
          discountId: null,
        },
        trx
      )
    })
  }

  /**
   * Validate cart for checkout
   */
  async validateForCheckout(cartId: string): Promise<{
    valid: boolean
    errors: string[]
  }> {
    const cart = await this.cartRepository.findById(cartId)

    if (!cart) {
      return {
        valid: false,
        errors: ['Cart not found'],
      }
    }

    // Reload items
    await cart.load('items')

    return await this.validator.validateForCheckout(cart)
  }

  /**
   * Merge guest cart into customer cart
   */
  async mergeCarts(
    sourceCartId: string,
    targetCartId: string
  ): Promise<Cart> {
    return await this.cartRepository.transaction(async (trx) => {
      const sourceCart = await this.cartRepository.findById(sourceCartId, trx)
      const targetCart = await this.cartRepository.findById(targetCartId, trx)

      if (!sourceCart || !targetCart) {
        throw new Error('One or both carts not found')
      }

      // Load cart items for merging
      await sourceCart.load('items')
      await targetCart.load('items')

      // Merge items
      await this.itemManager.mergeItems(sourceCart, targetCart, trx)

      // Recalculate target cart
      await this.recalculateCart(targetCart, trx)

      // Delete source cart
      await this.cartRepository.delete(sourceCartId, trx)

      return await this.cartRepository.findById(targetCartId, trx)
    })
  }

  /**
   * Merge guest cart into customer cart after login/register
   * Convenience method that finds carts by session/customer and merges them
   */
  async mergeGuestCart(sessionId: string, customerId: string, storeId: string): Promise<Cart> {
    // Find guest cart by session
    const guestCart = await this.cartRepository.findBySession(storeId, sessionId)

    if (!guestCart) {
      // No guest cart to merge, return customer's active cart
      const customerCart = await this.cartRepository.findByCustomer(storeId, customerId)
      return customerCart || await this.getOrCreateCart(storeId, customerId)
    }

    // Find or create customer cart
    let customerCart = await this.cartRepository.findByCustomer(storeId, customerId)
    if (!customerCart) {
      customerCart = await this.getOrCreateCart(storeId, customerId)
    }

    // Merge guest cart into customer cart
    return await this.mergeCarts(guestCart.id, customerCart.id)
  }

  /**
   * Get cart by ID
   */
  async findById(cartId: string): Promise<Cart> {
    return await this.cartRepository.findById(cartId)
  }

  /**
   * Get active carts for store
   */
  async getActiveCarts(storeId: string, page: number = 1, limit: number = 20) {
    return await this.cartRepository.getActiveCarts(storeId, page, limit)
  }

  /**
   * Get abandoned carts
   */
  async getAbandonedCarts(storeId: string, hoursOld: number = 24) {
    return await this.cartRepository.getAbandonedCarts(storeId, hoursOld)
  }
}
