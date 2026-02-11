import Discount from '#models/discount'
import Order from '#models/order'
import Cart from '#models/cart'
import CartItem from '#models/cart_item'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import {
  discountEngine,
  type DiscountContext,
  type DiscountItem,
  type CartDiscountResult,
} from '#helpers/discount_engine'

interface CreateDiscountDTO {
  storeId: string
  name: string
  code: string
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y'
  value: number
  minimumOrderAmount?: number
  maximumOrderAmount?: number
  maximumDiscountAmount?: number
  minimumQuantity?: number
  usageLimit?: number
  usageLimitPerCustomer?: number
  startsAt?: DateTime
  endsAt?: DateTime
  isActive?: boolean
  isPublic?: boolean
  firstOrderOnly?: boolean
  appliesTo?: 'all' | 'specific_products' | 'specific_categories'
  productIds?: string[]
  categoryIds?: string[]
  customerIds?: string[]
  // Buy X Get Y
  buyQuantity?: number
  getQuantity?: number
  getDiscountPercentage?: number
  // Automatic / combinability
  isAutomatic?: boolean
  priority?: number
  isCombinable?: boolean
  // Campaign budget
  campaignName?: string
  budgetType?: 'spend' | 'usage'
  budgetLimit?: number
  // Additional targeting
  customerGroupIds?: string[]
  regionIds?: string[]
}

interface DiscountFilters {
  storeId: string
  isActive?: boolean
  type?: string
  search?: string
  startsAfter?: DateTime
  endsBefore?: DateTime
  isAutomatic?: boolean
  page?: number
  limit?: number
}

interface DiscountValidationResult {
  valid: boolean
  discount?: Discount
  discountAmount: number
  freeShipping: boolean
  itemDiscounts: Record<string, number>
  error?: string
}

export default class DiscountService {
  // ── CRUD ─────────────────────────────────────────────────

  async create(data: CreateDiscountDTO): Promise<Discount> {
    const existing = await Discount.query()
      .where('storeId', data.storeId)
      .where('code', data.code.toUpperCase())
      .first()

    if (existing) {
      throw new Error('Discount code already exists')
    }

    return Discount.create({
      storeId: data.storeId,
      name: data.name,
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      minimumOrderAmount: data.minimumOrderAmount,
      maximumOrderAmount: data.maximumOrderAmount,
      maximumDiscountAmount: data.maximumDiscountAmount,
      minimumQuantity: data.minimumQuantity,
      usageLimit: data.usageLimit,
      usageLimitPerCustomer: data.usageLimitPerCustomer,
      usageCount: 0,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      isActive: data.isActive ?? true,
      isPublic: data.isPublic ?? false,
      firstOrderOnly: data.firstOrderOnly ?? false,
      appliesTo: data.appliesTo || 'all',
      productIds: data.productIds || null,
      categoryIds: data.categoryIds || null,
      customerIds: data.customerIds || null,
      // Buy X Get Y
      buyQuantity: data.buyQuantity,
      getQuantity: data.getQuantity,
      getDiscountPercentage: data.getDiscountPercentage,
      // Auto / combinability
      isAutomatic: data.isAutomatic ?? false,
      priority: data.priority ?? 0,
      isCombinable: data.isCombinable ?? true,
      // Campaign budget
      campaignName: data.campaignName,
      budgetType: data.budgetType,
      budgetLimit: data.budgetLimit,
      budgetUsed: 0,
      // Targeting
      customerGroupIds: data.customerGroupIds || null,
      regionIds: data.regionIds || null,
    })
  }

  async update(discountId: string, data: Partial<CreateDiscountDTO>): Promise<Discount> {
    const discount = await Discount.findOrFail(discountId)

    if (data.code && data.code.toUpperCase() !== discount.code) {
      const existing = await Discount.query()
        .where('storeId', discount.storeId)
        .where('code', data.code.toUpperCase())
        .whereNot('id', discountId)
        .first()

      if (existing) {
        throw new Error('Discount code already exists')
      }
    }

    discount.merge({
      name: data.name,
      code: data.code?.toUpperCase(),
      type: data.type,
      value: data.value,
      minimumOrderAmount: data.minimumOrderAmount,
      maximumOrderAmount: data.maximumOrderAmount,
      maximumDiscountAmount: data.maximumDiscountAmount,
      minimumQuantity: data.minimumQuantity,
      usageLimit: data.usageLimit,
      usageLimitPerCustomer: data.usageLimitPerCustomer,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      isActive: data.isActive,
      isPublic: data.isPublic,
      firstOrderOnly: data.firstOrderOnly,
      appliesTo: data.appliesTo,
      productIds: data.productIds,
      categoryIds: data.categoryIds,
      customerIds: data.customerIds,
      buyQuantity: data.buyQuantity,
      getQuantity: data.getQuantity,
      getDiscountPercentage: data.getDiscountPercentage,
      isAutomatic: data.isAutomatic,
      priority: data.priority,
      isCombinable: data.isCombinable,
      campaignName: data.campaignName,
      budgetType: data.budgetType,
      budgetLimit: data.budgetLimit,
      customerGroupIds: data.customerGroupIds,
      regionIds: data.regionIds,
    })

    await discount.save()
    return discount
  }

  async delete(discountId: string): Promise<void> {
    const discount = await Discount.findOrFail(discountId)
    await discount.delete()
  }

  async findById(discountId: string): Promise<Discount | null> {
    return Discount.find(discountId)
  }

