import Store from '#models/store'
import Setting from '#models/setting'

interface CreateStoreDTO {
  name: string
  slug: string
  domain?: string
  logoUrl?: string
  defaultLocale?: string
  defaultCurrency?: string
  timezone?: string
  isActive?: boolean
  settings?: Record<string, unknown>
  meta?: Record<string, unknown>
}

interface UpdateStoreDTO {
  name?: string
  slug?: string
  domain?: string
  logoUrl?: string
  defaultLocale?: string
  defaultCurrency?: string
  timezone?: string
  isActive?: boolean
  settings?: Record<string, unknown>
  meta?: Record<string, unknown>
}

export default class StoreService {
  async create(data: CreateStoreDTO): Promise<Store> {
    return await Store.create({
      name: data.name,
      slug: data.slug,
      domain: data.domain,
      logoUrl: data.logoUrl,
      defaultLocale: data.defaultLocale || 'en',
      defaultCurrency: data.defaultCurrency || 'USD',
      timezone: data.timezone || 'UTC',
      isActive: data.isActive ?? true,
      config: data.settings || {},
      meta: data.meta || {},
    })
  }

  async update(storeId: string, data: UpdateStoreDTO): Promise<Store> {
    const store = await Store.findOrFail(storeId)

    store.merge({
      name: data.name,
      slug: data.slug,
      domain: data.domain,
      logoUrl: data.logoUrl,
      defaultLocale: data.defaultLocale,
      defaultCurrency: data.defaultCurrency,
      timezone: data.timezone,
      isActive: data.isActive,
      config: data.settings,
      meta: data.meta,
    })

    await store.save()
    return store
  }

  async findById(storeId: string): Promise<Store | null> {
    return await Store.find(storeId)
  }

  async findBySlug(slug: string): Promise<Store | null> {
    return await Store.query().where('slug', slug).first()
  }

  async findByDomain(domain: string): Promise<Store | null> {
    return await Store.query().where('domain', domain).first()
  }

  async getAll(): Promise<Store[]> {
    return await Store.query().orderBy('name', 'asc')
  }

  async getActive(): Promise<Store[]> {
    return await Store.query().where('isActive', true).orderBy('name', 'asc')
  }

  async delete(storeId: string): Promise<void> {
    const store = await Store.findOrFail(storeId)
    await store.delete()
  }

  // Settings Management
  async getSetting(storeId: string | null, group: string, key: string): Promise<unknown> {
    const setting = await Setting.query()
      .where((query) => {
        if (storeId) {
          query.where('storeId', storeId)
        } else {
          query.whereNull('storeId')
        }
      })
      .where('group', group)
      .where('key', key)
      .first()

    return setting?.getTypedValue() ?? null
  }

  async setSetting(
    storeId: string | null,
    group: string,
    key: string,
    value: unknown,
    type: 'string' | 'number' | 'boolean' | 'json' | 'array' = 'string',
    isPublic: boolean = false
  ): Promise<Setting> {
    const existing = await Setting.query()
      .where((query) => {
        if (storeId) {
          query.where('storeId', storeId)
        } else {
          query.whereNull('storeId')
        }
      })
      .where('group', group)
      .where('key', key)
      .first()

    if (existing) {
      existing.value = value
      existing.type = type
      existing.isPublic = isPublic
      await existing.save()
      return existing
    }

    return await Setting.create({
      storeId,
      group,
      key,
      value,
      type,
      isPublic,
    })
  }

  async getSettingsByGroup(storeId: string | null, group: string): Promise<Record<string, unknown>> {
    const settings = await Setting.query()
      .where((query) => {
        if (storeId) {
          query.where('storeId', storeId)
        } else {
          query.whereNull('storeId')
        }
      })
      .where('group', group)

    return settings.reduce(
      (acc, setting) => {
        acc[setting.key] = setting.getTypedValue()
        return acc
      },
      {} as Record<string, unknown>
    )
  }

  async getAllSettings(storeId: string): Promise<Record<string, Record<string, unknown>>> {
    const settings = await Setting.query().where('storeId', storeId)

    return settings.reduce(
      (acc, setting) => {
        if (!acc[setting.group]) {
          acc[setting.group] = {}
        }
        acc[setting.group][setting.key] = setting.getTypedValue()
        return acc
      },
      {} as Record<string, Record<string, unknown>>
    )
  }

  async getPublicSettings(storeId: string): Promise<Record<string, Record<string, unknown>>> {
    const settings = await Setting.query().where('storeId', storeId).where('isPublic', true)

    return settings.reduce(
      (acc, setting) => {
        if (!acc[setting.group]) {
          acc[setting.group] = {}
        }
        acc[setting.group][setting.key] = setting.getTypedValue()
        return acc
      },
      {} as Record<string, Record<string, unknown>>
    )
  }

  async deleteSetting(storeId: string | null, group: string, key: string): Promise<void> {
    await Setting.query()
      .where((query) => {
        if (storeId) {
          query.where('storeId', storeId)
        } else {
          query.whereNull('storeId')
        }
      })
      .where('group', group)
      .where('key', key)
      .delete()
  }

  // Store Statistics
  async getStats(storeId: string) {
    const store = await Store.query()
      .where('id', storeId)
      .withCount('products')
      .withCount('customers')
      .withCount('orders')
      .first()

    if (!store) return null

    return {
      productCount: Number(store.$extras.products_count || 0),
      customerCount: Number(store.$extras.customers_count || 0),
      orderCount: Number(store.$extras.orders_count || 0),
    }
  }
}
