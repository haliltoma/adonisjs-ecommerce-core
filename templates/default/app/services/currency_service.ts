/**
 * Currency Service
 *
 * Centralized currency conversion and formatting service.
 */

import { DateTime } from 'luxon'
import Currency from '#models/currency'
import { money } from '#helpers/money'

export interface ConversionOptions {
  from: string
  to: string
  amount: number
  round?: boolean
}

export interface CurrencyInfo {
  code: string
  name: string
  symbol: string
  symbolPosition: 'before' | 'after'
  decimalPlaces: number
  decimalSeparator: string
  thousandsSeparator: string
  exchangeRate: number
  isActive: boolean
  isDefault: boolean
  rateUpdatedAt: DateTime | null
}

export interface ExchangeRateUpdate {
  fromCurrency: string
  rates: Record<string, number>
  updatedAt: DateTime
}

export default class CurrencyService {
  private static instance: CurrencyService
  private cache: Map<string, any> = new Map()
  private cacheExpiry: number = 3600000 // 1 hour in ms

  private constructor() {}

  static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService()
    }
    return CurrencyService.instance
  }

  /**
   * Get all active currencies
   */
  async getActiveCurrencies(): Promise<Currency[]> {
    const cacheKey = 'active_currencies'
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }

    const currencies = await Currency.query().where('isActive', true).orderBy('isDefault', 'desc')

    this.cache.set(cacheKey, {
      data: currencies,
      timestamp: Date.now(),
    })

    return currencies
  }

  /**
   * Get currency by code
   */
  async getCurrency(code: string): Promise<Currency | null> {
    const cacheKey = `currency_${code}`
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }

    const currency = await Currency.query().where('code', code.toUpperCase()).first()

    if (currency) {
      this.cache.set(cacheKey, {
        data: currency,
        timestamp: Date.now(),
      })
    }

    return currency
  }

  /**
   * Get base (default) currency
   */
  async getBaseCurrency(): Promise<Currency | null> {
    const cacheKey = 'base_currency'
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data
    }

    const currency = await Currency.query().where('isDefault', true).first()

    if (currency) {
      this.cache.set(cacheKey, {
        data: currency,
        timestamp: Date.now(),
      })
    }

    return currency
  }

  /**
   * Convert amount between currencies
   */
  async convert(options: ConversionOptions): Promise<{
    amount: number
    fromCurrency: CurrencyInfo
    toCurrency: CurrencyInfo
    rate: number
  }> {
    const { from, to, amount, round = true } = options

    if (from === to) {
      const fromCurrency = await this.getCurrency(from)
      if (!fromCurrency) {
        throw new Error(`Currency not found: ${from}`)
      }

      return {
        amount: round ? Math.round(amount * 100) / 100 : amount,
        fromCurrency: fromCurrency.serialize(),
        toCurrency: fromCurrency.serialize(),
        rate: 1,
      }
    }

    const [fromCurrency, toCurrency] = await Promise.all([
      this.getCurrency(from),
      this.getCurrency(to),
    ])

    if (!fromCurrency || !toCurrency) {
      throw new Error(`Currency not found: ${!fromCurrency ? from : to}`)
    }

    // Convert via base currency
    // fromCurrency.amount = baseCurrency.amount * fromRate
    // toCurrency.amount = baseCurrency.amount * toRate
    // fromCurrency.amount / fromRate = baseCurrency.amount
    // toCurrency.amount = (fromCurrency.amount / fromRate) * toRate
    const rate = toCurrency.exchangeRate / fromCurrency.exchangeRate
    const convertedAmount = amount * rate

    return {
      amount: round ? Math.round(convertedAmount * 100) / 100 : convertedAmount,
      fromCurrency: fromCurrency.serialize(),
      toCurrency: toCurrency.serialize(),
      rate,
    }
  }

  /**
   * Format price in currency
   */
  formatPrice(amount: number, currency: CurrencyInfo): string {
    const formatted = amount.toFixed(currency.decimalPlaces)
    const [integer, decimal] = formatted.split('.')
    const withThousands = integer.replace(/\B(?=(\d{3})+(?!\d))/g, currency.thousandsSeparator)
    const finalAmount = decimal ? `${withThousands}${currency.decimalSeparator}${decimal}` : withThousands

    return currency.symbolPosition === 'before'
      ? `${currency.symbol}${finalAmount}`
      : `${finalAmount}${currency.symbol}`
  }

  /**
   * Format price using currency code
   */
  async formatPriceByCode(amount: number, currencyCode: string): Promise<string> {
    const currency = await this.getCurrency(currencyCode)
    if (!currency) {
      // Fallback to basic formatting
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode.toUpperCase(),
      }).format(amount)
    }

    return this.formatPrice(amount, currency.serialize())
  }

  /**
   * Update exchange rates from external API
   */
  async updateExchangeRates(): Promise<{
    updated: number
    failed: string[]
    fromCurrency: string
  }> {
    const baseCurrency = await this.getBaseCurrency()
    if (!baseCurrency) {
      throw new Error('No base currency found')
    }

    const currencies = await this.getActiveCurrencies()
    const failed: string[] = []
    let updated = 0

    try {
      // Try ExchangeRate-API (free tier: 1500 requests/month)
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency.code}`
      )

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`)
      }

      const data = (await response.json()) as { rates: Record<string, number> }

      for (const currency of currencies) {
        if (currency.code === baseCurrency.code) {
          currency.exchangeRate = 1
          currency.rateUpdatedAt = DateTime.now()
          await currency.save()
          updated++
          continue
        }

        const rate = data.rates[currency.code]
        if (rate) {
          currency.exchangeRate = rate
          currency.rateUpdatedAt = DateTime.now()
          await currency.save()
          updated++
        } else {
          failed.push(currency.code)
        }
      }

      // Clear cache
      this.clearCache()

      return {
        updated,
        failed,
        fromCurrency: baseCurrency.code,
      }
    } catch (error) {
      throw new Error(`Failed to fetch exchange rates: ${(error as Error).message}`)
    }
  }

  /**
   * Update exchange rate for specific currency pair
   */
  async updateExchangeRate(
    fromCode: string,
    toCode: string,
    rate: number
  ): Promise<void> {
    const [fromCurrency, toCurrency] = await Promise.all([
      this.getCurrency(fromCode),
      this.getCurrency(toCode),
    ])

    if (!fromCurrency || !toCurrency) {
      throw new Error(`Currency not found: ${!fromCurrency ? fromCode : toCode}`)
    }

    // Calculate rate relative to base currency
    // If fromCurrency is base (rate=1), then toCurrency.exchangeRate = rate
    // Otherwise, need to calculate properly
    if (fromCurrency.isDefault) {
      toCurrency.exchangeRate = rate
    } else {
      // Convert rate to be relative to base
      // rate = toCurrency.exchangeRate / fromCurrency.exchangeRate
      // toCurrency.exchangeRate = rate * fromCurrency.exchangeRate
      toCurrency.exchangeRate = rate * fromCurrency.exchangeRate
    }

    toCurrency.rateUpdatedAt = DateTime.now()
    await toCurrency.save()

    // Clear cache
    this.clearCache()
  }

  /**
   * Detect currency from IP address (GeoIP)
   */
  async detectCurrencyFromIP(ipAddress: string): Promise<string | null> {
    // Simple country code to currency mapping
    const countryCurrencyMap: Record<string, string> = {
      US: 'USD',
      GB: 'GBP',
      EU: 'EUR',
      CA: 'CAD',
      AU: 'AUD',
      JP: 'JPY',
      CH: 'CHF',
      TR: 'TRY',
      IN: 'INR',
      CN: 'CNY',
      RU: 'RUB',
      BR: 'BRL',
      MX: 'MXN',
      SE: 'SEK',
      NO: 'NOK',
      DK: 'DKK',
      PL: 'PLN',
      ZA: 'ZAR',
      SG: 'SGD',
      HK: 'HKD',
      NZ: 'NZD',
      KR: 'KRW',
    }

    try {
      // Try ip-api.com (free, no API key required)
      const response = await fetch(`http://ip-api.com/json/${ipAddress}`)

      if (!response.ok) {
        return null
      }

      const data = await response.json() as { country_code?: string }

      if (data.country_code && countryCurrencyMap[data.country_code]) {
        return countryCurrencyMap[data.country_code]
      }

      return null
    } catch {
      return null
    }
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(from: string, to: string): Promise<number> {
    const [fromCurrency, toCurrency] = await Promise.all([
      this.getCurrency(from),
      this.getCurrency(to),
    ])

    if (!fromCurrency || !toCurrency) {
      throw new Error(`Currency not found: ${!fromCurrency ? from : to}`)
    }

    if (from === to) {
      return 1
    }

    // Calculate cross rate
    return toCurrency.exchangeRate / fromCurrency.exchangeRate
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Get currency statistics
   */
  async getStats(): Promise<{
    total: number
    active: number
    defaultCurrency: string | null
    lastUpdated: DateTime | null
  }> {
    const currencies = await Currency.query()

    const defaultCurrency = currencies.find(c => c.isDefault)
    const latestUpdate = currencies
      .filter(c => c.rateUpdatedAt)
      .sort((a, b) => b.rateUpdatedAt!.toMillis() - a.rateUpdatedAt!.toMillis())[0]

    return {
      total: currencies.length,
      active: currencies.filter(c => c.isActive).length,
      defaultCurrency: defaultCurrency?.code || null,
      lastUpdated: latestUpdate?.rateUpdatedAt || null,
    }
  }
}

/**
 * Export singleton instance
 */
export const currencyService = CurrencyService.getInstance()
