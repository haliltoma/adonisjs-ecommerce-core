/**
 * MoneyHelper
 *
 * Utility class for handling monetary values and currency formatting.
 * Avoids floating point errors by working with cents internally.
 */
export class MoneyHelper {
  private defaultCurrency = 'USD'
  private defaultLocale = 'en-US'

  /**
   * Format amount as currency string
   */
  format(
    amount: number,
    options: {
      currency?: string
      locale?: string
      showSymbol?: boolean
      showCode?: boolean
    } = {}
  ): string {
    const currency = options.currency || this.defaultCurrency
    const locale = options.locale || this.defaultLocale

    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })

    let formatted = formatter.format(amount)

    if (options.showCode) {
      formatted = `${formatted} ${currency}`
    }

    return formatted
  }

  /**
   * Convert amount to cents (integer)
   */
  toCents(amount: number): number {
    return Math.round(amount * 100)
  }

  /**
   * Convert cents to amount (decimal)
   */
  fromCents(cents: number): number {
    return cents / 100
  }

  /**
   * Add two monetary values
   */
  add(a: number, b: number): number {
    const centsA = this.toCents(a)
    const centsB = this.toCents(b)
    return this.fromCents(centsA + centsB)
  }

  /**
   * Subtract two monetary values
   */
  subtract(a: number, b: number): number {
    const centsA = this.toCents(a)
    const centsB = this.toCents(b)
    return this.fromCents(centsA - centsB)
  }

  /**
   * Multiply amount by quantity
   */
  multiply(amount: number, quantity: number): number {
    const cents = this.toCents(amount)
    return this.fromCents(Math.round(cents * quantity))
  }

  /**
   * Divide amount
   */
  divide(amount: number, divisor: number): number {
    if (divisor === 0) {
      throw new Error('Cannot divide by zero')
    }
    const cents = this.toCents(amount)
    return this.fromCents(Math.round(cents / divisor))
  }

  /**
   * Calculate percentage of amount
   */
  percentage(amount: number, percent: number): number {
    const cents = this.toCents(amount)
    return this.fromCents(Math.round((cents * percent) / 100))
  }

  /**
   * Apply discount to amount
   */
  applyDiscount(
    amount: number,
    discount: { type: 'percentage' | 'fixed_amount'; value: number }
  ): number {
    if (discount.type === 'percentage') {
      const discountAmount = this.percentage(amount, discount.value)
      return this.subtract(amount, discountAmount)
    }
    return this.subtract(amount, discount.value)
  }

  /**
   * Calculate discount amount
   */
  calculateDiscount(
    amount: number,
    discount: { type: 'percentage' | 'fixed_amount'; value: number }
  ): number {
    if (discount.type === 'percentage') {
      return this.percentage(amount, discount.value)
    }
    return Math.min(discount.value, amount)
  }

  /**
   * Round to nearest currency unit
   */
  round(amount: number, precision: number = 2): number {
    const factor = Math.pow(10, precision)
    return Math.round(amount * factor) / factor
  }

  /**
   * Check if amounts are equal (within floating point tolerance)
   */
  equals(a: number, b: number): boolean {
    return this.toCents(a) === this.toCents(b)
  }

  /**
   * Get minimum of amounts
   */
  min(...amounts: number[]): number {
    return Math.min(...amounts)
  }

  /**
   * Get maximum of amounts
   */
  max(...amounts: number[]): number {
    return Math.max(...amounts)
  }

  /**
   * Sum array of amounts
   */
  sum(amounts: number[]): number {
    return amounts.reduce((total, amount) => this.add(total, amount), 0)
  }

  /**
   * Calculate average of amounts
   */
  average(amounts: number[]): number {
    if (amounts.length === 0) return 0
    return this.divide(this.sum(amounts), amounts.length)
  }

  /**
   * Convert between currencies
   */
  convert(
    amount: number,
    fromRate: number,
    toRate: number
  ): number {
    // Convert to base currency, then to target
    const baseAmount = this.divide(amount, fromRate)
    return this.multiply(baseAmount, toRate)
  }

  /**
   * Parse currency string to number
   */
  parse(value: string): number {
    // Remove currency symbols and thousands separators
    const cleaned = value.replace(/[^0-9.-]/g, '')
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? 0 : this.round(parsed)
  }

  /**
   * Check if amount is positive
   */
  isPositive(amount: number): boolean {
    return amount > 0
  }

  /**
   * Check if amount is negative
   */
  isNegative(amount: number): boolean {
    return amount < 0
  }

  /**
   * Check if amount is zero
   */
  isZero(amount: number): boolean {
    return this.toCents(amount) === 0
  }

  /**
   * Get absolute value
   */
  abs(amount: number): number {
    return Math.abs(amount)
  }
}

// Singleton instance
export const money = new MoneyHelper()

// Utility functions for direct use
export function formatMoney(amount: number, currency?: string): string {
  return money.format(amount, { currency })
}

export function toCents(amount: number): number {
  return money.toCents(amount)
}

export function fromCents(cents: number): number {
  return money.fromCents(cents)
}
