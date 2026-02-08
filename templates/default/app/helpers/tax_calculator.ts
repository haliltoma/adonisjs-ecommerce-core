import TaxRate from '#models/tax_rate'
import TaxClass from '#models/tax_class'
import { money } from './money.js'

interface TaxAddress {
  country: string
  state?: string
  city?: string
  postalCode?: string
}

interface TaxLineItem {
  amount: number
  quantity: number
  taxClassId?: string
  isTaxable?: boolean
}

interface TaxResult {
  subtotal: number
  taxAmount: number
  total: number
  taxRate: number
  breakdown: TaxBreakdown[]
}

interface TaxBreakdown {
  name: string
  rate: number
  amount: number
}

/**
 * TaxCalculator
 *
 * Calculates taxes based on address and tax rules.
 * Supports multiple tax rates, tax classes, and compound taxes.
 */
export class TaxCalculator {
  private pricesIncludeTax = false

  /**
   * Set whether prices include tax
   */
  setPricesIncludeTax(include: boolean): this {
    this.pricesIncludeTax = include
    return this
  }

  /**
   * Set default tax rate
   */
  setDefaultTaxRate(_rate: number): this {
    // Rate stored in external config
    return this
  }

  /**
   * Calculate tax for a single amount
   */
  async calculateTax(
    amount: number,
    address: TaxAddress,
    storeId: string,
    taxClassId?: string
  ): Promise<TaxResult> {
    const rates = await this.getApplicableRates(address, storeId, taxClassId)

    if (rates.length === 0) {
      return {
        subtotal: amount,
        taxAmount: 0,
        total: amount,
        taxRate: 0,
        breakdown: [],
      }
    }

    const breakdown: TaxBreakdown[] = []
    let totalTaxRate = 0
    let taxAmount = 0

    if (this.pricesIncludeTax) {
      // Extract tax from price
      for (const rate of rates) {
        totalTaxRate += rate.rate
      }
      const preTaxAmount = amount / (1 + totalTaxRate / 100)
      taxAmount = money.subtract(amount, preTaxAmount)

      for (const rate of rates) {
        const rateTax = money.percentage(preTaxAmount, rate.rate)
        breakdown.push({
          name: rate.name,
          rate: rate.rate,
          amount: rateTax,
        })
      }

      return {
        subtotal: preTaxAmount,
        taxAmount,
        total: amount,
        taxRate: totalTaxRate,
        breakdown,
      }
    } else {
      // Add tax to price
      for (const rate of rates) {
        const rateTax = money.percentage(amount, rate.rate)
        taxAmount = money.add(taxAmount, rateTax)
        totalTaxRate += rate.rate
        breakdown.push({
          name: rate.name,
          rate: rate.rate,
          amount: rateTax,
        })
      }

      return {
        subtotal: amount,
        taxAmount,
        total: money.add(amount, taxAmount),
        taxRate: totalTaxRate,
        breakdown,
      }
    }
  }

  /**
   * Calculate tax for multiple line items
   */
  async calculateLineTax(
    items: TaxLineItem[],
    address: TaxAddress,
    storeId: string
  ): Promise<TaxResult> {
    const taxableItems = items.filter((item) => item.isTaxable !== false)

    if (taxableItems.length === 0) {
      const subtotal = items.reduce(
        (sum, item) => money.add(sum, money.multiply(item.amount, item.quantity)),
        0
      )
      return {
        subtotal,
        taxAmount: 0,
        total: subtotal,
        taxRate: 0,
        breakdown: [],
      }
    }

    // Group items by tax class
    const taxClassGroups = new Map<string | undefined, TaxLineItem[]>()
    for (const item of taxableItems) {
      const key = item.taxClassId
      const group = taxClassGroups.get(key) || []
      group.push(item)
      taxClassGroups.set(key, group)
    }

    let totalSubtotal = 0
    let totalTaxAmount = 0
    const combinedBreakdown = new Map<string, TaxBreakdown>()

    // Calculate tax for each group
    for (const [taxClassId, groupItems] of taxClassGroups) {
      const groupSubtotal = groupItems.reduce(
        (sum, item) => money.add(sum, money.multiply(item.amount, item.quantity)),
        0
      )

      const result = await this.calculateTax(
        groupSubtotal,
        address,
        storeId,
        taxClassId
      )

      totalSubtotal = money.add(totalSubtotal, result.subtotal)
      totalTaxAmount = money.add(totalTaxAmount, result.taxAmount)

      // Combine breakdown
      for (const item of result.breakdown) {
        const existing = combinedBreakdown.get(item.name)
        if (existing) {
          existing.amount = money.add(existing.amount, item.amount)
        } else {
          combinedBreakdown.set(item.name, { ...item })
        }
      }
    }

    // Add non-taxable items to subtotal
    const nonTaxableSubtotal = items
      .filter((item) => item.isTaxable === false)
      .reduce(
        (sum, item) => money.add(sum, money.multiply(item.amount, item.quantity)),
        0
      )

    totalSubtotal = money.add(totalSubtotal, nonTaxableSubtotal)

    return {
      subtotal: totalSubtotal,
      taxAmount: totalTaxAmount,
      total: money.add(totalSubtotal, totalTaxAmount),
      taxRate: totalSubtotal > 0 ? (totalTaxAmount / totalSubtotal) * 100 : 0,
      breakdown: Array.from(combinedBreakdown.values()),
    }
  }

  /**
   * Get applicable tax rates for an address
   */
  async getApplicableRates(
    address: TaxAddress,
    storeId: string,
    taxClassId?: string
  ): Promise<TaxRate[]> {
    const query = TaxRate.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .orderBy('priority', 'asc')

    // Match country
    query.where((q) => {
      q.where('country', address.country).orWhere('country', '*')
    })

    // Match state if provided
    if (address.state) {
      query.where((q) => {
        q.whereNull('state')
          .orWhere('state', '')
          .orWhere('state', address.state!)
      })
    }

    // Match city if provided
    if (address.city) {
      query.where((q) => {
        q.whereNull('city')
          .orWhere('city', '')
          .orWhere('city', address.city!)
      })
    }

    // Match postal code if provided
    if (address.postalCode) {
      query.where((q) => {
        q.whereNull('postalCode')
          .orWhere('postalCode', '')
          .orWhere('postalCode', address.postalCode!)
      })
    }

    // Match tax class if provided
    if (taxClassId) {
      query.where((q) => {
        q.whereNull('taxClassId').orWhere('taxClassId', taxClassId)
      })
    }

    return await query.exec()
  }

  /**
   * Get tax class by ID
   */
  async getTaxClass(taxClassId: string): Promise<TaxClass | null> {
    return await TaxClass.find(taxClassId)
  }

  /**
   * Calculate reverse tax (extract tax from inclusive price)
   */
  extractTax(priceWithTax: number, taxRate: number): { price: number; tax: number } {
    const price = priceWithTax / (1 + taxRate / 100)
    const tax = money.subtract(priceWithTax, price)
    return { price: money.round(price), tax: money.round(tax) }
  }

  /**
   * Add tax to price
   */
  addTax(price: number, taxRate: number): { priceWithTax: number; tax: number } {
    const tax = money.percentage(price, taxRate)
    const priceWithTax = money.add(price, tax)
    return { priceWithTax, tax }
  }

  /**
   * Format tax rate for display
   */
  formatTaxRate(rate: number): string {
    return `${rate.toFixed(2)}%`
  }
}

// Singleton instance
export const taxCalculator = new TaxCalculator()
