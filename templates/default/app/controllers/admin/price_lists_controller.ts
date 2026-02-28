import type { HttpContext } from '@adonisjs/core/http'
import PriceListService from '#services/price_list_service'
import Product from '#models/product'
import CustomerGroup from '#models/customer_group'
import Region from '#models/region'

export default class PriceListsController {
  private priceListService: PriceListService

  constructor() {
    this.priceListService = new PriceListService()
  }

  async index({ inertia, request, store }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search')
    const status = request.input('status')
    const type = request.input('type')

    const priceLists = await this.priceListService.list({
      storeId: store.id,
      search,
      status,
      type,
      page,
      limit: 20,
    })

    return inertia.render('admin/price-lists/Index', {
      priceLists: {
        data: priceLists.all().map((pl) => ({
          id: pl.id,
          name: pl.name,
          description: pl.description,
          type: pl.type,
          status: pl.status,
          startsAt: pl.startsAt?.toISO() ?? null,
          endsAt: pl.endsAt?.toISO() ?? null,
          rulesCount: pl.rules?.length ?? 0,
          pricesCount: Number(pl.$extras.prices_count || 0),
          createdAt: pl.createdAt.toISO(),
        })),
        meta: priceLists.getMeta(),
      },
    })
  }

  async create({ inertia, store }: HttpContext) {
    const products = await Product.query()
      .where('storeId', store.id)
      .where('status', 'active')
      .preload('variants')
      .orderBy('title', 'asc')
      .limit(100)

    const customerGroups = await CustomerGroup.query()
      .where('storeId', store.id)
      .where('isActive', true)
      .orderBy('name', 'asc')

    const regions = await Region.query()
      .where('storeId', store.id)
      .where('isActive', true)
      .orderBy('name', 'asc')

    return inertia.render('admin/price-lists/Create', {
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        variants: p.variants.map((v) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          price: v.price,
        })),
      })),
      customerGroups: customerGroups.map((g) => ({ id: g.id, name: g.name })),
      regions: regions.map((r) => ({ id: r.id, name: r.name, currencyCode: r.currencyCode })),
    })
  }

  async store({ request, response, session, store }: HttpContext) {
    const data = request.only([
      'name', 'description', 'type', 'status',
      'startsAt', 'endsAt', 'rules', 'prices',
    ])

    try {
      await this.priceListService.create({
        storeId: store.id,
        name: data.name,
        description: data.description,
        type: data.type,
        status: data.status,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        rules: data.rules,
        prices: data.prices,
      })

      session.flash('success', 'Price list created')
      return response.redirect().toRoute('admin.priceLists.index')
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async edit({ params, inertia, store }: HttpContext) {
    const priceList = await this.priceListService.findById(store.id, params.id)

    const products = await Product.query()
      .where('storeId', store.id)
      .where('status', 'active')
      .preload('variants')
      .orderBy('title', 'asc')
      .limit(100)

    const customerGroups = await CustomerGroup.query()
      .where('storeId', store.id)
      .where('isActive', true)
      .orderBy('name', 'asc')

    const regions = await Region.query()
      .where('storeId', store.id)
      .where('isActive', true)
      .orderBy('name', 'asc')

    return inertia.render('admin/price-lists/Edit', {
      priceList: {
        id: priceList.id,
        name: priceList.name,
        description: priceList.description,
        type: priceList.type,
        status: priceList.status,
        startsAt: priceList.startsAt?.toISO() ?? null,
        endsAt: priceList.endsAt?.toISO() ?? null,
        rules: priceList.rules.map((r) => ({
          id: r.id,
          attribute: r.attribute,
          operator: r.operator,
          value: r.value,
        })),
        prices: priceList.prices.map((p) => ({
          id: p.id,
          variantId: p.variantId,
          amount: p.amount,
          currencyCode: p.currencyCode,
          minQuantity: p.minQuantity,
          maxQuantity: p.maxQuantity,
          variant: p.variant
            ? {
                id: p.variant.id,
                title: p.variant.title,
                sku: p.variant.sku,
                price: p.variant.price,
                productTitle: p.variant.product?.title,
              }
            : null,
        })),
      },
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        variants: p.variants.map((v) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          price: v.price,
        })),
      })),
      customerGroups: customerGroups.map((g) => ({ id: g.id, name: g.name })),
      regions: regions.map((r) => ({ id: r.id, name: r.name, currencyCode: r.currencyCode })),
    })
  }

  async update({ params, request, response, session, store }: HttpContext) {
    const data = request.only(['name', 'description', 'type', 'status', 'startsAt', 'endsAt'])

    try {
      await this.priceListService.update(store.id, params.id, data)
      session.flash('success', 'Price list updated')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session, store }: HttpContext) {
    try {
      await this.priceListService.delete(store.id, params.id)
      session.flash('success', 'Price list deleted')
      return response.redirect().toRoute('admin.priceLists.index')
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateRules({ params, request, response, session, store }: HttpContext) {
    const { rules } = request.only(['rules'])

    try {
      await this.priceListService.updateRules(store.id, params.id, rules)
      session.flash('success', 'Rules updated')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async addPrices({ params, request, response, session, store }: HttpContext) {
    const { prices } = request.only(['prices'])

    try {
      await this.priceListService.addPrices(store.id, params.id, prices)
      session.flash('success', 'Prices added')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async removePrices({ params, request, response, session, store }: HttpContext) {
    const { priceIds } = request.only(['priceIds'])

    try {
      await this.priceListService.removePrices(store.id, params.id, priceIds)
      session.flash('success', 'Prices removed')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }
}
