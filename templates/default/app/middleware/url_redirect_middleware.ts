import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import UrlRedirect from '#models/url_redirect'
import { DateTime } from 'luxon'

/**
 * URL Redirect Middleware
 *
 * Checks incoming requests against the url_redirects table.
 * If a match is found, issues an HTTP redirect with the configured status code.
 * Tracks hit counts and last-hit timestamps for analytics.
 *
 * Should be registered early in the middleware stack (after store resolver).
 */
export default class UrlRedirectMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request, response, store } = ctx

    // Only check GET requests (no point redirecting POST, etc.)
    if (request.method() !== 'GET') {
      return next()
    }

    // Skip admin, API, and asset paths
    const path = request.url()
    if (
      path.startsWith('/admin') ||
      path.startsWith('/api') ||
      path.startsWith('/assets') ||
      path.startsWith('/webhooks') ||
      path.startsWith('/_vite')
    ) {
      return next()
    }

    try {
      const redirect = await UrlRedirect.query()
        .where('storeId', store.id)
        .where('source_path', path)
        .where('isActive', true)
        .first()

      if (redirect) {
        // Track the hit (fire-and-forget to not slow down the redirect)
        redirect.hitCount = (redirect.hitCount || 0) + 1
        redirect.lastHitAt = DateTime.now()
        redirect.save().catch(() => {})

        return response.redirect(redirect.toPath, undefined, redirect.statusCode)
      }
    } catch {
      // If the table doesn't exist yet (pre-migration), skip silently
    }

    return next()
  }
}
