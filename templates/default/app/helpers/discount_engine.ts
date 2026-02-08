import { DateTime } from 'luxon'
import Discount from '#models/discount'
import { money } from './money.js'

interface DiscountContext {
  storeId: string
  customerId?: string
  customerEmail?: string
  items: DiscountItem[]
  subtotal: number
  shippingAmount?: number
}

interface DiscountItem {
  productId: string
  variantId?: string
  categoryIds?: string[]
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface DiscountResult {
  isValid: boolean
  discountAmount: number
  freeShipping: boolean
  appliedDiscount?: AppliedDiscount
  errors: string[]
}

interface AppliedDiscount {
  id: string
  code: string
  name: string
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y'
  value: number
  discountAmount: number
}

/**
 * DiscountEngine
 *
 * Validates and applies discount codes to orders.
 * Supports percentage, fixed amount, free shipping, and buy X get Y discounts.
 */
export class DiscountEngine {
  /**
   * Apply a discount code to a cart/order
   */
  async applyDiscount(code: string, context: DiscountContext): Promise<DiscountResult> {
    const errors: string[] = []

    // Find the discount
    const discount = await Discount.query()
      .where('code', code.toUpperCase())
      .where('storeId', context.storeId)
      .where('isActive', true)
      .first()

    if (!discount) {
      return {
        isValid: false,
        discountAmount: 0,
        freeShipping: false,
        errors: ['Invalid discount code'],
      }
    }

    // Validate discount
    const validationErrors = await this.validateDiscount(discount, context)
    if (validationErrors.length > 0) {
      return {
        isValid: false,
        discountAmount: 0,
        freeShipping: false,
        errors: validationErrors,
      }
    }

    // Calculate discount
    const { discountAmount, freeShipping } = this.calculateDiscount(discount, context)

    return {
      isValid: true,
      discountAmount,
      freeShipping,
      appliedDiscount: {
        id: discount.id,
        code: discount.code,
        name: discount.name,
        type: discount.type,
        value: discount.value,
        discountAmount,
      },
      errors: [],
    }
  }

  /**
   * Validate a discount against context
   */
  private async validateDiscount(
    discount: Discount,
    context: DiscountContext
  ): Promise<string[]> {
    const errors: string[] = []

    // Check date range
    if (discount.startsAt && discount.startsAt > DateTime.now()) {
      errors.push('This discount is not yet active')
    }

    if (discount.endsAt && discount.endsAt < DateTime.now()) {
      errors.push('This discount has expired')
    }

    // Check usage limits
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      errors.push('This discount has reached its usage limit')
    }

    // Check per-customer usage
    if (discount.usageLimitPerCustomer && context.customerId) {
      const customerUsage = await this.getCustomerUsageCount(
        discount.id,
        context.customerId
      )
      if (customerUsage >= discount.usageLimitPerCustomer) {
        errors.push('You have already used this discount the maximum number of times')
      }
    }

    // Check minimum order amount
    if (discount.minimumOrderAmount && context.subtotal < discount.minimumOrderAmount) {
      errors.push(
        `Minimum order amount of ${money.format(discount.minimumOrderAmount)} required`
      )
    }

    // Check maximum order amount
    if (discount.maximumOrderAmount && context.subtotal > discount.maximumOrderAmount) {
      errors.push(
        `Maximum order amount of ${money.format(discount.maximumOrderAmount)} exceeded`
      )
    }

    // Check minimum quantity
    const totalQuantity = context.items.reduce((sum, item) => sum + item.quantity, 0)
    if (discount.minimumQuantity && totalQuantity < discount.minimumQuantity) {
      errors.push(`Minimum ${discount.minimumQuantity} items required`)
    }

    // Check product restrictions
    if (discount.appliesTo === 'specific_products' && discount.productIds) {
      const hasEligibleProduct = context.items.some((item) =>
        discount.productIds!.includes(item.productId)
      )
      if (!hasEligibleProduct) {
        errors.push('No eligible products in cart for this discount')
      }
    }

    // Check category restrictions
    if (discount.appliesTo === 'specific_categories' && discount.categoryIds) {
      const hasEligibleCategory = context.items.some((item) =>
        item.categoryIds?.some((catId) => discount.categoryIds!.includes(catId))
      )
      if (!hasEligibleCategory) {
        errors.push('No eligible products in cart for this discount')
      }
    }

    // Check customer restrictions
    if (discount.customerIds && discount.customerIds.length > 0) {
      if (!context.customerId || !discount.customerIds.includes(context.customerId)) {
        errors.push('This discount is not available for your account')
      }
    }

    // Check first order only
    if (discount.firstOrderOnly && context.customerId) {
      const hasOrders = await this.customerHasOrders(context.customerId)
      if (hasOrders) {
        errors.push('This discount is only valid for first orders')
      }
    }

    return errors
  }

  /**
   * Calculate discount amount
   */
  private calculateDiscount(
    discount: Discount,
    context: DiscountContext
  ): { discountAmount: number; freeShipping: boolean } {
    let discountAmount = 0
    let freeShipping = false

    // Get eligible amount based on applies_to
    const eligibleAmount = this.getEligibleAmount(discount, context)

    switch (discount.type) {
      case 'percentage':
        discountAmount = money.percentage(eligibleAmount, discount.value)
        break

      case 'fixed_amount':
        discountAmount = Math.min(discount.value, eligibleAmount)
        break

      case 'free_shipping':
        freeShipping = true
        discountAmount = context.shippingAmount || 0
        break

      case 'buy_x_get_y':
        discountAmount = this.calculateBuyXGetY(discount, context)
        break
    }

    // Apply maximum discount cap
    if (discount.maximumDiscountAmount && discountAmount > discount.maximumDiscountAmount) {
      discountAmount = discount.maximumDiscountAmount
    }

    return { discountAmount: money.round(discountAmount), freeShipping }
  }

