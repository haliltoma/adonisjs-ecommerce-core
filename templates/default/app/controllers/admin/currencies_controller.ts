/**
 * Currencies Controller
 *
 * Admin API for managing currencies and exchange rates.
 */

import type { HttpContext } from '@adonisjs/core/http'
import { schema } from '@adonisjs/core/validator'
import { DateTime } from 'luxon'
import Currency from '#models/currency'
import { currencyService } from '#services/currency_service'

export default class CurrenciesController {
  /**
   * List all currencies
   * GET /admin/currencies
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const isActive = request.input('isActive') // true, false, or undefined for all

    const query = Currency.query().orderBy('isDefault', 'desc').orderBy('code', 'asc')

    if (isActive !== undefined) {
      query.where('isActive', isActive === 'true')
    }

    const currencies = await query.paginate(page, limit)

    return response.ok({
      data: currencies.toJSON().data,
      meta: currencies.toJSON().meta,
    })
  }

  /**
   * Get currency details
   * GET /admin/currencies/:id
   */
  async show({ params, response }: HttpContext) {
    const currency = await Currency.find(params.id)

    if (!currency) {
      return response.notFound({
        error: 'Currency not found',
      })
    }

    return response.ok({
      data: currency.serialize(),
    })
  }

  /**
   * Create new currency
   * POST /admin/currencies
   */
  async store({ request, response }: HttpContext) {
    const payload = await request.validate({
      schema: schema.create({
        code: schema.string({ maxLength: 3 }),
        name: schema.string(),
        symbol: schema.string(),
        symbolPosition: schema.enum(['before', 'after']),
        decimalPlaces: schema.number(),
        decimalSeparator: schema.string(),
        thousandsSeparator: schema.string(),
        exchangeRate: schema.number(),
        isActive: schema.boolean.optional(),
        isDefault: schema.boolean.optional(),
      }),
    })

    // If this is default, unset existing default
    if (payload.isDefault) {
      await Currency.query().where('isDefault', true).update({ isDefault: false })
    }

    const currency = await Currency.create(payload)

    return response.created({
      data: currency.serialize(),
      message: 'Currency created successfully',
    })
  }

  /**
   * Update currency
   * PATCH /admin/currencies/:id
   */
  async update({ params, request, response }: HttpContext) {
    const currency = await Currency.find(params.id)

    if (!currency) {
      return response.notFound({
        error: 'Currency not found',
      })
    }

    const payload = await request.validate({
      schema: schema.create({
        name: schema.string.optional(),
        symbol: schema.string.optional(),
        symbolPosition: schema.enum(['before', 'after']).optional(),
        decimalPlaces: schema.number.optional(),
        decimalSeparator: schema.string.optional(),
        thousandsSeparator: schema.string.optional(),
        exchangeRate: schema.number.optional(),
        isActive: schema.boolean.optional(),
        isDefault: schema.boolean.optional(),
      }),
    })

    // If setting as default, unset existing default
    if (payload.isDefault && !currency.isDefault) {
      await Currency.query().where('isDefault', true).update({ isDefault: false })
    }

    await currency.merge(payload).save()

    return response.ok({
      data: currency.serialize(),
      message: 'Currency updated successfully',
    })
  }

  /**
   * Delete currency
   * DELETE /admin/currencies/:id
   */
  async destroy({ params, response }: HttpContext) {
    const currency = await Currency.find(params.id)

    if (!currency) {
      return response.notFound({
        error: 'Currency not found',
      })
    }

    if (currency.isDefault) {
      return response.badRequest({
        error: 'Cannot delete default currency',
      })
    }

    await currency.delete()

    return response.ok({
      message: 'Currency deleted successfully',
    })
  }

  /**
   * Update exchange rate
   * POST /admin/currencies/:id/exchange-rate
   */
  async updateExchangeRate({ params, request, response }: HttpContext) {
    const currency = await Currency.find(params.id)

    if (!currency) {
      return response.notFound({
        error: 'Currency not found',
      })
    }

    const payload = await request.validate({
      schema: schema.create({
        exchangeRate: schema.number(),
      }),
    })

    currency.exchangeRate = payload.exchangeRate
    currency.rateUpdatedAt = DateTime.now()
    await currency.save()

    // Clear cache
    currencyService.clearCache()

    return response.ok({
      data: currency.serialize(),
      message: 'Exchange rate updated successfully',
    })
  }

  /**
   * Update all exchange rates from API
   * POST /admin/currencies/update-rates
   */
  async updateRates({ response }: HttpContext) {
    try {
      const result = await currencyService.updateExchangeRates()

      return response.ok({
        message: `Updated ${result.updated} exchange rates`,
        data: {
          fromCurrency: result.fromCurrency,
          updated: result.updated,
          failed: result.failed,
        },
      })
    } catch (error) {
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Get currency statistics
   * GET /admin/currencies/stats
   */
  async stats({ response }: HttpContext) {
    const stats = await currencyService.getStats()

    return response.ok({
      data: stats,
    })
  }

  /**
   * Convert amount between currencies
   * POST /admin/currencies/convert
   */
  async convert({ request, response }: HttpContext) {
    const payload = await request.validate({
      schema: schema.create({
        from: schema.string(),
        to: schema.string(),
        amount: schema.number(),
        round: schema.boolean.optional(),
      }),
    })

    try {
      const result = await currencyService.convert({
        from: payload.from,
        to: payload.to,
        amount: payload.amount,
        round: payload.round !== undefined ? payload.round : true,
      })

      return response.ok({
        data: result,
      })
    } catch (error) {
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Set currency as default
   * POST /admin/currencies/:id/set-default
   */
  async setDefault({ params, response }: HttpContext) {
    const currency = await Currency.find(params.id)

    if (!currency) {
      return response.notFound({
        error: 'Currency not found',
      })
    }

    // Unset existing default
    await Currency.query().where('isDefault', true).update({ isDefault: false })

    // Set new default
    currency.isDefault = true
    await currency.save()

    // Clear cache
    currencyService.clearCache()

    return response.ok({
      data: currency.serialize(),
      message: 'Default currency updated successfully',
    })
  }
}
