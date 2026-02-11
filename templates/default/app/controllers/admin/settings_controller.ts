import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import StoreService from '#services/store_service'
import RegionService from '#services/region_service'
import SalesChannelService from '#services/sales_channel_service'
import CustomerGroupService from '#services/customer_group_service'
import ReturnService from '#services/return_service'
import ApiKeyService from '#services/api_key_service'
import ShippingProfileService from '#services/shipping_profile_service'
import TaxClass from '#models/tax_class'
import TaxRate from '#models/tax_rate'
import Currency from '#models/currency'
import Locale from '#models/locale'
import Webhook from '#models/webhook'
import User from '#models/user'
import Role from '#models/role'
import Permission from '#models/permission'
import Attribute from '#models/attribute'
import AttributeOption from '#models/attribute_option'
import IntegrationService from '#services/integration_service'
import UrlRedirect from '#models/url_redirect'
import WebhookLog from '#models/webhook_log'
import { randomBytes } from 'node:crypto'

export default class SettingsController {
  private storeService: StoreService
  private regionService: RegionService
  private salesChannelService: SalesChannelService
  private customerGroupService: CustomerGroupService
  private returnService: ReturnService
  private apiKeyService: ApiKeyService
  private shippingProfileService: ShippingProfileService

  constructor() {
    this.storeService = new StoreService()
    this.regionService = new RegionService()
    this.salesChannelService = new SalesChannelService()
    this.customerGroupService = new CustomerGroupService()
    this.returnService = new ReturnService()
    this.apiKeyService = new ApiKeyService()
    this.shippingProfileService = new ShippingProfileService()
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
    const raw = request.only([
      'name',
      'slug',
      'domain',
      'logoUrl',
      'defaultLocale',
      'defaultCurrency',
      'timezone',
    ])

    const data = {
      ...raw,
      domain: raw.domain || undefined,
      logoUrl: raw.logoUrl || undefined,
    }

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

    // Check if the request is in { group, settings } format or flat format
    const body = request.all()

    if (body.group && body.settings) {
      // Structured format: { group: 'general', settings: { key: { value, type, isPublic } } }
      try {
        for (const [key, value] of Object.entries(body.settings as Record<string, any>)) {
          const settingValue = value as { value: unknown; type: string; isPublic: boolean }
          await this.storeService.setSetting(
            storeId,
            body.group,
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

    // Flat format from settings/Index.tsx form
    const data = request.only([
      'storeName',
      'storeEmail',
      'storePhone',
      'storeAddress',
      'currency',
      'timezone',
      'locale',
      'taxEnabled',
      'taxRate',
      'taxIncludedInPrice',
      'shippingEnabled',
      'freeShippingThreshold',
      'lowStockThreshold',
      'orderPrefix',
      'metaTitle',
      'metaDescription',
    ])

    try {
      // Update store-level fields
      await this.storeService.update(storeId, {
        name: data.storeName || undefined,
        defaultCurrency: data.currency || undefined,
        timezone: data.timezone || undefined,
        defaultLocale: data.locale || undefined,
      })

      // Save general settings
      await this.storeService.setSetting(storeId, 'general', 'contactEmail', data.storeEmail || '', 'string')
      await this.storeService.setSetting(storeId, 'general', 'contactPhone', data.storePhone || '', 'string')
      await this.storeService.setSetting(storeId, 'general', 'address', data.storeAddress || '', 'string')
      await this.storeService.setSetting(storeId, 'general', 'orderPrefix', data.orderPrefix || 'ORD-', 'string')

      // Save tax settings
      await this.storeService.setSetting(storeId, 'tax', 'enabled', data.taxEnabled ?? false, 'boolean')
      await this.storeService.setSetting(storeId, 'tax', 'rate', data.taxRate ?? 0, 'number')
      await this.storeService.setSetting(storeId, 'tax', 'includedInPrice', data.taxIncludedInPrice ?? false, 'boolean')

      // Save shipping settings
      await this.storeService.setSetting(storeId, 'shipping', 'enabled', data.shippingEnabled ?? true, 'boolean')
      await this.storeService.setSetting(storeId, 'shipping', 'freeThreshold', data.freeShippingThreshold, 'number')

      // Save inventory settings
      await this.storeService.setSetting(storeId, 'inventory', 'lowStockThreshold', data.lowStockThreshold ?? 10, 'number')

      // Save SEO settings
      await this.storeService.setSetting(storeId, 'seo', 'metaTitle', data.metaTitle || '', 'string')
      await this.storeService.setSetting(storeId, 'seo', 'metaDescription', data.metaDescription || '', 'string')

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
  async payments({ inertia, store }: HttpContext) {
    const allSettings = await this.storeService.getAllSettings(store.id)
    const paymentSettings = allSettings.payment || {}

    const providers = [
      {
        id: 'manual',
        name: 'Manual Payment',
        description: 'Bank transfer, cash on delivery',
        isEnabled: (paymentSettings.manual_enabled as boolean) ?? true,
        config: {},
      },
      {
        id: 'stripe',
        name: 'Stripe',
        description: 'Credit card payments via Stripe',
        isEnabled: (paymentSettings.stripe_enabled as boolean) ?? false,
        config: {
          publicKey: (paymentSettings.stripe_public_key as string) || '',
          secretKey: (paymentSettings.stripe_secret_key as string) ? '••••••••' : '',
          webhookSecret: (paymentSettings.stripe_webhook_secret as string) ? '••••••••' : '',
        },
      },
      {
        id: 'iyzico',
        name: 'Iyzico',
        description: 'Iyzico payment gateway (Turkey)',
        isEnabled: (paymentSettings.iyzico_enabled as boolean) ?? false,
        config: {
          apiKey: (paymentSettings.iyzico_apiKey as string) || '',
          secretKey: (paymentSettings.iyzico_secretKey as string) ? '••••••••' : '',
          baseUrl: (paymentSettings.iyzico_baseUrl as string) || 'https://sandbox-api.iyzipay.com',
        },
      },
      {
        id: 'paypal',
        name: 'PayPal',
        description: 'PayPal checkout',
        isEnabled: (paymentSettings.paypal_enabled as boolean) ?? false,
        config: {
          clientId: (paymentSettings.paypal_client_id as string) || '',
          clientSecret: (paymentSettings.paypal_client_secret as string) ? '••••••••' : '',
        },
      },
    ]

    return inertia.render('admin/settings/Payments', { providers })
  }

  async updatePaymentProvider({ request, response, session, store }: HttpContext) {
    const { provider, isEnabled, config } = request.only(['provider', 'isEnabled', 'config'])

    try {
      await this.storeService.setSetting(store.id, 'payment', `${provider}_enabled`, isEnabled, 'boolean')

      if (config) {
        for (const [key, value] of Object.entries(config as Record<string, string>)) {
          if (value && !value.startsWith('••')) {
            await this.storeService.setSetting(store.id, 'payment', `${provider}_${key}`, value, 'string', false)
          }
        }
      }

      session.flash('success', 'Payment provider updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  // Shipping Settings
  async shipping({ inertia, store }: HttpContext) {
    const allSettings = await this.storeService.getAllSettings(store.id)
    const shippingSettings = allSettings.shipping || {}

    const methods = [
      {
        id: 'flat_rate',
        name: 'Flat Rate',
        description: 'Single flat rate for all orders',
        isEnabled: (shippingSettings.flat_rate_enabled as boolean) ?? true,
        rate: (shippingSettings.flat_rate_amount as number) ?? 10,
      },
      {
        id: 'free_shipping',
        name: 'Free Shipping',
        description: 'Free shipping above minimum order amount',
        isEnabled: (shippingSettings.free_shipping_enabled as boolean) ?? false,
        minimumAmount: (shippingSettings.free_shipping_minimum as number) ?? 50,
      },
    ]

    return inertia.render('admin/settings/Shipping', { zones: [], methods })
  }

  async updateShippingMethod({ request, response, session, store }: HttpContext) {
    const { method, isEnabled, rate, minimumAmount } = request.only(['method', 'isEnabled', 'rate', 'minimumAmount'])

    try {
      await this.storeService.setSetting(store.id, 'shipping', `${method}_enabled`, isEnabled, 'boolean')

      if (rate !== undefined) {
        await this.storeService.setSetting(store.id, 'shipping', `${method}_amount`, rate, 'number')
      }
      if (minimumAmount !== undefined) {
        await this.storeService.setSetting(store.id, 'shipping', `${method}_minimum`, minimumAmount, 'number')
      }

      session.flash('success', 'Shipping method updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
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

  // Webhook Settings
  private readonly availableWebhookEvents = [
    'order.created', 'order.updated', 'order.cancelled', 'order.fulfilled',
    'product.created', 'product.updated', 'product.deleted',
    'customer.created', 'customer.updated',
    'inventory.low_stock', 'inventory.updated',
    'payment.completed', 'payment.failed', 'payment.refunded',
  ]

  async webhooks({ inertia, store }: HttpContext) {
    const webhooks = await Webhook.query()
      .where('storeId', store.id)
      .orderBy('createdAt', 'desc')

    return inertia.render('admin/settings/Webhooks', {
      webhooks: webhooks.map((w) => ({
        id: w.id,
        name: w.name,
        url: w.url,
        secret: w.secret,
        events: w.events,
        isActive: w.isActive,
        failureCount: w.retryCount,
        lastTriggeredAt: w.lastTriggeredAt?.toISO(),
        createdAt: w.createdAt.toISO(),
      })),
      availableEvents: this.availableWebhookEvents,
    })
  }

  async createWebhook({ request, response, session, store }: HttpContext) {
    const data = request.only(['name', 'url', 'events', 'secret', 'headers', 'isActive'])

    try {
      const secret = data.secret || `whsec_${randomBytes(24).toString('hex')}`

      await Webhook.create({
        storeId: store.id,
        name: data.name || data.url,
        url: data.url,
        events: data.events || [],
        secret,
        headers: data.headers || null,
        isActive: data.isActive ?? true,
        retryCount: 0,
      })

      session.flash('success', 'Webhook created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateWebhook({ params, request, response, session, store }: HttpContext) {
    const data = request.only(['name', 'url', 'events', 'secret', 'headers', 'isActive'])

    try {
      const webhook = await Webhook.query()
        .where('id', params.id)
        .where('storeId', store.id)
        .firstOrFail()

      webhook.merge({
        name: data.name,
        url: data.url,
        events: data.events,
        secret: data.secret || webhook.secret,
        headers: data.headers,
        isActive: data.isActive,
      })
      await webhook.save()

      session.flash('success', 'Webhook updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroyWebhook({ params, response, session, store }: HttpContext) {
    try {
      const webhook = await Webhook.query()
        .where('id', params.id)
        .where('storeId', store.id)
        .firstOrFail()

      await webhook.delete()
      session.flash('success', 'Webhook deleted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async testWebhook({ params, response, store }: HttpContext) {
    try {
      const webhook = await Webhook.query()
        .where('id', params.id)
        .where('storeId', store.id)
        .firstOrFail()

      const { WebhookDispatcher } = await import('#contracts/webhook_provider')
      const dispatcher = await app.container.make(WebhookDispatcher)
      const results = await dispatcher.dispatch({
        storeId: store.id,
        event: 'test.ping',
        payload: {
          type: 'test',
          webhookId: webhook.id,
          timestamp: new Date().toISOString(),
          message: 'This is a test webhook delivery',
        },
      })

      const result = results.find((r) => r.webhookId === webhook.id)
      if (result?.success) {
        return response.json({ success: true, statusCode: result.statusCode, durationMs: result.durationMs })
      } else {
        return response.json({ success: false, error: result?.errorMessage || 'Delivery failed' })
      }
    } catch (error) {
      return response.json({ success: false, error: (error as Error).message })
    }
  }

  async webhookLogs({ params, response, store }: HttpContext) {
    const webhook = await Webhook.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .firstOrFail()

    const logs = await WebhookLog.query()
      .where('webhookId', webhook.id)
      .orderBy('createdAt', 'desc')
      .limit(50)

    return response.json({
      logs: logs.map((log) => ({
        id: log.id,
        event: log.event,
        status: log.status,
        responseStatus: log.responseStatus,
        attempts: log.attempts,
        createdAt: log.createdAt.toISO(),
      })),
    })
  }

  // User Management
  async users({ inertia }: HttpContext) {
    const users = await User.query()
      .preload('role')
      .orderBy('createdAt', 'desc')

    return inertia.render('admin/settings/Users', {
      users: users.map((u) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        isActive: u.isActive,
        role: u.role ? { id: u.role.id, name: u.role.name } : null,
        createdAt: u.createdAt.toISO(),
        lastLoginAt: u.lastLoginAt?.toISO(),
      })),
    })
  }

  async createUser({ request, response, session }: HttpContext) {
    const data = request.only(['fullName', 'email', 'password', 'roleId', 'isActive'])

    try {
      await User.create({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        roleId: data.roleId || null,
        isActive: data.isActive ?? true,
      })

      session.flash('success', 'User created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateUser({ params, request, response, session }: HttpContext) {
    const data = request.only(['fullName', 'email', 'roleId', 'isActive'])

    try {
      const user = await User.findOrFail(params.id)
      user.merge({
        fullName: data.fullName,
        email: data.email,
        roleId: data.roleId,
        isActive: data.isActive,
      })
      await user.save()

      session.flash('success', 'User updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroyUser({ params, response, session, admin }: HttpContext) {
    try {
      const user = await User.findOrFail(params.id)

      if (user.id === admin!.id) {
        session.flash('error', 'Cannot delete your own account')
        return response.redirect().back()
      }

      await user.delete()
      session.flash('success', 'User deleted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  // Roles & Permissions
  async roles({ inertia }: HttpContext) {
    const roles = await Role.query()
      .preload('permissions')
      .withCount('users')
      .orderBy('name', 'asc')

    const permissions = await Permission.query().orderBy('group', 'asc').orderBy('name', 'asc')

    return inertia.render('admin/settings/Roles', {
      roles: roles.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        isSystem: r.isSystem,
        usersCount: Number(r.$extras.users_count || 0),
        permissions: r.permissions.map((p) => p.slug),
      })),
      permissions: permissions.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        group: p.group,
      })),
    })
  }

  async createRole({ request, response, session }: HttpContext) {
    const data = request.only(['name', 'slug', 'description', 'permissions'])

    try {
      const role = await Role.create({
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        isSystem: false,
      })

      if (data.permissions?.length) {
        const permissionIds = await Permission.query()
          .whereIn('slug', data.permissions)
          .select('id')
        await role.related('permissions').sync(permissionIds.map((p) => p.id))
      }

      session.flash('success', 'Role created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateRole({ params, request, response, session }: HttpContext) {
    const data = request.only(['name', 'description', 'permissions'])

    try {
      const role = await Role.findOrFail(params.id)
      role.merge({ name: data.name, description: data.description })
      await role.save()

      if (data.permissions) {
        const permissionIds = await Permission.query()
          .whereIn('slug', data.permissions)
          .select('id')
        await role.related('permissions').sync(permissionIds.map((p) => p.id))
      }

      session.flash('success', 'Role updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroyRole({ params, response, session }: HttpContext) {
    try {
      const role = await Role.findOrFail(params.id)

      if (role.isSystem) {
        session.flash('error', 'Cannot delete system roles')
        return response.redirect().back()
      }

      await role.related('permissions').detach()
      await role.delete()
      session.flash('success', 'Role deleted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  // SEO Settings
  async seo({ inertia, store }: HttpContext) {
    const allSettings = await this.storeService.getAllSettings(store.id)
    const seo = allSettings.seo || {}

    return inertia.render('admin/settings/Seo', {
      settings: {
        metaTitle: (seo.metaTitle as string) || store.name || '',
        metaDescription: (seo.metaDescription as string) || '',
        ogImage: (seo.ogImage as string) || '',
        sitemapEnabled: (seo.sitemapEnabled as boolean) ?? true,
        robotsTxt: (seo.robotsTxt as string) || 'User-agent: *\nAllow: /',
        googleVerification: (seo.googleVerification as string) || '',
        bingVerification: (seo.bingVerification as string) || '',
        structuredDataEnabled: (seo.structuredDataEnabled as boolean) ?? true,
      },
    })
  }

  async updateSeo({ request, response, session, store }: HttpContext) {
    const data = request.only([
      'metaTitle', 'metaDescription', 'ogImage', 'sitemapEnabled',
      'robotsTxt', 'googleVerification', 'bingVerification', 'structuredDataEnabled',
    ])

    try {
      for (const [key, value] of Object.entries(data)) {
        const type = typeof value === 'boolean' ? 'boolean' : 'string'
        await this.storeService.setSetting(store.id, 'seo', key, value, type as any, true)
      }

      session.flash('success', 'SEO settings updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  // Store Settings
  async store({ inertia, store }: HttpContext) {
    const allSettings = await this.storeService.getAllSettings(store.id)
    const general = allSettings.general || {}

    return inertia.render('admin/settings/Store', {
      store: {
        name: store.name,
        slug: store.slug,
        domain: store.domain,
        logoUrl: store.logoUrl,
        defaultCurrency: store.defaultCurrency,
        defaultLocale: store.defaultLocale,
        timezone: store.timezone,
        contactEmail: (general.contactEmail as string) || '',
        contactPhone: (general.contactPhone as string) || '',
        address: (general.address as string) || '',
        city: (general.city as string) || '',
        state: (general.state as string) || '',
        postalCode: (general.postalCode as string) || '',
        country: (general.country as string) || '',
      },
    })
  }

  async updateStore({ request, response, session, store }: HttpContext) {
    const data = request.only([
      'name', 'slug', 'domain', 'logoUrl',
      'contactEmail', 'contactPhone', 'address', 'city', 'state', 'postalCode', 'country',
    ])

    try {
      await this.storeService.update(store.id, {
        name: data.name || undefined,
        slug: data.slug || undefined,
        domain: data.domain || undefined,
        logoUrl: data.logoUrl || undefined,
      })

      const contactFields: Record<string, string> = {
        contactEmail: data.contactEmail || '',
        contactPhone: data.contactPhone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        postalCode: data.postalCode || '',
        country: data.country || '',
      }
      for (const [field, value] of Object.entries(contactFields)) {
        await this.storeService.setSetting(store.id, 'general', field, value, 'string')
      }

      session.flash('success', 'Store settings updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  // Attributes Management
  async attributes({ inertia, store }: HttpContext) {
    const attributes = await Attribute.query()
      .where('storeId', store.id)
      .preload('options', (q) => q.orderBy('sortOrder', 'asc'))
      .orderBy('sortOrder', 'asc')

    return inertia.render('admin/settings/Attributes', {
      attributes: attributes.map((a) => ({
        id: a.id,
        name: a.name,
        code: a.code,
        type: a.type,
        isRequired: a.isRequired,
        isFilterable: a.isFilterable,
        isSearchable: a.isSearchable,
        isVisibleOnFront: a.isVisibleOnFront,
        sortOrder: a.sortOrder,
        options: a.options?.map((o) => ({
          id: o.id,
          label: o.label,
          value: o.value,
          sortOrder: o.sortOrder,
        })),
      })),
    })
  }

  async createAttribute({ request, response, session, store }: HttpContext) {
    const data = request.only([
      'name', 'code', 'type', 'isRequired', 'isFilterable',
      'isSearchable', 'isVisibleOnFront', 'sortOrder', 'options',
    ])

    try {
      const attribute = await Attribute.create({
        storeId: store.id,
        name: data.name,
        code: data.code,
        type: data.type || 'text',
        isRequired: data.isRequired ?? false,
        isFilterable: data.isFilterable ?? false,
        isSearchable: data.isSearchable ?? false,
        isVisibleOnFront: data.isVisibleOnFront ?? true,
        sortOrder: data.sortOrder ?? 0,
      })

      if (data.options?.length) {
        for (const opt of data.options) {
          await AttributeOption.create({
            attributeId: attribute.id,
            label: opt.label,
            value: opt.value,
            sortOrder: opt.sortOrder ?? 0,
          })
        }
      }

      session.flash('success', 'Attribute created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateAttribute({ params, request, response, session, store }: HttpContext) {
    const data = request.only([
      'name', 'code', 'type', 'isRequired', 'isFilterable',
      'isSearchable', 'isVisibleOnFront', 'sortOrder', 'options',
    ])

    try {
      const attribute = await Attribute.query()
        .where('id', params.id)
        .where('storeId', store.id)
        .firstOrFail()

      attribute.merge({
        name: data.name,
        code: data.code,
        type: data.type,
        isRequired: data.isRequired,
        isFilterable: data.isFilterable,
        isSearchable: data.isSearchable,
        isVisibleOnFront: data.isVisibleOnFront,
        sortOrder: data.sortOrder,
      })
      await attribute.save()

      if (data.options) {
        await AttributeOption.query().where('attributeId', attribute.id).delete()
        for (const opt of data.options) {
          await AttributeOption.create({
            attributeId: attribute.id,
            label: opt.label,
            value: opt.value,
            sortOrder: opt.sortOrder ?? 0,
          })
        }
      }

      session.flash('success', 'Attribute updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroyAttribute({ params, response, session, store }: HttpContext) {
    try {
      const attribute = await Attribute.query()
        .where('id', params.id)
        .where('storeId', store.id)
        .firstOrFail()

      await AttributeOption.query().where('attributeId', attribute.id).delete()
      await attribute.delete()

      session.flash('success', 'Attribute deleted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  // ─── Regions ────────────────────────────────────────────────────────

  async regions({ inertia, request, store }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search')

    const regions = await this.regionService.list({
      storeId: store.id,
      search,
      page,
      limit: 50,
    })

    const currencies = await Currency.query().where('isActive', true).orderBy('code', 'asc')

    return inertia.render('admin/settings/Regions', {
      regions: {
        data: regions.all().map((r) => ({
          id: r.id,
          name: r.name,
          currencyCode: r.currencyCode,
          taxRate: r.taxRate,
          taxCode: r.taxCode,
          includesTax: r.includesTax,
          paymentProviders: r.paymentProviders,
          fulfillmentProviders: r.fulfillmentProviders,
          isActive: r.isActive,
          countries: r.countries.map((c) => ({
            id: c.id,
            countryCode: c.countryCode,
            countryName: c.countryName,
          })),
          createdAt: r.createdAt.toISO(),
        })),
        meta: regions.getMeta(),
      },
      currencies: currencies.map((c) => ({ code: c.code, name: c.name, symbol: c.symbol })),
    })
  }

  async createRegion({ request, response, session, store }: HttpContext) {
    const data = request.only([
      'name', 'currencyCode', 'taxRate', 'taxCode',
      'includesTax', 'paymentProviders', 'fulfillmentProviders', 'countries',
    ])

    try {
      await this.regionService.create({
        storeId: store.id,
        name: data.name,
        currencyCode: data.currencyCode,
        taxRate: data.taxRate,
        taxCode: data.taxCode,
        includesTax: data.includesTax,
        paymentProviders: data.paymentProviders,
        fulfillmentProviders: data.fulfillmentProviders,
        countries: data.countries,
      })

      session.flash('success', 'Region created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateRegion({ params, request, response, session, store }: HttpContext) {
    const data = request.only([
      'name', 'currencyCode', 'taxRate', 'taxCode',
      'includesTax', 'paymentProviders', 'fulfillmentProviders', 'isActive',
    ])

    try {
      await this.regionService.update(store.id, params.id, data)
      session.flash('success', 'Region updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroyRegion({ params, response, session, store }: HttpContext) {
    try {
      await this.regionService.delete(store.id, params.id)
      session.flash('success', 'Region deleted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async addRegionCountries({ params, request, response, session, store }: HttpContext) {
    const { countries } = request.only(['countries'])

    try {
      await this.regionService.addCountries(store.id, params.id, countries)
      session.flash('success', 'Countries added')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async removeRegionCountry({ params, response, session, store }: HttpContext) {
    try {
      await this.regionService.removeCountry(store.id, params.id, params.countryCode)
      session.flash('success', 'Country removed')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  // ─── Sales Channels ────────────────────────────────────────────────

  async salesChannels({ inertia, request, store }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search')

    const channels = await this.salesChannelService.list({
      storeId: store.id,
      search,
      page,
      limit: 50,
    })

    return inertia.render('admin/settings/SalesChannels', {
      salesChannels: {
        data: channels.all().map((ch) => ({
          id: ch.id,
          name: ch.name,
          description: ch.description,
          isActive: ch.isActive,
          productsCount: Number(ch.$extras.products_count || 0),
          createdAt: ch.createdAt.toISO(),
        })),
        meta: channels.getMeta(),
      },
    })
  }

  async createSalesChannel({ request, response, session, store }: HttpContext) {
    const data = request.only(['name', 'description'])

    try {
      await this.salesChannelService.create({
        storeId: store.id,
        name: data.name,
        description: data.description,
      })

      session.flash('success', 'Sales channel created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateSalesChannel({ params, request, response, session, store }: HttpContext) {
    const data = request.only(['name', 'description', 'isActive'])

    try {
      await this.salesChannelService.update(store.id, params.id, data)
      session.flash('success', 'Sales channel updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroySalesChannel({ params, response, session, store }: HttpContext) {
    try {
      await this.salesChannelService.delete(store.id, params.id)
      session.flash('success', 'Sales channel deleted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async addSalesChannelProducts({ params, request, response, session, store }: HttpContext) {
    const { productIds } = request.only(['productIds'])

    try {
      await this.salesChannelService.addProducts(store.id, params.id, productIds)
      session.flash('success', 'Products added to channel')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async removeSalesChannelProducts({ params, request, response, session, store }: HttpContext) {
    const { productIds } = request.only(['productIds'])

    try {
      await this.salesChannelService.removeProducts(store.id, params.id, productIds)
      session.flash('success', 'Products removed from channel')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  // ─── Customer Groups ───────────────────────────────────────────────

  async customerGroups({ inertia, request, store }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search')

    const groups = await this.customerGroupService.list({
      storeId: store.id,
      search,
      page,
      limit: 50,
    })

    return inertia.render('admin/settings/CustomerGroups', {
      customerGroups: {
        data: groups.all().map((g) => ({
          id: g.id,
          name: g.name,
          slug: g.slug,
          description: g.description,
          discountPercentage: g.discountPercentage,
          isActive: g.isActive,
          isDefault: g.isDefault,
          customersCount: Number(g.$extras.customers_count || 0),
          createdAt: g.createdAt.toISO(),
        })),
        meta: groups.getMeta(),
      },
    })
  }

  async createCustomerGroup({ request, response, session, store }: HttpContext) {
    const data = request.only(['name', 'description', 'discountPercentage', 'conditions'])

    try {
      await this.customerGroupService.create({
        storeId: store.id,
        name: data.name,
        description: data.description,
        discountPercentage: data.discountPercentage,
        conditions: data.conditions,
      })

      session.flash('success', 'Customer group created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateCustomerGroup({ params, request, response, session, store }: HttpContext) {
    const data = request.only(['name', 'description', 'discountPercentage', 'isActive', 'isDefault', 'conditions'])

    try {
      await this.customerGroupService.update(store.id, params.id, data)
      session.flash('success', 'Customer group updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroyCustomerGroup({ params, response, session, store }: HttpContext) {
    try {
      await this.customerGroupService.delete(store.id, params.id)
      session.flash('success', 'Customer group deleted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async addCustomersToGroup({ params, request, response, session, store }: HttpContext) {
    const { customerIds } = request.only(['customerIds'])

    try {
      await this.customerGroupService.addCustomers(store.id, params.id, customerIds)
      session.flash('success', 'Customers added to group')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async removeCustomersFromGroup({ params, request, response, session, store }: HttpContext) {
    const { customerIds } = request.only(['customerIds'])

    try {
      await this.customerGroupService.removeCustomers(store.id, params.id, customerIds)
      session.flash('success', 'Customers removed from group')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  // Return Reasons
  async returnReasons({ inertia, store }: HttpContext) {
    const storeId = store.id
    const reasons = await this.returnService.listReasons(storeId)

    return inertia.render('admin/settings/ReturnReasons', {
      reasons: reasons.map((r) => ({
        id: r.id,
        value: r.value,
        label: r.label,
        description: r.description,
        sortOrder: r.sortOrder,
        children: r.children?.map((c: any) => ({
          id: c.id,
          value: c.value,
          label: c.label,
          description: c.description,
          sortOrder: c.sortOrder,
        })),
      })),
    })
  }

  async createReturnReason({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const data = request.only(['value', 'label', 'description', 'parentId'])

    try {
      await this.returnService.createReason(storeId, data)
      session.flash('success', 'Return reason created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateReturnReason({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id
    const data = request.only(['label', 'description', 'sortOrder'])

    try {
      await this.returnService.updateReason(storeId, params.id, data)
      session.flash('success', 'Return reason updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroyReturnReason({ params, response, session, store }: HttpContext) {
    const storeId = store.id

    try {
      await this.returnService.deleteReason(storeId, params.id)
      session.flash('success', 'Return reason deleted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  // Shipping Profiles
  async shippingProfiles({ inertia, store }: HttpContext) {
    const storeId = store.id
    const profiles = await this.shippingProfileService.list(storeId)

    return inertia.render('admin/settings/ShippingProfiles', {
      profiles: profiles.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        productsCount: (p as any).$extras.products_count || 0,
        createdAt: p.createdAt.toISO(),
      })),
    })
  }

  async createShippingProfile({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const data = request.only(['name', 'type'])

    try {
      await this.shippingProfileService.create(storeId, data)
      session.flash('success', 'Shipping profile created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateShippingProfile({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id
    const data = request.only(['name', 'type'])

    try {
      await this.shippingProfileService.update(storeId, params.id, data)
      session.flash('success', 'Shipping profile updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroyShippingProfile({ params, response, session, store }: HttpContext) {
    const storeId = store.id

    try {
      await this.shippingProfileService.delete(storeId, params.id)
      session.flash('success', 'Shipping profile deleted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  // API Keys
  async apiKeys({ inertia, store }: HttpContext) {
    const storeId = store.id
    const apiKeys = await this.apiKeyService.list(storeId)
    const salesChannels = await this.salesChannelService.getAllForStore(storeId)

    return inertia.render('admin/settings/ApiKeys', {
      apiKeys: apiKeys.map((k) => ({
        id: k.id,
        title: k.title,
        type: k.type,
        prefix: k.prefix,
        last4: k.last4,
        isRevoked: !!k.revokedAt,
        revokedAt: k.revokedAt?.toISO(),
        lastUsedAt: k.lastUsedAt?.toISO(),
        createdBy: k.creator ? { id: k.creator.id, name: k.creator.displayName } : null,
        salesChannels: k.salesChannels?.map((sc: any) => ({ id: sc.id, name: sc.name })),
        createdAt: k.createdAt.toISO(),
      })),
      salesChannels: salesChannels.map((sc) => ({ id: sc.id, name: sc.name })),
    })
  }

  async createApiKey({ request, response, session, store, admin }: HttpContext) {
    const storeId = store.id
    const { title, type, salesChannelIds } = request.only(['title', 'type', 'salesChannelIds'])

    try {
      const { rawToken } = await this.apiKeyService.create({
        storeId,
        title,
        type,
        createdBy: admin?.id,
        salesChannelIds,
      })
      session.flash('success', 'API key created')
      session.flash('newToken', rawToken)
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async revokeApiKey({ params, response, session, store }: HttpContext) {
    const storeId = store.id

    try {
      await this.apiKeyService.revoke(storeId, params.id)
      session.flash('success', 'API key revoked')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroyApiKey({ params, response, session, store }: HttpContext) {
    const storeId = store.id

    try {
      await this.apiKeyService.delete(storeId, params.id)
      session.flash('success', 'API key deleted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  // Integrations
  async integrations({ inertia, store }: HttpContext) {
    const integrationService = new IntegrationService()
    const list = await integrationService.getIntegrationList(store.id)

    return inertia.render('admin/settings/Integrations', {
      integrations: list,
      categories: ['payment', 'shipping', 'accounting', 'crm', 'email_marketing', 'analytics', 'search', 'storage'],
    })
  }

  // Plugins
  async plugins({ inertia }: HttpContext) {
    return inertia.render('admin/plugins/Index', {
      plugins: [],
    })
  }

  // ── URL Redirects ────────────────────────────────────────

  async redirects({ inertia, request, store }: HttpContext) {
    const page = request.input('page', 1)
    const search = request.input('search', '')

    const query = UrlRedirect.query()
      .where('storeId', store.id)
      .orderBy('createdAt', 'desc')

    if (search) {
      query.where((builder) => {
        builder
          .whereILike('source_path', `%${search}%`)
          .orWhereILike('target_path', `%${search}%`)
      })
    }

    const redirects = await query.paginate(page, 25)

    return inertia.render('admin/settings/Redirects', {
      redirects: redirects.serialize(),
      filters: { search },
    })
  }

  async createRedirect({ request, response, session, store }: HttpContext) {
    const data = request.only(['fromPath', 'toPath', 'type'])

    try {
      // Ensure path starts with /
      const fromPath = data.fromPath.startsWith('/') ? data.fromPath : `/${data.fromPath}`
      const toPath = data.toPath.startsWith('/') || data.toPath.startsWith('http')
        ? data.toPath
        : `/${data.toPath}`

      // Check for duplicates
      const existing = await UrlRedirect.query()
        .where('storeId', store.id)
        .where('source_path', fromPath)
        .first()

      if (existing) {
        session.flash('error', `A redirect from "${fromPath}" already exists`)
        return response.redirect().back()
      }

      // Prevent circular redirects
      if (fromPath === toPath) {
        session.flash('error', 'Source and target paths cannot be the same')
        return response.redirect().back()
      }

      await UrlRedirect.create({
        storeId: store.id,
        fromPath,
        toPath,
        type: data.type || 'permanent',
        isActive: true,
        hitCount: 0,
      })

      session.flash('success', 'Redirect created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateRedirect({ params, request, response, session, store }: HttpContext) {
    const redirect = await UrlRedirect.query()
      .where('storeId', store.id)
      .where('id', params.id)
      .firstOrFail()

    const data = request.only(['fromPath', 'toPath', 'type', 'isActive'])

    try {
      if (data.fromPath !== undefined) {
        redirect.fromPath = data.fromPath.startsWith('/') ? data.fromPath : `/${data.fromPath}`
      }
      if (data.toPath !== undefined) {
        redirect.toPath = data.toPath.startsWith('/') || data.toPath.startsWith('http')
          ? data.toPath
          : `/${data.toPath}`
      }
      if (data.type !== undefined) redirect.type = data.type
      if (data.isActive !== undefined) redirect.isActive = data.isActive

      await redirect.save()

      session.flash('success', 'Redirect updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroyRedirect({ params, response, session, store }: HttpContext) {
    const redirect = await UrlRedirect.query()
      .where('storeId', store.id)
      .where('id', params.id)
      .firstOrFail()

    await redirect.delete()

    session.flash('success', 'Redirect deleted')
    return response.redirect().back()
  }

  // ── Cache Management ──────────────────────────────────────

  async clearCache({ request, response, session, store }: HttpContext) {
    const scope = request.input('scope', 'all') as string

    try {
      const { CacheProvider } = await import('#contracts/cache_provider')
      const cache = await app.container.make(CacheProvider)
      const storeId = store.id
      let cleared = 0

      switch (scope) {
        case 'products':
          cleared += await cache.deletePattern(`store:${storeId}:product:*`)
          cleared += await cache.deletePattern(`store:${storeId}:products:*`)
          break
        case 'categories':
          cleared += await cache.deletePattern(`store:${storeId}:categories:*`)
          cleared += await cache.deletePattern(`store:${storeId}:navigation`)
          break
        case 'orders':
          cleared += await cache.deletePattern(`store:${storeId}:order:*`)
          cleared += await cache.deletePattern(`store:${storeId}:orders:*`)
          break
        case 'analytics':
          cleared += await cache.deletePattern(`store:${storeId}:analytics:*`)
          break
        case 'all':
        default:
          cleared += await cache.deletePattern(`store:${storeId}:*`)
          break
      }

      session.flash('success', `Cache cleared successfully (${cleared} entries removed)`)
    } catch (error) {
      session.flash('error', `Failed to clear cache: ${(error as Error).message}`)
    }

    return response.redirect().back()
  }
}
