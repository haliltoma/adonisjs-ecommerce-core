import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    locale: string
    availableLocales: string[]
  }
}

/**
 * LocaleDetectorMiddleware
 *
 * Detects and sets the current locale based on:
 * 1. Query parameter (?lang=tr)
 * 2. Session stored preference
 * 3. Accept-Language header
 * 4. Store's default locale
 *
 * Supports multi-language (i18n) for the storefront and admin panel.
 */
export default class LocaleDetectorMiddleware {
  private supportedLocales = ['en', 'tr', 'de', 'fr', 'es', 'it', 'pt', 'nl', 'ru', 'ar', 'zh', 'ja', 'ko']
  private defaultLocale = 'en'

  async handle(ctx: HttpContext, next: NextFn) {
    const { request, session } = ctx

    let locale = this.defaultLocale

    // 1. Check query parameter
    const queryLocale = request.input('lang')
    if (queryLocale && this.isSupported(queryLocale)) {
      locale = queryLocale
      // Store in session for future requests
      if (session) {
        session.put('locale', locale)
      }
    }
    // 2. Check session
    else if (session?.get('locale') && this.isSupported(session.get('locale'))) {
      locale = session.get('locale')
    }
    // 3. Check Accept-Language header
    else {
      const acceptLanguage = request.header('accept-language')
      if (acceptLanguage) {
        const parsed = this.parseAcceptLanguage(acceptLanguage)
        for (const lang of parsed) {
          if (this.isSupported(lang)) {
            locale = lang
            break
          }
        }
      }
    }

    // 4. Check store's default locale (if store is available)
    if ('store' in ctx && ctx.store?.defaultLocale) {
      const storeLocale = ctx.store.defaultLocale
      if (!session?.has('locale') && !queryLocale && this.isSupported(storeLocale)) {
        locale = storeLocale
      }
    }

    // Attach locale info to context
    ctx.locale = locale
    ctx.availableLocales = this.supportedLocales

    return next()
  }

  private isSupported(locale: string): boolean {
    return this.supportedLocales.includes(locale.toLowerCase().split('-')[0])
  }

  private parseAcceptLanguage(header: string): string[] {
    return header
      .split(',')
      .map((part) => {
        const [lang, qValue] = part.trim().split(';q=')
        return {
          lang: lang.split('-')[0].toLowerCase(),
          q: qValue ? parseFloat(qValue) : 1,
        }
      })
      .sort((a, b) => b.q - a.q)
      .map((item) => item.lang)
  }
}
