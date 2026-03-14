/**
 * Request ID Middleware
 *
 * Generates and injects a unique request ID for distributed tracing.
 * This ID is logged with all events related to this request.
 */

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import { generateRequestId } from '#start/logging'

export default class RequestIdMiddleware {
  /**
   * Handle request by generating and injecting request ID
   */
  async handle(ctx: HttpContext, next: NextFn) {
    // Check if request ID is already present (from upstream proxy)
    const existingRequestId = ctx.request.header('x-request-id')

    // Generate or use existing request ID
    const requestId = existingRequestId || generateRequestId()

    // Attach to context for use in controllers/services
    ctx.requestId = () => requestId

    // Add to response header for distributed tracing
    ctx.response.header('x-request-id', requestId)

    // Also add to logger context
    ctx.logger = ctx.logger.child({ requestId })

    await next()
  }
}

/**
 * Extend HttpContext interface to include requestId method
 */
declare module '@adonisjs/core/http' {
  interface HttpContext {
    requestId(): string
  }
}
