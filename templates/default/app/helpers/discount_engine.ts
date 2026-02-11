import { DateTime } from 'luxon'
import Discount from '#models/discount'
import { money } from './money.js'

// ── Public interfaces ──────────────────────────────────────

export interface DiscountContext {
  storeId: string
  customerId?: string
  customerEmail?: string
  customerGroupIds?: string[]
  regionId?: string
  items: DiscountItem[]
  subtotal: number
  shippingAmount?: number
}

export interface DiscountItem {
  id: string
  productId: string
  variantId?: string
  categoryIds?: string[]
  collectionIds?: string[]
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface DiscountResult {
  isValid: boolean
  discountAmount: number
  freeShipping: boolean
  appliedDiscount?: AppliedDiscount
  /** Per-item breakdown: itemId → discount cents */
  itemDiscounts: Record<string, number>
  errors: string[]
}

export interface AppliedDiscount {
  id: string
  code: string
  name: string
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y'
  value: number
  discountAmount: number
}

export interface CartDiscountResult {
  totalDiscount: number
  freeShipping: boolean
  /** All discounts that were applied (may be >1 if combinable) */
  appliedDiscounts: AppliedDiscount[]
  /** Per-item breakdown: itemId → total discount */
  itemDiscounts: Record<string, number>
}

// ── Engine ─────────────────────────────────────────────────

/**
 * DiscountEngine
 *
 * Validates and applies discount codes + automatic discounts to carts.
 * Supports percentage, fixed amount, free shipping, and buy X get Y.
 * Handles combinability, campaign budgets, customer groups, and regions.
 */
export class DiscountEngine {
  // ── Single code validation ───────────────────────────────

  /**
   * Validate and calculate a single coupon code
   */
  async applyDiscount(code: string, context: DiscountContext): Promise<DiscountResult> {
    const discount = await Discount.query()
      .where('code', code.toUpperCase())
      .where('storeId', context.storeId)
      .where('isActive', true)
      .first()

    if (!discount) {
      return this.invalid(['Invalid discount code'])
    }

    return this.evaluateDiscount(discount, context)
  }

  /**
   * Evaluate a single discount against context
   */
  async evaluateDiscount(discount: Discount, context: DiscountContext): Promise<DiscountResult> {
    const errors = await this.validateDiscount(discount, context)
    if (errors.length > 0) {
      return this.invalid(errors)
    }

    const { discountAmount, freeShipping, itemDiscounts } = this.calculateDiscount(
      discount,
      context
    )

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
      itemDiscounts,
      errors: [],
    }
  }

  // ── Full cart evaluation (auto + coupon + stacking) ──────

  /**
   * Apply all eligible discounts to a cart.
   * 1. Gather automatic discounts
   * 2. Add the manual coupon code (if any)
   * 3. Resolve combinability / pick best
   * 4. Return aggregated result
   */
  async applyToCart(
    context: DiscountContext,
    couponCode?: string | null
  ): Promise<CartDiscountResult> {
    const candidates: Array<{ discount: Discount; result: DiscountResult }> = []

    // 1. Evaluate automatic discounts
    const autoDiscounts = await this.getAutomaticDiscounts(context.storeId)
    for (const disc of autoDiscounts) {
      const result = await this.evaluateDiscount(disc, context)
      if (result.isValid && result.discountAmount > 0) {
        candidates.push({ discount: disc, result })
      }
    }

    // 2. Evaluate coupon code (if provided)
    if (couponCode) {
      const couponDiscount = await Discount.query()
        .where('code', couponCode.toUpperCase())
        .where('storeId', context.storeId)
        .where('isActive', true)
        .first()

      if (couponDiscount) {
        const result = await this.evaluateDiscount(couponDiscount, context)
        if (result.isValid && result.discountAmount > 0) {
          candidates.push({ discount: couponDiscount, result })
        }
      }
    }

    if (candidates.length === 0) {
      return { totalDiscount: 0, freeShipping: false, appliedDiscounts: [], itemDiscounts: {} }
    }

    // 3. Sort by priority (lower = higher priority), then by discount amount desc
    candidates.sort((a, b) => {
      if (a.discount.priority !== b.discount.priority) {
        return a.discount.priority - b.discount.priority
      }
      return b.result.discountAmount - a.result.discountAmount
    })

    // 4. Resolve combinability
    return this.resolveCombinability(candidates, context)
  }

  // ── Validation ───────────────────────────────────────────

