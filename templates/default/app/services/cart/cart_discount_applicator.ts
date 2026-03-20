/**
 * Cart Discount Applicator
 *
 * Responsible for applying and validating discounts on cart.
 * Single Responsibility: Apply discount codes to cart.
 */

import type { Cart } from '#models/cart'

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
   * Uses DiscountService.validateAndApply which handles all validation logic
   */
  async applyDiscount(
    cart: Cart,
    couponCode: string,
    discountService: any
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

      // Check if coupon is already applied to prevent double discount
      if (cart.couponCode && cart.couponCode.toLowerCase() === couponCode.toLowerCase()) {
        return {
          success: false,
          discountTotal: cart.discountTotal || 0,
          couponCode: cart.couponCode,
          message: 'This coupon is already applied to your cart',
        }
      }

      // Delegate to DiscountService for validation and calculation
      const validationResult = await discountService.validateAndApply(
        cart.storeId,
        couponCode,
        cart
      )

      if (!validationResult.valid) {
        return {
          success: false,
          discountTotal: 0,
          message: validationResult.error || 'Discount not applicable',
        }
      }

      return {
        success: true,
        discountId: validationResult.discount?.id || null,
        couponCode: validationResult.discount?.couponCode || couponCode.toUpperCase(),
        discountTotal: validationResult.discountAmount,
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
}
