import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { setLocale } from '@/lib/i18n'

interface LocaleState {
  locale: string
  currency: string

  setLocale: (locale: string) => void
  setCurrency: (currency: string) => void
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: 'en',
      currency: 'USD',

      setLocale: (locale) => {
        setLocale(locale)
        set({ locale })
      },

      setCurrency: (currency) => {
        set({ currency })
      },
    }),
    {
      name: 'commerce-locale',
    }
  )
)
