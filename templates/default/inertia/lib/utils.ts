import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency?: string, locale?: string): string {
  const currencyCode = currency && currency.length === 3 ? currency : getStoredCurrency()
  try {
    return new Intl.NumberFormat(locale || getLocaleForFormatting(), {
      style: 'currency',
      currency: currencyCode,
    }).format(amount)
  } catch {
    // Fallback for invalid currency codes
    return new Intl.NumberFormat(locale || getLocaleForFormatting(), {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }
}

export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(getLocaleForFormatting(), {
    dateStyle: 'medium',
    timeZone: 'UTC',
    ...options,
  }).format(date)
}

export function formatDateTime(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(getLocaleForFormatting(), {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date)
}

function getLocaleForFormatting(): string {
  if (typeof window === 'undefined') return 'en-US'
  try {
    const stored = JSON.parse(localStorage.getItem('commerce-locale') || '{}')
    const locale = stored?.state?.locale
    if (locale === 'tr') return 'tr-TR'
    return 'en-US'
  } catch {
    return 'en-US'
  }
}

function getStoredCurrency(): string {
  if (typeof window === 'undefined') return 'USD'
  try {
    const stored = JSON.parse(localStorage.getItem('commerce-locale') || '{}')
    return stored?.state?.currency || 'USD'
  } catch {
    return 'USD'
  }
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}
