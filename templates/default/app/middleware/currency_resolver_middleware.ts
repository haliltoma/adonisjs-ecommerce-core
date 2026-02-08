import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Currency from '#models/currency'

interface CurrencyInfo {
  code: string
  symbol: string
  name: string
  exchangeRate: number
  decimalPlaces: number
  symbolPosition: 'before' | 'after'
}

declare module '@adonisjs/core/http' {
  interface HttpContext {
    currency: CurrencyInfo
    availableCurrencies: CurrencyInfo[]
    formatPrice: (amount: number) => string
  }
}

/**
 * CurrencyResolverMiddleware
 *
 * Resolves the current currency based on:
 * 1. Query parameter (?currency=EUR)
 * 2. Session stored preference
 * 3. Store's default currency
 *
 * Provides price formatting helper for views.
 */
export default class CurrencyResolverMiddleware {
  private defaultCurrency: CurrencyInfo = {
    code: 'USD',
    symbol: '$',
    name: 'US Dollar',
    exchangeRate: 1,
    decimalPlaces: 2,
    symbolPosition: 'before',
  }

  async handle(ctx: HttpContext, next: NextFn) {
    const { request, session } = ctx

    // Load available currencies
    const currencies = await Currency.query().where('isActive', true)
    const availableCurrencies: CurrencyInfo[] = currencies.map((c) => ({
      code: c.code,
      symbol: c.symbol,
      name: c.name,
      exchangeRate: c.exchangeRate,
      decimalPlaces: c.decimalPlaces,
      symbolPosition: c.symbolPosition as 'before' | 'after',
    }))

    // If no currencies in database, use default
    if (availableCurrencies.length === 0) {
      availableCurrencies.push(this.defaultCurrency)
    }

    let currency = availableCurrencies[0]

    // 1. Check query parameter
    const queryCurrency = request.input('currency')
    if (queryCurrency) {
      const found = availableCurrencies.find(
        (c) => c.code.toLowerCase() === queryCurrency.toLowerCase()
      )
      if (found) {
        currency = found
        if (session) {
          session.put('currency', currency.code)
        }
      }
    }
    // 2. Check session
    else if (session?.get('currency')) {
      const sessionCurrency = session.get('currency')
      const found = availableCurrencies.find(
        (c) => c.code.toLowerCase() === sessionCurrency.toLowerCase()
      )
      if (found) {
        currency = found
      }
    }
    // 3. Check store's default currency
    else if ('store' in ctx && ctx.store?.defaultCurrency) {
      const storeCurrency = ctx.store.defaultCurrency
      const found = availableCurrencies.find(
        (c) => c.code.toLowerCase() === storeCurrency.toLowerCase()
      )
      if (found) {
        currency = found
      }
    }

    // Attach currency info to context
    ctx.currency = currency
    ctx.availableCurrencies = availableCurrencies

    // Price formatting helper
    ctx.formatPrice = (amount: number): string => {
      const convertedAmount = amount * currency.exchangeRate
      const formatted = convertedAmount.toFixed(currency.decimalPlaces)

      if (currency.symbolPosition === 'before') {
        return `${currency.symbol}${formatted}`
      }
      return `${formatted}${currency.symbol}`
    }

    return next()
  }
}
