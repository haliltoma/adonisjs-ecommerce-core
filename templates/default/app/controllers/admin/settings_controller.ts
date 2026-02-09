import type { HttpContext } from '@adonisjs/core/http'
import StoreService from '#services/store_service'
import TaxClass from '#models/tax_class'
import TaxRate from '#models/tax_rate'
import Currency from '#models/currency'
import Locale from '#models/locale'

export default class SettingsController {
  private storeService: StoreService

  constructor() {
    this.storeService = new StoreService()
  }

  async index({ inertia, store }: HttpContext) {
    const allSettings = await this.storeService.getAllSettings(store.id)
    const currencies = await Currency.query().where('isActive', true).orderBy('code', 'asc')
    const locales = await Locale.query().where('isActive', true).orderBy('code', 'asc')

    // Flatten settings into the shape the frontend expects
    const general = allSettings.general || {}
    const tax = allSettings.tax || {}
    const shipping = allSettings.shipping || {}
    const inventory = allSettings.inventory || {}
    const seo = allSettings.seo || {}

    return inertia.render('admin/settings/Index', {
      settings: {
        storeName: store.name || '',
        storeEmail: (general.contactEmail as string) || '',
        storePhone: (general.contactPhone as string) || '',
        storeAddress: (general.address as string) || '',
        storeLogo: store.logoUrl || null,
        storeFavicon: (general.favicon as string) || null,
        currency: store.defaultCurrency || 'USD',
        timezone: store.timezone || 'UTC',
        locale: store.defaultLocale || 'en',
        taxEnabled: (tax.enabled as boolean) ?? false,
        taxRate: (tax.rate as number) ?? 0,
        taxIncludedInPrice: (tax.includedInPrice as boolean) ?? false,
        shippingEnabled: (shipping.enabled as boolean) ?? true,
        freeShippingThreshold: (shipping.freeThreshold as number) ?? null,
        lowStockThreshold: (inventory.lowStockThreshold as number) ?? 10,
        orderPrefix: (general.orderPrefix as string) || 'ORD-',
        metaTitle: (seo.metaTitle as string) || store.name || '',
        metaDescription: (seo.metaDescription as string) || '',
      },
      currencies: currencies.map((c) => ({ code: c.code, name: c.name })),
      timezones: Intl.supportedValuesOf('timeZone'),
      locales: locales.map((l) => ({ code: l.code, name: l.name })),
    })
  }

