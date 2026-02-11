/**
 * RateLimitMiddleware
 *
 * Simple in-memory rate limiter for protecting endpoints.
 * Tracks requests per IP address with configurable limits and windows.
 *
 * Usage:
 *   router.post('/login', [...]).use(middleware.rateLimit({ maxAttempts: 5, windowSeconds: 60 }))
 */

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000).unref()

export default class RateLimitMiddleware {
  async handle(
    ctx: HttpContext,
    next: NextFn,
    options: { maxAttempts?: number; windowSeconds?: number } = {}
  ) {
    const maxAttempts = options.maxAttempts ?? 60
    const windowSeconds = options.windowSeconds ?? 60

    const ip = ctx.request.ip()
    const route = ctx.route?.pattern || ctx.request.url()
    const key = `${ip}:${route}`
    const now = Date.now()

    let entry = store.get(key)

    if (!entry || entry.resetAt < now) {
      entry = { count: 0, resetAt: now + windowSeconds * 1000 }
      store.set(key, entry)
    }

    entry.count++

    // Set rate limit headers
    const remaining = Math.max(0, maxAttempts - entry.count)
    const resetTime = Math.ceil((entry.resetAt - now) / 1000)

    ctx.response.header('X-RateLimit-Limit', String(maxAttempts))
    ctx.response.header('X-RateLimit-Remaining', String(remaining))
    ctx.response.header('X-RateLimit-Reset', String(resetTime))

    if (entry.count > maxAttempts) {
      ctx.response.header('Retry-After', String(resetTime))

      if (ctx.request.accepts(['html', 'json']) === 'json') {
        return ctx.response.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Try again in ${resetTime} seconds.`,
          retryAfter: resetTime,
        })
      }

      return ctx.response.status(429).send(
        `Too many requests. Please try again in ${resetTime} seconds.`
      )
    }

    return next()
  }
}
