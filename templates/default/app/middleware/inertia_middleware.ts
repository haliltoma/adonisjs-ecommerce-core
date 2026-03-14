import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import BaseInertiaMiddleware from '@adonisjs/inertia/inertia_middleware'
import Customer from '#models/customer'

export default class InertiaMiddleware extends BaseInertiaMiddleware {
  /**
   * Share data with all Inertia pages
   * The share method may be called before all middleware runs.
   * Always treat context properties as potentially undefined.
   */
  async share(ctx: HttpContext) {
    const { session, auth } = ctx as Partial<HttpContext>
    const admin = (ctx as any).admin
    const store = (ctx as any).store
    const cart = (ctx as any).cart

    // Get customer data
    let customerData = null
    const customerId = session?.get('customer_id')
    if (customerId) {
      try {
        const customer = await Customer.find(customerId)
        if (customer) {
          customerData = {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
          }
        }
      } catch {
        // Ignore customer fetch errors
      }
    }

    // Expose fresh CSRF token so the frontend can keep its meta tag in sync
    let csrfToken: string | null = null
    try {
      csrfToken = (ctx.request as any).csrfToken ?? null
    } catch {
      // Shield may not be loaded yet
    }

    return {
      csrfToken,
      flash: session?.flashMessages?.all() ?? {},

      user: auth?.user
        ? {
            id: auth.user.id,
            email: auth.user.email,
            firstName: auth.user.firstName,
            lastName: auth.user.lastName,
          }
        : null,

      admin: admin
        ? {
            id: admin.id,
            email: admin.email,
            fullName: admin.fullName || admin.displayName,
            role: admin.role?.name || null,
            permissions: admin.role?.permissions?.map((p: any) => p.slug) || [],
          }
        : null,

      store: store
        ? {
            name: store.name,
            currency: store.defaultCurrency,
            locale: store.defaultLocale,
            logoUrl: store.logoUrl || null,
          }
        : null,

      customer: customerData,

      cartCount: cart?.totalItems || 0,
    }
  }

  async handle(ctx: HttpContext, next: NextFn) {
    await this.init(ctx)
    const output = await next()
    this.dispose(ctx)
    return output
  }
}

declare module '@adonisjs/inertia/types' {
  type MiddlewareSharedProps = Awaited<ReturnType<InertiaMiddleware['share']>>
  export interface SharedProps extends MiddlewareSharedProps {}
}
