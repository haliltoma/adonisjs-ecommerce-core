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
    return items.reduce((sum, item) => {
      const unitPrice = Number(item.unitPrice || 0)
      const quantity = Number(item.quantity || 0)
      const discountAmount = Number(item.discountAmount || 0)
      return sum + (unitPrice * quantity) - discountAmount
    }, 0)
  }

  /**
   * Calculate grand total
   */
  calculateGrandTotal(totals: {
    subtotal: number
    discountTotal: number
    taxTotal: number
    shippingTotal: number
  }): number {
    const { subtotal, discountTotal, taxTotal, shippingTotal } = totals

    return Math.max(0, subtotal - discountTotal + taxTotal + shippingTotal)
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
