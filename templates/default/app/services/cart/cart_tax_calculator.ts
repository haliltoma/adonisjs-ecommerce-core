/**
 * Cart Tax Calculator
 *
 * Responsible for calculating taxes on cart.
 * Single Responsibility: Calculate cart taxes.
 */

import type { Cart } from '@adonisjs/lucid/types/model'

export interface TaxCalculationResult {
  taxTotal: number
  taxBreakdown: Array<{
    name: string
    rate: number
    amount: number
  }>
}

export default class CartTaxCalculator {
  /**
   * Calculate tax for cart
   */
  async calculateTax(
    cart: Cart,
    subtotal: number,
    discountTotal: number,
    taxService: any // Will be injected
  ): Promise<TaxCalculationResult> {
    try {
      // Taxable amount (subtotal - discounts)
      const taxableAmount = Math.max(0, subtotal - discountTotal)

      if (taxableAmount === 0) {
        return {
          taxTotal: 0,
          taxBreakdown: [],
        }
      }

      // Get tax rate for cart
      const taxRate = await this.getTaxRate(cart, taxService)

      if (taxRate === 0) {
        return {
          taxTotal: 0,
          taxBreakdown: [],
        }
      }

      // Calculate tax amount
      const taxTotal = (taxableAmount * taxRate) / 100

      return {
        taxTotal: this.round(taxTotal),
        taxBreakdown: [
          {
            name: 'Tax',
            rate: taxRate,
            amount: this.round(taxTotal),
          },
        ],
      }
    } catch (error) {
      // On error, return zero tax
      return {
        taxTotal: 0,
        taxBreakdown: [],
      }
    }
  }

  /**
   * Get tax rate for cart
   */
  private async getTaxRate(cart: Cart, taxService: any): Promise<number> {
    // Get shipping address for tax calculation
    const shippingAddress = cart.shippingAddress || cart.billingAddress

    if (!shippingAddress) {
      return 0
    }

    // Get tax rate from tax service based on location
    try {
      const taxRate = await taxService.getRateForLocation({
        country: shippingAddress.country,
        state: shippingAddress.state,
        city: shippingAddress.city,
        postalCode: shippingAddress.postalCode,
      })

      return taxRate || 0
    } catch (error) {
      return 0
    }
  }

  /**
   * Round monetary value to 2 decimal places
   */
  private round(value: number): number {
    return Math.round(value * 100) / 100
  }
}