  /**
   * Get eligible amount for discount calculation
   */
  private getEligibleAmount(discount: Discount, context: DiscountContext): number {
    if (discount.appliesTo === 'all') {
      return context.subtotal
    }

    if (discount.appliesTo === 'specific_products' && discount.productIds) {
      return context.items
        .filter((item) => discount.productIds!.includes(item.productId))
        .reduce((sum, item) => money.add(sum, item.totalPrice), 0)
    }

    if (discount.appliesTo === 'specific_categories' && discount.categoryIds) {
      return context.items
        .filter((item) =>
          item.categoryIds?.some((catId) => discount.categoryIds!.includes(catId))
        )
        .reduce((sum, item) => money.add(sum, item.totalPrice), 0)
    }

    return context.subtotal
  }

  /**
   * Calculate buy X get Y discount
   */
  private calculateBuyXGetY(discount: Discount, context: DiscountContext): number {
    if (!discount.buyQuantity || !discount.getQuantity) {
      return 0
    }

    // Find eligible items
    let eligibleItems = context.items
    if (discount.appliesTo === 'specific_products' && discount.productIds) {
      eligibleItems = eligibleItems.filter((item) =>
        discount.productIds!.includes(item.productId)
      )
    }

    // Calculate how many free items
    const totalQuantity = eligibleItems.reduce((sum, item) => sum + item.quantity, 0)
    const setsOfBuyX = Math.floor(totalQuantity / discount.buyQuantity)
    const freeItems = setsOfBuyX * discount.getQuantity

    // Get the cheapest items as free
    const allItems = eligibleItems.flatMap((item) =>
      Array(item.quantity).fill(item.unitPrice)
    )
    allItems.sort((a, b) => a - b)

    const freeItemPrices = allItems.slice(0, freeItems)
    const freeAmount = freeItemPrices.reduce((sum, price) => money.add(sum, price), 0)

    // Apply get discount percentage (default 100% = free)
    const getDiscount = discount.getDiscountPercentage || 100
    return money.percentage(freeAmount, getDiscount)
  }

  /**
   * Get customer's usage count for a discount
   */
  private async getCustomerUsageCount(
    discountId: string,
    customerId: string
  ): Promise<number> {
    const { default: Order } = await import('#models/order')
    const count = await Order.query()
      .where('customerId', customerId)
      .where('discountId', discountId)
      .whereNot('status', 'cancelled')
      .count('* as total')
      .first()

    return Number(count?.$extras.total || 0)
  }

  /**
   * Check if customer has any previous orders
   */
  private async customerHasOrders(customerId: string): Promise<boolean> {
    const { default: Order } = await import('#models/order')
    const order = await Order.query()
      .where('customerId', customerId)
      .whereNot('status', 'cancelled')
      .first()

    return !!order
  }

  /**
   * Increment discount usage count
   */
  async incrementUsage(discountId: string): Promise<void> {
    const discount = await Discount.find(discountId)
    if (discount) {
      discount.usageCount = (discount.usageCount || 0) + 1
      await discount.save()
    }
  }

  /**
   * Validate multiple discount codes (for stacking)
   */
  async validateMultiple(
    codes: string[],
    context: DiscountContext
  ): Promise<DiscountResult[]> {
    const results: DiscountResult[] = []

    for (const code of codes) {
      const result = await this.applyDiscount(code, context)
      results.push(result)
    }

    return results
  }

  /**
   * Find best discount from multiple codes
   */
  async findBestDiscount(
    codes: string[],
    context: DiscountContext
  ): Promise<DiscountResult | null> {
    const results = await this.validateMultiple(codes, context)
    const validResults = results.filter((r) => r.isValid)

    if (validResults.length === 0) {
      return null
    }

    // Return the one with highest discount amount
    return validResults.reduce((best, current) =>
      current.discountAmount > best.discountAmount ? current : best
    )
  }

  /**
   * Get available discounts for a customer
   */
  async getAvailableDiscounts(
    storeId: string,
    customerId?: string
  ): Promise<Discount[]> {
    const now = DateTime.now().toSQL()

    const query = Discount.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .where('isPublic', true)
      .where((q) => {
        q.whereNull('startsAt').orWhere('startsAt', '<=', now!)
      })
      .where((q) => {
        q.whereNull('endsAt').orWhere('endsAt', '>=', now!)
      })
      .where((q) => {
        q.whereNull('usageLimit').orWhereRaw('usage_count < usage_limit')
      })

    // Filter by customer if provided
    if (customerId) {
      query.where((q) => {
        q.whereNull('customerIds')
          .orWhereRaw('? = ANY(customer_ids)', [customerId])
      })
    }

    return await query.orderBy('value', 'desc').exec()
  }

  /**
   * Auto-apply best available discount
   */
  async autoApply(context: DiscountContext): Promise<DiscountResult | null> {
    const discounts = await this.getAvailableDiscounts(
      context.storeId,
      context.customerId
    )

    if (discounts.length === 0) {
      return null
    }

    const codes = discounts.map((d) => d.code)
    return this.findBestDiscount(codes, context)
  }
}

// Singleton instance
export const discountEngine = new DiscountEngine()
