/**
 * Currencies Controller
 *
 * Admin API for managing currencies and exchange rates.
 */

import type { HttpContext } from '@adonisjs/core/http'
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
    const payload = request.body()
        symbol: null,
        symbolPosition: null,
        decimalPlaces: null,
        decimalSeparator: null,
        thousandsSeparator: null,
        exchangeRate: null,
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

    const payload = request.body()
        symbolPosition: null.optional(),
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

    const payload = request.body()
