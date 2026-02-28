import type { HttpContext } from '@adonisjs/core/http'
import GiftCardService from '#services/gift_card_service'
import Region from '#models/region'

export default class GiftCardsController {
  private giftCardService: GiftCardService

  constructor() {
    this.giftCardService = new GiftCardService()
  }

  async index({ inertia, request, store }: HttpContext) {
    const storeId = store.id
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search')

    const giftCards = await this.giftCardService.list({
      storeId,
      search,
      page,
      limit,
    })

    return inertia.render('admin/gift-cards/Index', {
      giftCards: {
        data: giftCards.all().map((gc) => ({
          id: gc.id,
          code: gc.code,
          value: gc.value,
          balance: gc.balance,
          currencyCode: gc.currencyCode,
          isDisabled: gc.isDisabled,
          region: gc.region ? { id: gc.region.id, name: gc.region.name } : null,
          endsAt: gc.endsAt?.toISO(),
          createdAt: gc.createdAt.toISO(),
        })),
        meta: giftCards.getMeta(),
      },
      filters: { search },
    })
  }

  async create({ inertia, store }: HttpContext) {
    const regions = await Region.query().where('storeId', store.id).where('isActive', true)

    return inertia.render('admin/gift-cards/Create', {
      regions: regions.map((r) => ({
        id: r.id,
        name: r.name,
        currencyCode: r.currencyCode,
      })),
    })
  }

  async store({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const data = request.only(['value', 'currencyCode', 'regionId', 'endsAt'])

    try {
      const giftCard = await this.giftCardService.create({
        storeId,
        ...data,
      })
      session.flash('success', `Gift card ${giftCard.code} created`)
      return response.redirect().toRoute('admin.giftCards.show', { id: giftCard.id })
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async show({ params, inertia, store }: HttpContext) {
    const storeId = store.id

    try {
      const giftCard = await this.giftCardService.findById(storeId, params.id)

      return inertia.render('admin/gift-cards/Show', {
        giftCard: {
          id: giftCard.id,
          code: giftCard.code,
          value: giftCard.value,
          balance: giftCard.balance,
          currencyCode: giftCard.currencyCode,
          isDisabled: giftCard.isDisabled,
          region: giftCard.region ? { id: giftCard.region.id, name: giftCard.region.name } : null,
          order: giftCard.order ? { id: giftCard.order.id, orderNumber: giftCard.order.orderNumber } : null,
          endsAt: giftCard.endsAt?.toISO(),
          createdAt: giftCard.createdAt.toISO(),
          transactions: giftCard.transactions.map((t) => ({
            id: t.id,
            amount: t.amount,
            type: t.type,
            note: t.note,
            order: t.order ? { id: t.order.id, orderNumber: t.order.orderNumber } : null,
            createdAt: t.createdAt.toISO(),
          })),
        },
      })
    } catch {
      return inertia.render('admin/errors/NotFound', { resource: 'Gift Card' })
    }
  }

  async update({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id
    const data = request.only(['regionId', 'endsAt'])

    try {
      await this.giftCardService.update(storeId, params.id, data)
      session.flash('success', 'Gift card updated')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async adjustBalance({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id
    const { amount, note } = request.only(['amount', 'note'])

    try {
      await this.giftCardService.adjustBalance(storeId, params.id, amount, note)
      session.flash('success', 'Gift card balance adjusted')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session, store }: HttpContext) {
    const storeId = store.id

    try {
      const giftCard = await this.giftCardService.findById(storeId, params.id)
      if (giftCard.balance > 0 && !giftCard.isDisabled) {
        session.flash('error', 'Cannot delete an active gift card with remaining balance. Disable it first.')
        return response.redirect().back()
      }
      await giftCard.delete()
      session.flash('success', 'Gift card deleted')
      return response.redirect().toRoute('admin.giftCards.index')
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async toggleStatus({ params, response, session, store }: HttpContext) {
    const storeId = store.id

    try {
      const giftCard = await this.giftCardService.findById(storeId, params.id)
      if (giftCard.isDisabled) {
        await this.giftCardService.enable(storeId, params.id)
        session.flash('success', 'Gift card enabled')
      } else {
        await this.giftCardService.disable(storeId, params.id)
        session.flash('success', 'Gift card disabled')
      }
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }
}