  async findByCode(storeId: string, code: string): Promise<Discount | null> {
    return Discount.query()
      .where('storeId', storeId)
      .where('code', code.toUpperCase())
      .first()
  }

  async list(filters: DiscountFilters): Promise<ModelPaginatorContract<Discount>> {
    const query = Discount.query().where('storeId', filters.storeId)

    if (filters.isActive !== undefined) {
      query.where('isActive', filters.isActive)
    }

    if (filters.type) {
      query.where('type', filters.type)
    }

    if (filters.isAutomatic !== undefined) {
      query.where('isAutomatic', filters.isAutomatic)
    }

    if (filters.search) {
      query.where((builder) => {
        builder.whereILike('name', `%${filters.search}%`).orWhereILike('code', `%${filters.search}%`)
      })
    }

    if (filters.startsAfter) {
      query.where('startsAt', '>=', filters.startsAfter.toISO()!)
    }

    if (filters.endsBefore) {
      query.where('endsAt', '<=', filters.endsBefore.toISO()!)
    }

    return query.orderBy('priority', 'asc').orderBy('createdAt', 'desc').paginate(filters.page || 1, filters.limit || 20)
  }

  // ── Validation & Application (delegates to DiscountEngine) ──

  /**
   * Validate a coupon code against a cart and return the result.
   * This is the primary entry point for the storefront coupon flow.
   */
  async validateAndApply(
    storeId: string,
    code: string,
    cart: Cart,
    customerId?: string
  ): Promise<DiscountValidationResult> {
    // Build context from cart
    const context = await this.buildContextFromCart(cart, storeId, customerId)

    // Delegate to engine
    const result = await discountEngine.applyDiscount(code, context)

    if (!result.isValid) {
      return {
        valid: false,
        discountAmount: 0,
        freeShipping: false,
        itemDiscounts: {},
        error: result.errors[0] || 'Invalid discount code',
      }
    }

    // Find the discount model for the caller
    const discount = await this.findByCode(storeId, code)

    return {
      valid: true,
      discount: discount || undefined,
      discountAmount: result.discountAmount,
      freeShipping: result.freeShipping,
      itemDiscounts: result.itemDiscounts,
    }
  }

  /**
   * Apply all eligible discounts (automatic + coupon) to a cart.
   * Returns the full cart discount breakdown.
   */
  async applyAllDiscounts(
    cart: Cart,
    storeId: string,
    customerId?: string
  ): Promise<CartDiscountResult> {
    const context = await this.buildContextFromCart(cart, storeId, customerId)
    return discountEngine.applyToCart(context, cart.couponCode)
  }

  /**
   * Increment discount usage and campaign budget after order placement.
   */
  async incrementUsage(discountId: string, customerId?: string, orderTotal?: number): Promise<void> {
    await db.transaction(async (trx) => {
      const discount = await Discount.query({ client: trx }).where('id', discountId).firstOrFail()

      discount.usageCount += 1

      // Campaign budget tracking
      if (discount.budgetType === 'usage') {
        discount.budgetUsed = (discount.budgetUsed || 0) + 1
      } else if (discount.budgetType === 'spend' && orderTotal) {
        discount.budgetUsed = Math.round(((discount.budgetUsed || 0) + orderTotal) * 100) / 100
      }

      await discount.useTransaction(trx).save()

      // Track per-customer usage (via order.discountId set at order creation)
      // No separate table needed — we query orders with discountId + customerId
      void customerId
    })
  }

  async getActiveDiscounts(storeId: string): Promise<Discount[]> {
    const now = DateTime.now()

    return Discount.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .where((query) => {
        query.whereNull('startsAt').orWhere('startsAt', '<=', now.toSQL())
      })
      .where((query) => {
        query.whereNull('endsAt').orWhere('endsAt', '>=', now.toSQL())
      })
      .where((query) => {
        query.whereNull('usageLimit').orWhereRaw('usage_count < usage_limit')
      })
      .orderBy('priority', 'asc')
      .orderBy('createdAt', 'desc')
  }

  async getCustomerUsageCount(discountId: string, customerId: string): Promise<number> {
    const row = await Order.query()
      .where('customerId', customerId)
      .where('discountId', discountId)
      .whereNot('status', 'cancelled')
      .count('* as total')
      .first()

    return Number(row?.$extras.total || 0)
  }

  // ── Context builder ──────────────────────────────────────

  /**
   * Build a DiscountContext from a Cart model (with items preloaded).
   */
  private async buildContextFromCart(
    cart: Cart,
    storeId: string,
    customerId?: string
  ): Promise<DiscountContext> {
    // Ensure items are loaded with product+categories for targeting
    const hasItemsWithProducts =
      cart.items &&
      cart.items.length > 0 &&
      (cart.items[0] as any).$preloaded?.product

    if (!cart.items || cart.items.length === 0 || !hasItemsWithProducts) {
      await cart.load('items', (q) => {
        q.preload('product', (pq) => pq.preload('categories'))
      })
    }

    const items: DiscountItem[] = (cart.items || []).map((item: CartItem) => ({
      id: item.id,
      productId: item.productId,
      variantId: item.variantId || undefined,
      categoryIds: (item as any).product?.categories?.map((c: any) => c.id) || [],
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
    }))

    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0)

    return {
      storeId,
      customerId,
      items,
      subtotal,
      shippingAmount: Number(cart.shippingTotal) || 0,
    }
  }
}