  private async validateDiscount(discount: Discount, context: DiscountContext): Promise<string[]> {
    const errors: string[] = []

    // Date range
    const now = DateTime.now()
    if (discount.startsAt && discount.startsAt > now) {
      errors.push('This discount is not yet active')
    }
    if (discount.endsAt && discount.endsAt < now) {
      errors.push('This discount has expired')
    }

    // Global usage limit
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      errors.push('This discount has reached its usage limit')
    }

    // Per-customer usage
    if (discount.usageLimitPerCustomer && context.customerId) {
      const usage = await this.getCustomerUsageCount(discount.id, context.customerId)
      if (usage >= discount.usageLimitPerCustomer) {
        errors.push('You have already used this discount the maximum number of times')
      }
    }

    // Campaign budget
    if (discount.budgetType && discount.budgetLimit) {
      if (discount.budgetType === 'usage' && discount.budgetUsed >= discount.budgetLimit) {
        errors.push('This campaign has reached its budget limit')
      }
      if (discount.budgetType === 'spend' && discount.budgetUsed >= discount.budgetLimit) {
        errors.push('This campaign has reached its spend limit')
      }
    }

    // Minimum order amount
    if (discount.minimumOrderAmount && context.subtotal < discount.minimumOrderAmount) {
      errors.push(`Minimum order amount of ${money.format(discount.minimumOrderAmount)} required`)
    }

    // Maximum order amount
    if (discount.maximumOrderAmount && context.subtotal > discount.maximumOrderAmount) {
      errors.push(`Maximum order amount of ${money.format(discount.maximumOrderAmount)} exceeded`)
    }

    // Minimum quantity
    const totalQty = context.items.reduce((sum, i) => sum + i.quantity, 0)
    if (discount.minimumQuantity && totalQty < discount.minimumQuantity) {
      errors.push(`Minimum ${discount.minimumQuantity} items required`)
    }

    // Product restrictions
    if (discount.appliesTo === 'specific_products' && discount.productIds) {
      const hasEligible = context.items.some((i) => discount.productIds!.includes(i.productId))
      if (!hasEligible) {
        errors.push('No eligible products in cart for this discount')
      }
    }

    // Category restrictions
    if (discount.appliesTo === 'specific_categories' && discount.categoryIds) {
      const hasEligible = context.items.some((i) =>
        i.categoryIds?.some((cid) => discount.categoryIds!.includes(cid))
      )
      if (!hasEligible) {
        errors.push('No eligible products in cart for this discount')
      }
    }

    // Customer restrictions
    if (discount.customerIds && discount.customerIds.length > 0) {
      if (!context.customerId || !discount.customerIds.includes(context.customerId)) {
        errors.push('This discount is not available for your account')
      }
    }

    // Customer group restrictions
    if (discount.customerGroupIds && discount.customerGroupIds.length > 0) {
      const customerGroups = context.customerGroupIds || []
      const hasGroup = discount.customerGroupIds.some((gid) => customerGroups.includes(gid))
      if (!hasGroup) {
        errors.push('This discount is not available for your customer group')
      }
    }

    // Region restrictions
    if (discount.regionIds && discount.regionIds.length > 0) {
      if (!context.regionId || !discount.regionIds.includes(context.regionId)) {
        errors.push('This discount is not available in your region')
      }
    }

    // First order only
    if (discount.firstOrderOnly && context.customerId) {
      const hasOrders = await this.customerHasOrders(context.customerId)
      if (hasOrders) {
        errors.push('This discount is only valid for first orders')
      }
    }

