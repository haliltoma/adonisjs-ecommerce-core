/**
 * Cart Totals Calculator
 *
 * Responsible for calculating cart totals.
 * Single Responsibility: Calculate cart totals (subtotal, grand total).
 */

import type { CartItem } from '#models/cart'

export interface CartTotals {
  subtotal: number
  discountTotal: number
  taxTotal: number
  shippingTotal: number
  grandTotal: number
}

export default class CartTotalsCalculator {
  /**
   * Calculate subtotal from cart items
   * HARDENED: iter-2 - Always recalculate from unitPrice * quantity to prevent client-side price manipulation
   */
  calculateSubtotal(items: CartItem[]): number {
    // CRITICAL: Always use unitPrice * quantity, never trust client-provided totalPrice
    // Use Math.round to avoid floating point precision issues
    return items.reduce((sum, item) => {
      const unitPrice = Math.round(Number(item.unitPrice || 0) * 100) / 100
      const quantity = Number(item.quantity || 0)
      const discountAmount = Math.round(Number(item.discountAmount || 0) * 100) / 100
      const itemTotal = Math.round((unitPrice * quantity - discountAmount) * 100) / 100
      return sum + itemTotal
    }, 0)
  }

  /**
   * Calculate grand total
   * Use Math.round to prevent floating point precision issues
   */
  calculateGrandTotal(totals: {
    subtotal: number
    discountTotal: number
    taxTotal: number
    shippingTotal: number
  }): number {
    const { subtotal, discountTotal, taxTotal, shippingTotal } = totals

    // Calculate with proper rounding at each step
    const afterDiscount = Math.round((subtotal - discountTotal) * 100) / 100
    const afterTax = Math.round((afterDiscount + taxTotal) * 100) / 100
    const final = Math.round((afterTax + shippingTotal) * 100) / 100

    return Math.max(0, final)
  }

  /**
   * Calculate discount percentage
   */
  calculateDiscountPercentage(
    subtotal: number,
    discountTotal: number
  ): number {
    if (subtotal === 0) return 0

    return Math.round((discountTotal / subtotal) * 100)
  }

  /**
   * Round monetary value to 2 decimal places
   */
  round(value: number): number {
    return Math.round(value * 100) / 100
  }

  /**
   * Calculate all totals
   */
  calculateAll(
    items: CartItem[],
    discountTotal: number,
    taxTotal: number,
    shippingTotal: number
  ): CartTotals {
    const subtotal = this.round(this.calculateSubtotal(items))
    const grandTotal = this.round(
      this.calculateGrandTotal({
        subtotal,
        discountTotal: this.round(discountTotal),
        taxTotal: this.round(taxTotal),
        shippingTotal: this.round(shippingTotal),
      })
    )

    return {
      subtotal,
      discountTotal: this.round(discountTotal),
      taxTotal: this.round(taxTotal),
      shippingTotal: this.round(shippingTotal),
      grandTotal,
    }
  }
}
