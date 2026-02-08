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

    const discounts = await this.discountService.list({
      storeId,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
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
          startsAt: d.startsAt?.toISO(),
          endsAt: d.endsAt?.toISO(),
          createdAt: d.createdAt.toISO(),
        })),
        meta: discounts.getMeta(),
      },
      filters: { isActive, type, search },
    })
  }

  async create({ inertia }: HttpContext) {
    return inertia.render('admin/discounts/Create')
  }

  async store({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const data = request.only([
      'name',
      'code',
      'type',
      'value',
      'minimumOrderAmount',
      'maximumDiscountAmount',
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
    ])

    try {
      const discount = await this.discountService.create({
        storeId,
        ...data,
        startsAt: data.startsAt ? DateTime.fromISO(data.startsAt) : undefined,
        endsAt: data.endsAt ? DateTime.fromISO(data.endsAt) : undefined,
      })

      session.flash('success', 'Discount created successfully')
      return response.redirect().toRoute('admin.discounts.edit', { id: discount.id })
    } catch (error) {
      session.flash('error', error.message)
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
        maximumDiscountAmount: discount.maximumDiscountAmount,
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
        createdAt: discount.createdAt.toISO(),
        updatedAt: discount.updatedAt.toISO(),
      },
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const data = request.only([
      'name',
      'code',
      'type',
      'value',
      'minimumOrderAmount',
      'maximumDiscountAmount',
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
    ])

    try {
      await this.discountService.update(params.id, {
        ...data,
        startsAt: data.startsAt ? DateTime.fromISO(data.startsAt) : undefined,
        endsAt: data.endsAt ? DateTime.fromISO(data.endsAt) : undefined,
      })

      session.flash('success', 'Discount updated successfully')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    try {
      await this.discountService.delete(params.id)
      session.flash('success', 'Discount deleted')
      return response.redirect().toRoute('admin.discounts.index')
    } catch (error) {
      session.flash('error', error.message)
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
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }
}
