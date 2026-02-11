import Region from '#models/region'
import RegionCountry from '#models/region_country'
import db from '@adonisjs/lucid/services/db'

interface CreateRegionDTO {
  storeId: string
  name: string
  currencyCode: string
  taxRate?: number
  taxCode?: string
  includesTax?: boolean
  paymentProviders?: string[]
  fulfillmentProviders?: string[]
  countries?: { countryCode: string; countryName: string }[]
  metadata?: Record<string, unknown>
}

interface UpdateRegionDTO {
  name?: string
  currencyCode?: string
  taxRate?: number
  taxCode?: string | null
  includesTax?: boolean
  paymentProviders?: string[]
  fulfillmentProviders?: string[]
  isActive?: boolean
  metadata?: Record<string, unknown>
}

interface ListRegionsOptions {
  storeId: string
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export default class RegionService {
  async list(options: ListRegionsOptions) {
    const { storeId, search, isActive, page = 1, limit = 20 } = options

    const query = Region.query()
      .where('storeId', storeId)
      .preload('countries')
      .orderBy('name', 'asc')

    if (search) {
      query.where('name', 'ilike', `%${search}%`)
    }

    if (isActive !== undefined) {
      query.where('isActive', isActive)
    }

    return query.paginate(page, limit)
  }

  async findById(storeId: string, regionId: string) {
    return Region.query()
      .where('storeId', storeId)
      .where('id', regionId)
      .preload('countries')
      .firstOrFail()
  }

  async create(data: CreateRegionDTO) {
    return db.transaction(async (trx) => {
      const region = await Region.create(
        {
          storeId: data.storeId,
          name: data.name,
          currencyCode: data.currencyCode,
          taxRate: data.taxRate ?? 0,
          taxCode: data.taxCode ?? null,
          includesTax: data.includesTax ?? false,
          paymentProviders: data.paymentProviders ?? [],
          fulfillmentProviders: data.fulfillmentProviders ?? [],
          metadata: data.metadata ?? {},
        },
        { client: trx }
      )

      if (data.countries?.length) {
        await RegionCountry.createMany(
          data.countries.map((c) => ({
            regionId: region.id,
            countryCode: c.countryCode,
            countryName: c.countryName,
          })),
          { client: trx }
        )
      }

      await region.load('countries')
      return region
    })
  }

  async update(storeId: string, regionId: string, data: UpdateRegionDTO) {
    const region = await Region.query()
      .where('storeId', storeId)
      .where('id', regionId)
      .firstOrFail()

    region.merge(data)
    await region.save()
    await region.load('countries')
    return region
  }

  async delete(storeId: string, regionId: string) {
    const region = await Region.query()
      .where('storeId', storeId)
      .where('id', regionId)
      .firstOrFail()

    await region.delete()
  }

  async addCountries(
    storeId: string,
    regionId: string,
    countries: { countryCode: string; countryName: string }[]
  ) {
    const region = await Region.query()
      .where('storeId', storeId)
      .where('id', regionId)
      .firstOrFail()

    await RegionCountry.createMany(
      countries.map((c) => ({
        regionId: region.id,
        countryCode: c.countryCode,
        countryName: c.countryName,
      }))
    )

    await region.load('countries')
    return region
  }

  async removeCountry(storeId: string, regionId: string, countryCode: string) {
    await Region.query()
      .where('storeId', storeId)
      .where('id', regionId)
      .firstOrFail()

    await RegionCountry.query()
      .where('regionId', regionId)
      .where('countryCode', countryCode)
      .delete()
  }

  async getAllForStore(storeId: string) {
    return Region.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .preload('countries')
      .orderBy('name', 'asc')
  }
}