    return errors
  }

  // ── Calculation ──────────────────────────────────────────

  private calculateDiscount(
    discount: Discount,
    context: DiscountContext
  ): { discountAmount: number; freeShipping: boolean; itemDiscounts: Record<string, number> } {
    let discountAmount = 0
    let freeShipping = false
    const itemDiscounts: Record<string, number> = {}

    const eligibleItems = this.getEligibleItems(discount, context)
    const eligibleAmount = eligibleItems.reduce((sum, i) => money.add(sum, i.totalPrice), 0)

    switch (discount.type) {
      case 'percentage': {
        discountAmount = money.percentage(eligibleAmount, discount.value)
        // Distribute proportionally across eligible items
        this.distributeProportionally(eligibleItems, discountAmount, itemDiscounts)
        break
      }

      case 'fixed_amount': {
        discountAmount = Math.min(discount.value, eligibleAmount)
        this.distributeProportionally(eligibleItems, discountAmount, itemDiscounts)
        break
      }

      case 'free_shipping': {
        freeShipping = true
        discountAmount = context.shippingAmount || 0
        break
      }

      case 'buy_x_get_y': {
        const bxgy = this.calculateBuyXGetY(discount, context)
        discountAmount = bxgy.amount
        Object.assign(itemDiscounts, bxgy.itemDiscounts)
        break
      }
    }

    // Apply maximum discount cap
    if (discount.maximumDiscountAmount && discountAmount > discount.maximumDiscountAmount) {
      const ratio = discount.maximumDiscountAmount / discountAmount
      discountAmount = discount.maximumDiscountAmount
      // Scale item discounts proportionally
      for (const id of Object.keys(itemDiscounts)) {
        itemDiscounts[id] = money.round(itemDiscounts[id] * ratio)
      }
    }

    return { discountAmount: money.round(discountAmount), freeShipping, itemDiscounts }
  }

  /**
   * Get items eligible for this discount based on appliesTo
   */
  private getEligibleItems(discount: Discount, context: DiscountContext): DiscountItem[] {
    if (discount.appliesTo === 'all') {
      return context.items
    }

    if (discount.appliesTo === 'specific_products' && discount.productIds) {
      return context.items.filter((i) => discount.productIds!.includes(i.productId))
    }

    if (discount.appliesTo === 'specific_categories' && discount.categoryIds) {
      return context.items.filter((i) =>
        i.categoryIds?.some((cid) => discount.categoryIds!.includes(cid))
      )
    }

    return context.items
  }

  /**
   * Distribute a total discount amount proportionally across items
   */
  private distributeProportionally(
    items: DiscountItem[],
    totalDiscount: number,
    out: Record<string, number>
  ): void {
    if (items.length === 0 || totalDiscount <= 0) return

    const totalPrice = items.reduce((sum, i) => money.add(sum, i.totalPrice), 0)
    if (totalPrice <= 0) return

    let remaining = totalDiscount
    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx]
      if (idx === items.length - 1) {
        // Last item gets the remainder to avoid rounding errors
        out[item.id] = money.add(out[item.id] || 0, money.round(remaining))
      } else {
        const share = money.round((item.totalPrice / totalPrice) * totalDiscount)
        out[item.id] = money.add(out[item.id] || 0, share)
        remaining = money.subtract(remaining, share)
      }
    }
  }

  /**
   * Calculate buy X get Y discount with per-item tracking
   */
  private calculateBuyXGetY(
    discount: Discount,
    context: DiscountContext
  ): { amount: number; itemDiscounts: Record<string, number> } {
    const itemDiscounts: Record<string, number> = {}

    if (!discount.buyQuantity || !discount.getQuantity) {
      return { amount: 0, itemDiscounts }
    }

    const eligibleItems = this.getEligibleItems(discount, context)

    // Flatten to individual units: { itemId, unitPrice }
    const units: Array<{ itemId: string; unitPrice: number }> = []
    for (const item of eligibleItems) {
      for (let i = 0; i < item.quantity; i++) {
        units.push({ itemId: item.id, unitPrice: item.unitPrice })
      }
    }

    const totalQty = units.length
    const requiredQty = discount.buyQuantity + discount.getQuantity
    const sets = Math.floor(totalQty / requiredQty)
    const freeCount = sets * discount.getQuantity

    if (freeCount <= 0) {
      return { amount: 0, itemDiscounts }
    }

    // Sort by price ascending — cheapest items are the "free" ones
    const sorted = [...units].sort((a, b) => a.unitPrice - b.unitPrice)
    const freeUnits = sorted.slice(0, freeCount)

    const discountPct = discount.getDiscountPercentage || 100
    let totalAmount = 0

    for (const unit of freeUnits) {
      const discountPerUnit = money.percentage(unit.unitPrice, discountPct)
      itemDiscounts[unit.itemId] = money.add(itemDiscounts[unit.itemId] || 0, discountPerUnit)
      totalAmount = money.add(totalAmount, discountPerUnit)
    }

    return { amount: totalAmount, itemDiscounts }
  }

  // ── Combinability resolver ───────────────────────────────

  private resolveCombinability(
    candidates: Array<{ discount: Discount; result: DiscountResult }>,
    _context: DiscountContext
  ): CartDiscountResult {
    let totalDiscount = 0
    let freeShipping = false
    const appliedDiscounts: AppliedDiscount[] = []
    const itemDiscounts: Record<string, number> = {}

    // Separate combinable vs non-combinable
    const combinable = candidates.filter((c) => c.discount.isCombinable)
    const nonCombinable = candidates.filter((c) => !c.discount.isCombinable)

    // Pick the best non-combinable (if any)
    const bestNonCombinable = nonCombinable.length > 0 ? nonCombinable[0] : null

    // Calculate total from combinable discounts
    let combinableTotal = 0
    for (const c of combinable) {
      combinableTotal = money.add(combinableTotal, c.result.discountAmount)
    }

    // If the best non-combinable beats all combinable together, use it alone
    if (bestNonCombinable && bestNonCombinable.result.discountAmount >= combinableTotal) {
      totalDiscount = bestNonCombinable.result.discountAmount
      freeShipping = bestNonCombinable.result.freeShipping
      appliedDiscounts.push(bestNonCombinable.result.appliedDiscount!)
      Object.assign(itemDiscounts, bestNonCombinable.result.itemDiscounts)
    } else if (combinable.length > 0) {
      // Use all combinable discounts
      for (const c of combinable) {
        totalDiscount = money.add(totalDiscount, c.result.discountAmount)
        freeShipping = freeShipping || c.result.freeShipping
        appliedDiscounts.push(c.result.appliedDiscount!)
        // Merge per-item discounts
        for (const [itemId, amount] of Object.entries(c.result.itemDiscounts)) {
          itemDiscounts[itemId] = money.add(itemDiscounts[itemId] || 0, amount)
        }
      }
    } else if (bestNonCombinable) {
      // Only non-combinable available
      totalDiscount = bestNonCombinable.result.discountAmount
      freeShipping = bestNonCombinable.result.freeShipping
      appliedDiscounts.push(bestNonCombinable.result.appliedDiscount!)
      Object.assign(itemDiscounts, bestNonCombinable.result.itemDiscounts)
    }

    return {
      totalDiscount: money.round(totalDiscount),
      freeShipping,
      appliedDiscounts,
      itemDiscounts,
    }
  }

  // ── Automatic discounts ──────────────────────────────────

  /**
   * Fetch all active automatic discounts for a store
   */
  private async getAutomaticDiscounts(storeId: string): Promise<Discount[]> {
    const now = DateTime.now().toSQL()

    return Discount.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .where('isAutomatic', true)
      .where((q) => {
        q.whereNull('startsAt').orWhere('startsAt', '<=', now!)
      })
      .where((q) => {
        q.whereNull('endsAt').orWhere('endsAt', '>=', now!)
      })
      .where((q) => {
        q.whereNull('usageLimit').orWhereRaw('usage_count < usage_limit')
      })
      .orderBy('priority', 'asc')
      .exec()
  }

  // ── Usage tracking ───────────────────────────────────────

  /**
   * Get how many times a customer used a specific discount
   */
  private async getCustomerUsageCount(discountId: string, customerId: string): Promise<number> {
    const { default: Order } = await import('#models/order')
    const row = await Order.query()
      .where('customerId', customerId)
      .where('discountId', discountId)
      .whereNot('status', 'cancelled')
      .count('* as total')
      .first()

    return Number(row?.$extras.total || 0)
  }

  private async customerHasOrders(customerId: string): Promise<boolean> {
    const { default: Order } = await import('#models/order')
    const order = await Order.query()
      .where('customerId', customerId)
      .whereNot('status', 'cancelled')
      .first()

    return !!order
  }

  /**
   * Increment usage count + campaign budget after a successful order
   */
  async incrementUsage(discountId: string, orderTotal?: number): Promise<void> {
    const discount = await Discount.find(discountId)
    if (!discount) return

    discount.usageCount = (discount.usageCount || 0) + 1

    // Update campaign budget
    if (discount.budgetType === 'usage') {
      discount.budgetUsed = (discount.budgetUsed || 0) + 1
    } else if (discount.budgetType === 'spend' && orderTotal) {
      discount.budgetUsed = money.add(discount.budgetUsed || 0, orderTotal)
    }

    await discount.save()
  }

  // ── Public convenience methods ───────────────────────────

  /**
   * Get available public discounts for a customer (for display)
   */
  async getAvailableDiscounts(storeId: string, customerId?: string): Promise<Discount[]> {
    const now = DateTime.now().toSQL()

    const query = Discount.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .where('isPublic', true)
      .where('isAutomatic', false)
      .where((q) => {
        q.whereNull('startsAt').orWhere('startsAt', '<=', now!)
      })
      .where((q) => {
        q.whereNull('endsAt').orWhere('endsAt', '>=', now!)
      })
      .where((q) => {
        q.whereNull('usageLimit').orWhereRaw('usage_count < usage_limit')
      })

    if (customerId) {
      query.where((q) => {
        q.whereNull('customerIds').orWhereRaw('? = ANY(customer_ids)', [customerId])
      })
    }

    return query.orderBy('priority', 'asc').exec()
  }

  // ── Helpers ──────────────────────────────────────────────

  private invalid(errors: string[]): DiscountResult {
    return {
      isValid: false,
      discountAmount: 0,
      freeShipping: false,
      itemDiscounts: {},
      errors,
    }
  }
}

export const discountEngine = new DiscountEngine()
