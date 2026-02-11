/**
 * Lightweight i18n utility for the frontend.
 * Uses JSON locale files for static UI translations.
 */

import en from '../locales/en.json'
import tr from '../locales/tr.json'

type LocaleMessages = typeof en
type NestedKeyOf<T, Prefix extends string = ''> = T extends Record<string, unknown>
  ? {
      [K in keyof T & string]: T[K] extends Record<string, unknown>
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`
    }[keyof T & string]
  : never

export type TranslationKey = NestedKeyOf<LocaleMessages>

const locales: Record<string, LocaleMessages> = { en, tr }

let currentLocale = 'en'

export function setLocale(locale: string): void {
  if (locales[locale]) {
    currentLocale = locale
  }
}

export function getLocale(): string {
  return currentLocale
}

export function t(key: string, params?: Record<string, string | number>): string {
  const parts = key.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = locales[currentLocale] || locales['en']

  for (const part of parts) {
    value = value?.[part]
    if (value === undefined) break
  }

  if (typeof value !== 'string') {
    // Fallback to English
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let fallback: any = locales['en']
    for (const part of parts) {
      fallback = fallback?.[part]
      if (fallback === undefined) break
    }
    value = typeof fallback === 'string' ? fallback : key
  }

  // Replace interpolation params like {{name}}
  if (params) {
    for (const [param, val] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{\\{${param}\\}\\}`, 'g'), String(val))
    }
  }

  return value
}

/**
 * Format a price amount according to locale and currency
 */
export function formatPrice(
  amount: number,
  currencyCode: string = 'USD',
  locale?: string
): string {
  return new Intl.NumberFormat(locale || currentLocale, {
    style: 'currency',
    currency: currencyCode,
  }).format(amount)
}