  async updateGeneral({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const data = request.only([
      'name',
      'slug',
      'domain',
      'logoUrl',
      'defaultLocale',
      'defaultCurrency',
      'timezone',
    ])

    try {
      await this.storeService.update(storeId, data)
      session.flash('success', 'Store settings updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async updateSettings({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const { group, settings } = request.only(['group', 'settings'])

    try {
      for (const [key, value] of Object.entries(settings)) {
        const settingValue = value as { value: unknown; type: string; isPublic: boolean }
        await this.storeService.setSetting(
          storeId,
          group,
          key,
          settingValue.value,
          settingValue.type as any,
          settingValue.isPublic
        )
      }

      session.flash('success', 'Settings updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  // Tax Settings
  async taxes({ inertia, store }: HttpContext) {
    const storeId = store.id
    const taxClasses = await TaxClass.query().where('storeId', storeId).preload('rates')

    return inertia.render('admin/settings/Taxes', {
      taxClasses: taxClasses.map((tc) => ({
        id: tc.id,
        name: tc.name,
        description: tc.description,
        isDefault: tc.isDefault,
        rates: tc.rates?.map((r) => ({
          id: r.id,
          name: r.name,
          rate: r.rate,
          country: r.countryCode,
          state: r.stateCode,
          postalCode: r.postalCode,
          priority: r.priority,
          isCompound: r.isCompound,
        })),
      })),
    })
  }

  async createTaxClass({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const { name, description, isDefault } = request.only(['name', 'description', 'isDefault'])

    try {
      if (isDefault) {
        await TaxClass.query().where('storeId', storeId).update({ isDefault: false })
      }

      await TaxClass.create({
        storeId,
        name,
        description,
        isDefault: isDefault ?? false,
      })

      session.flash('success', 'Tax class created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async updateTaxClass({ params, request, response, session }: HttpContext) {
    const { name, description, isDefault } = request.only(['name', 'description', 'isDefault'])

    try {
      const taxClass = await TaxClass.findOrFail(params.id)

      if (isDefault && !taxClass.isDefault) {
        await TaxClass.query().where('storeId', taxClass.storeId).update({ isDefault: false })
      }

      taxClass.merge({ name, description, isDefault })
      await taxClass.save()

      session.flash('success', 'Tax class updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async deleteTaxClass({ params, response, session }: HttpContext) {
    try {
      const taxClass = await TaxClass.findOrFail(params.id)
      await taxClass.delete()

      session.flash('success', 'Tax class deleted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async createTaxRate({ params, request, response, session }: HttpContext) {
    const data = request.only([
      'name',
      'rate',
      'country',
      'state',
      'postalCode',
      'priority',
      'isCompound',
    ])

    try {
      await TaxRate.create({
        taxClassId: params.classId,
        ...data,
      })

      session.flash('success', 'Tax rate added')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async updateTaxRate({ params, request, response, session }: HttpContext) {
    const data = request.only([
      'name',
      'rate',
      'country',
      'state',
      'postalCode',
      'priority',
      'isCompound',
    ])

    try {
      const taxRate = await TaxRate.findOrFail(params.id)
      taxRate.merge(data)
      await taxRate.save()

      session.flash('success', 'Tax rate updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async deleteTaxRate({ params, response, session }: HttpContext) {
    try {
      const taxRate = await TaxRate.findOrFail(params.id)
      await taxRate.delete()

      session.flash('success', 'Tax rate deleted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  // Payment Settings
  async payments({ inertia }: HttpContext) {
    return inertia.render('admin/settings/Payments', {
      providers: [],
    })
  }

  // Shipping Settings
  async shipping({ inertia }: HttpContext) {
    return inertia.render('admin/settings/Shipping', {
      zones: [],
      methods: [],
    })
  }

  // Currency Settings
  async currencies({ inertia }: HttpContext) {
    const currencies = await Currency.query().orderBy('isDefault', 'desc').orderBy('name', 'asc')

    return inertia.render('admin/settings/Currencies', {
      currencies: currencies.map((c) => ({
        id: c.id,
        code: c.code,
        name: c.name,
        symbol: c.symbol,
        symbolPosition: c.symbolPosition,
        decimalPlaces: c.decimalPlaces,
        decimalSeparator: c.decimalSeparator,
        thousandsSeparator: c.thousandsSeparator,
        exchangeRate: c.exchangeRate,
        isDefault: c.isDefault,
        isActive: c.isActive,
      })),
    })
  }

  async createCurrency({ request, response, session }: HttpContext) {
    const data = request.only([
      'code',
      'name',
      'symbol',
      'symbolPosition',
      'decimalPlaces',
      'decimalSeparator',
      'thousandsSeparator',
      'exchangeRate',
      'isDefault',
      'isActive',
    ])

    try {
      if (data.isDefault) {
        await Currency.query().update({ isDefault: false })
      }

      await Currency.create(data)
      session.flash('success', 'Currency created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async updateCurrency({ params, request, response, session }: HttpContext) {
    const data = request.only([
      'code',
      'name',
      'symbol',
      'symbolPosition',
      'decimalPlaces',
      'decimalSeparator',
      'thousandsSeparator',
      'exchangeRate',
      'isDefault',
      'isActive',
    ])

    try {
      const currency = await Currency.findOrFail(params.id)

      if (data.isDefault && !currency.isDefault) {
        await Currency.query().update({ isDefault: false })
      }

      currency.merge(data)
      await currency.save()

      session.flash('success', 'Currency updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  // Locale Settings
  async locales({ inertia }: HttpContext) {
    const locales = await Locale.query().orderBy('isDefault', 'desc').orderBy('name', 'asc')

    return inertia.render('admin/settings/Locales', {
      locales: locales.map((l) => ({
        id: l.id,
        code: l.code,
        name: l.name,
        nativeName: l.nativeName,
        direction: l.direction,
        isDefault: l.isDefault,
        isActive: l.isActive,
      })),
    })
  }

  async createLocale({ request, response, session }: HttpContext) {
    const data = request.only(['code', 'name', 'nativeName', 'direction', 'isDefault', 'isActive'])

    try {
      if (data.isDefault) {
        await Locale.query().update({ isDefault: false })
      }

      await Locale.create(data)
      session.flash('success', 'Locale created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async updateLocale({ params, request, response, session }: HttpContext) {
    const data = request.only(['code', 'name', 'nativeName', 'direction', 'isDefault', 'isActive'])

    try {
      const locale = await Locale.findOrFail(params.id)

      if (data.isDefault && !locale.isDefault) {
        await Locale.query().update({ isDefault: false })
      }

      locale.merge(data)
      await locale.save()

      session.flash('success', 'Locale updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }
}
