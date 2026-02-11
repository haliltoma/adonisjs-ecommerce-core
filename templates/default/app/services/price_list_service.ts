import PriceList from '#models/price_list'
import PriceListPrice from '#models/price_list_price'
import PriceListRule from '#models/price_list_rule'
import db from '@adonisjs/lucid/services/db'

interface CreatePriceListDTO {
  storeId: string
  name: string
  description?: string
  type: 'sale' | 'override'
  status?: 'active' | 'draft'
  startsAt?: string | null
  endsAt?: string | null
  rules?: { attribute: string; operator: string; value: unknown }[]
  prices?: { variantId: string; amount: number; currencyCode: string; minQuantity?: number; maxQuantity?: number }[]
}

interface UpdatePriceListDTO {
  name?: string
  description?: string | null
  type?: 'sale' | 'override'
  status?: 'active' | 'draft' | 'expired'
  startsAt?: string | null
  endsAt?: string | null
}

interface ListPriceListsOptions {
  storeId: string
  search?: string
  status?: string
  type?: string
  page?: number
  limit?: number
}

export default class PriceListService {
  async list(options: ListPriceListsOptions) {
    const { storeId, search, status, type, page = 1, limit = 20 } = options

    const query = PriceList.query()
      .where('storeId', storeId)
      .preload('rules')
      .withCount('prices')
      .orderBy('createdAt', 'desc')

    if (search) {
      query.where('name', 'ilike', `%${search}%`)
    }

    if (status) {
      query.where('status', status)
    }

    if (type) {
      query.where('type', type)
    }

    return query.paginate(page, limit)
  }

  async findById(storeId: string, priceListId: string) {
    return PriceList.query()
      .where('storeId', storeId)
      .where('id', priceListId)
      .preload('rules')
      .preload('prices', (query) => {
        query.preload('variant', (vq) => {
          vq.preload('product')
        })
      })
      .firstOrFail()
  }

  async create(data: CreatePriceListDTO) {
    return db.transaction(async (trx) => {
      const priceList = await PriceList.create(
        {
          storeId: data.storeId,
          name: data.name,
          description: data.description ?? null,
          type: data.type,
          status: data.status ?? 'draft',
          startsAt: data.startsAt ? new Date(data.startsAt) as any : null,
          endsAt: data.endsAt ? new Date(data.endsAt) as any : null,
          metadata: {},
        },
        { client: trx }
      )

      if (data.rules?.length) {
        await PriceListRule.createMany(
          data.rules.map((r) => ({
            priceListId: priceList.id,
            attribute: r.attribute,
            operator: r.operator as any,
            value: r.value,
          })),
          { client: trx }
        )
      }

      if (data.prices?.length) {
        await PriceListPrice.createMany(
          data.prices.map((p) => ({
            priceListId: priceList.id,
            variantId: p.variantId,
            amount: p.amount,
            currencyCode: p.currencyCode,
            minQuantity: p.minQuantity ?? null,
            maxQuantity: p.maxQuantity ?? null,
          })),
          { client: trx }
        )
      }

      return priceList
    })
  }

  async update(storeId: string, priceListId: string, data: UpdatePriceListDTO) {
    const priceList = await PriceList.query()
      .where('storeId', storeId)
      .where('id', priceListId)
      .firstOrFail()

    priceList.merge({
      ...data,
      startsAt: data.startsAt !== undefined ? (data.startsAt ? new Date(data.startsAt) as any : null) : priceList.startsAt,
      endsAt: data.endsAt !== undefined ? (data.endsAt ? new Date(data.endsAt) as any : null) : priceList.endsAt,
    })
    await priceList.save()
    return priceList
  }

  async delete(storeId: string, priceListId: string) {
    const priceList = await PriceList.query()
      .where('storeId', storeId)
      .where('id', priceListId)
      .firstOrFail()

    await priceList.delete()
  }

  async updateRules(
    storeId: string,
    priceListId: string,
    rules: { attribute: string; operator: string; value: unknown }[]
  ) {
    await PriceList.query()
      .where('storeId', storeId)
      .where('id', priceListId)
      .firstOrFail()

    await PriceListRule.query().where('priceListId', priceListId).delete()

    if (rules.length) {
      await PriceListRule.createMany(
        rules.map((r) => ({
          priceListId,
          attribute: r.attribute,
          operator: r.operator as any,
          value: r.value,
        }))
      )
    }
  }

  async addPrices(
    storeId: string,
    priceListId: string,
    prices: { variantId: string; amount: number; currencyCode: string; minQuantity?: number; maxQuantity?: number }[]
  ) {
    await PriceList.query()
      .where('storeId', storeId)
      .where('id', priceListId)
      .firstOrFail()

    await PriceListPrice.createMany(
      prices.map((p) => ({
        priceListId,
        variantId: p.variantId,
        amount: p.amount,
        currencyCode: p.currencyCode,
        minQuantity: p.minQuantity ?? null,
        maxQuantity: p.maxQuantity ?? null,
      }))
    )
  }

  async removePrices(storeId: string, priceListId: string, priceIds: string[]) {
    await PriceList.query()
      .where('storeId', storeId)
      .where('id', priceListId)
      .firstOrFail()

    await PriceListPrice.query()
      .where('priceListId', priceListId)
      .whereIn('id', priceIds)
      .delete()
  }

  async updatePrice(storeId: string, priceListId: string, priceId: string, amount: number) {
    await PriceList.query()
      .where('storeId', storeId)
      .where('id', priceListId)
      .firstOrFail()

    const price = await PriceListPrice.query()
      .where('priceListId', priceListId)
      .where('id', priceId)
      .firstOrFail()

    price.amount = amount
    await price.save()
    return price
  }
}
