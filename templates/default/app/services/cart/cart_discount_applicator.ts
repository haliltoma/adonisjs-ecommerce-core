/**
 * Cart Discount Applicator
 *
 * Responsible for applying and validating discounts on cart.
 * Single Responsibility: Apply discount codes to cart.
 */

import type { Cart } from '@adonisjs/lucid/types/model'

export interface DiscountResult {
  success: boolean
  discountId?: string | null
  couponCode?: string | null
  discountTotal: number
  message?: string
}

export default class CartDiscountApplicator {
  /**
   * Apply discount code to cart
   */
  async applyDiscount(
    cart: Cart,
    couponCode: string,
    discountService: any // Will be injected
  ): Promise<DiscountResult> {
    try {
      // Validate cart state
      if (!cart.id) {
        return {
          success: false,
          discountTotal: 0,
          message: 'Cart must be saved before applying discount',
        }
      }

      if (cart.items.length === 0) {
        return {
          success: false,
          discountTotal: 0,
          message: 'Cannot apply discount to empty cart',
        }
      }

      // Get discount from discount service
      const discount = await discountService.findByCode(couponCode, cart.storeId)

      if (!discount) {
        return {
          success: false,
          discountTotal: 0,
          message: 'Invalid discount code',
        }
      }

      // Check if discount is active
      if (!discount.isActive || discount.status !== 'active') {
        return {
          success: false,
          discountTotal: 0,
          message: 'Discount is not active',
        }
      }

      // Check dates
      const now = new Date()
      if (discount.startsAt && new Date(discount.startsAt) > now) {
        return {
          success: false,
          discountTotal: 0,
          message: 'Discount has not started yet',
        }
      }

      if (discount.endsAt && new Date(discount.endsAt) < now) {
        return {
          success: false,
          discountTotal: 0,
          message: 'Discount has expired',
        }
      }

      // Build validation context
      const context = await this.buildValidationContext(cart, discountService)

      // Validate discount
      const validationResult = await discountService.validate(discount, context)

      if (!validationResult.valid) {
        return {
          success: false,
          discountTotal: 0,
          message: validationResult.message || 'Discount not applicable',
        }
      }

      // Calculate discount amount
      const discountTotal = await this.calculateDiscountAmount(
        cart,
        discount,
        discountService
      )

      return {
        success: true,
        discountId: discount.id,
        couponCode: discount.couponCode,
        discountTotal,
        message: 'Discount applied successfully',
      }
    } catch (error) {
      return {
        success: false,
        discountTotal: 0,
        message: (error as Error).message,
      }
    }
  }

  /**
   * Remove discount from cart
   */
  removeDiscount(cart: Cart): void {
    cart.couponCode = null
    cart.discountId = null
    cart.discountTotal = 0
  }

  /**
   * Build validation context for discount
   */
  private async buildValidationContext(
    cart: Cart,
    discountService: any
  ): Promise<any> {
    return await discountService.buildContextFromCart(cart)
  }

  /**
   * Calculate discount amount
   */
  private async calculateDiscountAmount(
    cart: Cart,
    discount: any,
    discountService: any
  ): Promise<number> {
    const subtotal = cart.subtotal || 0

    if (discount.type === 'percentage') {
      const discountAmount = (subtotal * discount.value) / 100

      // Apply max discount if set
      if (discount.maxDiscountAmount) {
        return Math.min(discountAmount, discount.maxDiscountAmount)
      }

      return discountAmount
    }

    if (discount.type === 'fixed') {
      return Math.min(discount.value, subtotal)
    }

    return 0
  }
}
