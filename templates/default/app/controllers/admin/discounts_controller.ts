import type { HttpContext } from '@adonisjs/core/http'
import DiscountService from '#services/discount_service'
import { DateTime } from 'luxon'

export default class DiscountsController {
  private discountService: DiscountService

  constructor() {
    this.discountService = new DiscountService()
  }

  async index({ inertia, request, store }: HttpContext) {
    const storeId = store.id
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const isActive = request.input('isActive')
    const type = request.input('type')
    const search = request.input('search')
    const isAutomatic = request.input('isAutomatic')

    const discounts = await this.discountService.list({
      storeId,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      isAutomatic: isAutomatic === 'true' ? true : isAutomatic === 'false' ? false : undefined,
      type,
      search,
      page,
      limit,
    })

    return inertia.render('admin/discounts/Index', {
      discounts: {
        data: discounts.all().map((d) => ({
          id: d.id,
          name: d.name,
          code: d.code,
          type: d.type,
          value: d.value,
          usageCount: d.usageCount,
          usageLimit: d.usageLimit,
          isActive: d.isActive,
          isAutomatic: d.isAutomatic,
          isCombinable: d.isCombinable,
          priority: d.priority,
          campaignName: d.campaignName,
          budgetType: d.budgetType,
          budgetLimit: d.budgetLimit,
          budgetUsed: d.budgetUsed,
          startsAt: d.startsAt?.toISO(),
          endsAt: d.endsAt?.toISO(),
          createdAt: d.createdAt.toISO(),
        })),
        meta: discounts.getMeta(),
      },
      filters: { isActive, type, search, isAutomatic },
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/discounts/Create')
  }

  async store({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const raw = request.only([
      'name',
      'code',
      'type',
      'value',
      'minimumOrderAmount',
      'maximumOrderAmount',
      'maximumDiscountAmount',
      'minimumQuantity',
      'usageLimit',
      'usageLimitPerCustomer',
      'startsAt',
      'endsAt',
      'isActive',
      'isPublic',
      'firstOrderOnly',
      'appliesTo',
      'productIds',
      'categoryIds',
      'customerIds',
      // Buy X Get Y
      'buyQuantity',
      'getQuantity',
      'getDiscountPercentage',
      // Auto / combinability
      'isAutomatic',
      'priority',
      'isCombinable',
      // Campaign
      'campaignName',
      'budgetType',
      'budgetLimit',
      // Targeting
      'customerGroupIds',
      'regionIds',
    ])

    const toNum = (v: any) => (v !== '' && v != null ? Number(v) : undefined)

    try {
      const discount = await this.discountService.create({
        storeId,
        name: raw.name,
        code: raw.code,
        type: raw.type,
        value: Number(raw.value) || 0,
        minimumOrderAmount: toNum(raw.minimumOrderAmount),
        maximumOrderAmount: toNum(raw.maximumOrderAmount),
        maximumDiscountAmount: toNum(raw.maximumDiscountAmount),
        minimumQuantity: toNum(raw.minimumQuantity),
        usageLimit: toNum(raw.usageLimit),
        usageLimitPerCustomer: toNum(raw.usageLimitPerCustomer),
        startsAt: raw.startsAt ? DateTime.fromISO(raw.startsAt) : undefined,
        endsAt: raw.endsAt ? DateTime.fromISO(raw.endsAt) : undefined,
        isActive: raw.isActive,
        isPublic: raw.isPublic,
        firstOrderOnly: raw.firstOrderOnly,
        appliesTo: raw.appliesTo,
        productIds: raw.productIds,
        categoryIds: raw.categoryIds,
        customerIds: raw.customerIds,
        buyQuantity: toNum(raw.buyQuantity),
        getQuantity: toNum(raw.getQuantity),
        getDiscountPercentage: toNum(raw.getDiscountPercentage),
        isAutomatic: raw.isAutomatic,
        priority: toNum(raw.priority),
        isCombinable: raw.isCombinable,
        campaignName: raw.campaignName,
        budgetType: raw.budgetType,
        budgetLimit: toNum(raw.budgetLimit),
        customerGroupIds: raw.customerGroupIds,
        regionIds: raw.regionIds,
      })

      session.flash('success', 'Discount created successfully')
      return response.redirect().toRoute('admin.discounts.edit', { id: discount.id })
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async edit({ params, inertia }: HttpContext) {
    const discount = await this.discountService.findById(params.id)

    if (!discount) {
      return inertia.render('admin/errors/NotFound', { resource: 'Discount' })
    }

    return inertia.render('admin/discounts/Edit', {
      discount: {
        id: discount.id,
        name: discount.name,
        code: discount.code,
        type: discount.type,
        value: discount.value,
        minimumOrderAmount: discount.minimumOrderAmount,
        maximumOrderAmount: discount.maximumOrderAmount,
        maximumDiscountAmount: discount.maximumDiscountAmount,
        minimumQuantity: discount.minimumQuantity,
        usageLimit: discount.usageLimit,
        usageLimitPerCustomer: discount.usageLimitPerCustomer,
        usageCount: discount.usageCount,
        isActive: discount.isActive,
        isPublic: discount.isPublic,
        firstOrderOnly: discount.firstOrderOnly,
        startsAt: discount.startsAt?.toISO(),
        endsAt: discount.endsAt?.toISO(),
        appliesTo: discount.appliesTo,
        productIds: discount.productIds,
        categoryIds: discount.categoryIds,
        customerIds: discount.customerIds,
        // Buy X Get Y
        buyQuantity: discount.buyQuantity,
        getQuantity: discount.getQuantity,
        getDiscountPercentage: discount.getDiscountPercentage,
        // Auto / combinability
        isAutomatic: discount.isAutomatic,
        priority: discount.priority,
        isCombinable: discount.isCombinable,
        // Campaign
        campaignName: discount.campaignName,
        budgetType: discount.budgetType,
        budgetLimit: discount.budgetLimit,
        budgetUsed: discount.budgetUsed,
        // Targeting
        customerGroupIds: discount.customerGroupIds,
        regionIds: discount.regionIds,
        createdAt: discount.createdAt.toISO(),
        updatedAt: discount.updatedAt.toISO(),
      },
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const raw = request.only([
      'name',
      'code',
      'type',
      'value',
      'minimumOrderAmount',
      'maximumOrderAmount',
      'maximumDiscountAmount',
      'minimumQuantity',
      'usageLimit',
      'usageLimitPerCustomer',
      'startsAt',
      'endsAt',
      'isActive',
      'isPublic',
      'firstOrderOnly',
      'appliesTo',
      'productIds',
      'categoryIds',
      'customerIds',
      'buyQuantity',
      'getQuantity',
      'getDiscountPercentage',
      'isAutomatic',
      'priority',
      'isCombinable',
      'campaignName',
      'budgetType',
      'budgetLimit',
      'customerGroupIds',
      'regionIds',
    ])

    const toNum = (v: any) => (v !== '' && v != null ? Number(v) : undefined)

    try {
      await this.discountService.update(params.id, {
        name: raw.name,
        code: raw.code,
        type: raw.type,
        value: toNum(raw.value),
        minimumOrderAmount: toNum(raw.minimumOrderAmount),
        maximumOrderAmount: toNum(raw.maximumOrderAmount),
        maximumDiscountAmount: toNum(raw.maximumDiscountAmount),
        minimumQuantity: toNum(raw.minimumQuantity),
        usageLimit: toNum(raw.usageLimit),
        usageLimitPerCustomer: toNum(raw.usageLimitPerCustomer),
        startsAt: raw.startsAt ? DateTime.fromISO(raw.startsAt) : undefined,
        endsAt: raw.endsAt ? DateTime.fromISO(raw.endsAt) : undefined,
        isActive: raw.isActive,
        isPublic: raw.isPublic,
        firstOrderOnly: raw.firstOrderOnly,
        appliesTo: raw.appliesTo,
        productIds: raw.productIds,
        categoryIds: raw.categoryIds,
        customerIds: raw.customerIds,
        buyQuantity: toNum(raw.buyQuantity),
        getQuantity: toNum(raw.getQuantity),
        getDiscountPercentage: toNum(raw.getDiscountPercentage),
        isAutomatic: raw.isAutomatic,
        priority: toNum(raw.priority),
        isCombinable: raw.isCombinable,
        campaignName: raw.campaignName,
        budgetType: raw.budgetType,
        budgetLimit: toNum(raw.budgetLimit),
        customerGroupIds: raw.customerGroupIds,
        regionIds: raw.regionIds,
      })

      session.flash('success', 'Discount updated successfully')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    try {
      await this.discountService.delete(params.id)
      session.flash('success', 'Discount deleted')
      return response.redirect().toRoute('admin.discounts.index')
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async toggleStatus({ params, response, session }: HttpContext) {
    try {
      const discount = await this.discountService.findById(params.id)
      if (!discount) {
        session.flash('error', 'Discount not found')
        return response.redirect().back()
      }

      await this.discountService.update(params.id, { isActive: !discount.isActive })
      session.flash('success', `Discount ${discount.isActive ? 'deactivated' : 'activated'}`)
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }
}
