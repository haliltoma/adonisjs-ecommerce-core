import Discount from '#models/discount'
import Cart from '#models/cart'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

interface CreateDiscountDTO {
  storeId: string
  name: string
  code: string
  type: 'percentage' | 'fixed_amount' | 'free_shipping' | 'buy_x_get_y'
  value: number
  minimumOrderAmount?: number
  maximumDiscountAmount?: number
  usageLimit?: number
  usageLimitPerCustomer?: number
  startsAt?: DateTime
  endsAt?: DateTime
  isActive?: boolean
  appliesTo?: 'all' | 'specific_products' | 'specific_categories'
  productIds?: string[]
  categoryIds?: string[]
  customerIds?: string[]
  isPublic?: boolean
  firstOrderOnly?: boolean
}

interface DiscountFilters {
  storeId: string
  isActive?: boolean
  type?: string
  search?: string
  startsAfter?: DateTime
  endsBefore?: DateTime
  page?: number
  limit?: number
}

interface DiscountResult {
  valid: boolean
  discount?: Discount
  discountAmount: number
  error?: string
}

export default class DiscountService {
  async create(data: CreateDiscountDTO): Promise<Discount> {
    // Check for duplicate code
    const existing = await Discount.query()
      .where('storeId', data.storeId)
      .where('code', data.code.toUpperCase())
      .first()

    if (existing) {
      throw new Error('Discount code already exists')
    }

    return await Discount.create({
      storeId: data.storeId,
      name: data.name,
      code: data.code.toUpperCase(),
      type: data.type,
      value: data.value,
      minimumOrderAmount: data.minimumOrderAmount,
      maximumDiscountAmount: data.maximumDiscountAmount,
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
      maximumDiscountAmount: data.maximumDiscountAmount,
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
    })

    await discount.save()
    return discount
  }

  async delete(discountId: string): Promise<void> {
    const discount = await Discount.findOrFail(discountId)
    await discount.delete()
  }

  async findById(discountId: string): Promise<Discount | null> {
    return await Discount.find(discountId)
  }

  async findByCode(storeId: string, code: string): Promise<Discount | null> {
    return await Discount.query()
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

    return await query.orderBy('createdAt', 'desc').paginate(filters.page || 1, filters.limit || 20)
  }

  async validateAndApply(
    storeId: string,
    code: string,
    cart: Cart,
    customerId?: string
  ): Promise<DiscountResult> {
    const discount = await this.findByCode(storeId, code)

    if (!discount) {
      return { valid: false, discountAmount: 0, error: 'Discount code not found' }
    }

    // Check if active
    if (!discount.isActive) {
      return { valid: false, discountAmount: 0, error: 'Discount code is not active' }
    }

    // Check date range
    const now = DateTime.now()
    if (discount.startsAt && discount.startsAt > now) {
      return { valid: false, discountAmount: 0, error: 'Discount code is not yet valid' }
    }
    if (discount.endsAt && discount.endsAt < now) {
      return { valid: false, discountAmount: 0, error: 'Discount code has expired' }
    }

    // Check usage limit
    if (discount.usageLimit && discount.usageCount >= discount.usageLimit) {
      return { valid: false, discountAmount: 0, error: 'Discount code usage limit reached' }
    }

    // Check per-customer usage limit
    if (discount.usageLimitPerCustomer && customerId) {
      const customerUsage = await this.getCustomerUsageCount(discount.id, customerId)
      if (customerUsage >= discount.usageLimitPerCustomer) {
        return { valid: false, discountAmount: 0, error: 'You have already used this discount' }
      }
    }

    // Check minimum purchase
    if (discount.minimumOrderAmount && cart.subtotal < discount.minimumOrderAmount) {
      return {
        valid: false,
        discountAmount: 0,
        error: `Minimum purchase of ${discount.minimumOrderAmount} required`,
      }
    }

    // Check customer restriction
    if (discount.customerIds && discount.customerIds.length > 0 && customerId) {
      if (!discount.customerIds.includes(customerId)) {
        return { valid: false, discountAmount: 0, error: 'Discount not available for your account' }
      }
    }

    // Calculate discount amount
    const discountAmount = this.calculateDiscountAmount(discount, cart)

    return { valid: true, discount, discountAmount }
  }

  async incrementUsage(discountId: string, customerId?: string): Promise<void> {
    await db.transaction(async (trx) => {
      const discount = await Discount.query({ client: trx }).where('id', discountId).firstOrFail()

      discount.usageCount += 1
      await discount.useTransaction(trx).save()

      // Track per-customer usage if needed
      if (customerId && discount.usageLimitPerCustomer) {
        // This would be stored in a separate table like discount_usages
        // For simplicity, we're just incrementing the total count
      }
    })
  }

  async getActiveDiscounts(storeId: string): Promise<Discount[]> {
    const now = DateTime.now()

    return await Discount.query()
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
      .orderBy('createdAt', 'desc')
  }

  private calculateDiscountAmount(discount: Discount, cart: Cart): number {
    let amount = 0

    switch (discount.type) {
      case 'percentage':
        amount = (cart.subtotal * discount.value) / 100
        break
      case 'fixed_amount':
        amount = Math.min(discount.value, cart.subtotal)
        break
      case 'free_shipping':
        // This would be handled separately in shipping calculation
        amount = 0
        break
      case 'buy_x_get_y':
        // Complex logic would go here
        amount = 0
        break
    }

    // Apply max discount cap
    if (discount.maximumDiscountAmount && amount > discount.maximumDiscountAmount) {
      amount = discount.maximumDiscountAmount
    }

    return Math.round(amount * 100) / 100
  }

  private async getCustomerUsageCount(_discountId: string, _customerId: string): Promise<number> {
    // This would query a discount_usages table
    // For now, return 0
    return 0
  }
}
