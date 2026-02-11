import { useEffect } from 'react'
import { t, setLocale } from '@/lib/i18n'
import { useLocaleStore } from '@/stores/locale-store'

/**
 * Hook that subscribes to locale changes and returns translation utilities.
 * Syncs the i18n module's internal locale variable on every render
 * so that `t()` always returns strings for the active language.
 */
export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale)
  const currency = useLocaleStore((s) => s.currency)

  // Keep the i18n module variable in sync with zustand (fixes hydration mismatch)
  useEffect(() => {
    setLocale(locale)
  }, [locale])

  return { t, locale, currency } as const
}
