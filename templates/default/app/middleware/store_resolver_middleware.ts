import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Store from '#models/store'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    store: Store
  }
}

/**
 * StoreResolverMiddleware
 *
 * Resolves the current store based on:
 * 1. Custom domain (store.domain)
 * 2. Subdomain (store.slug.domain.com)
 * 3. Default store (fallback)
 *
 * Multi-tenant support for running multiple stores on a single installation.
 */
export default class StoreResolverMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { request } = ctx

    let store: Store | null = null

    // Get host from request
    const host = request.header('host') || ''
    const hostname = host.split(':')[0] // Remove port if present

    // Try to find store by custom domain
    store = await Store.query()
      .where('domain', hostname)
      .where('isActive', true)
      .first()

    // If no custom domain match, try subdomain
    if (!store) {
      const parts = hostname.split('.')
      if (parts.length >= 2) {
        const subdomain = parts[0]
        store = await Store.query()
          .where('slug', subdomain)
          .where('isActive', true)
          .first()
      }
    }

    // Fallback to default store
    if (!store) {
      store = await Store.query()
        .where('isActive', true)
        .orderBy('createdAt', 'asc')
        .first()
    }

    // If still no store found, throw error
    if (!store) {
      return ctx.response.status(404).json({
        error: 'Store not found',
        message: 'The requested store could not be found.',
      })
    }

    // Attach store to context
    ctx.store = store

    // Set store in session for later use
    if (ctx.session) {
      ctx.session.put('storeId', store.id)
    }

    return next()
  }
}
