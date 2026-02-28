import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import Customer from '#models/customer'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    customer: Customer | null
  }
}

/**
 * CustomerAuthMiddleware
 *
 * Authenticates customers using session-based auth.
 * Checks session for customer_id and loads the customer model.
 * Used for customer API routes and storefront protected pages.
 */
export default class CustomerAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { session, response, request } = ctx

    const customerId = session?.get('customer_id')

    if (!customerId) {
      if (request.accepts(['html', 'json']) === 'json') {
        return response.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required.',
        })
      }
      return response.redirect('/account/login')
    }

    const customer = await Customer.query()
      .where('id', customerId)
      .whereNull('deletedAt')
      .first()

    if (!customer) {
      session?.forget('customer_id')

      if (request.accepts(['html', 'json']) === 'json') {
        return response.status(401).json({
          error: 'Unauthorized',
          message: 'Session expired or invalid.',
        })
      }
      return response.redirect('/account/login')
    }

    ctx.customer = customer

    return next()
  }
}
