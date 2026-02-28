import { defineConfig } from '@adonisjs/inertia'
import type { InferSharedProps } from '@adonisjs/inertia/types'
import Customer from '#models/customer'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data that should be shared with all rendered pages
   */
  sharedData: {
    flash: (ctx) => ctx.session?.flashMessages.all(),
    user: (ctx) =>
      ctx.inertia.always(() => {
        if (!ctx.auth?.user) return null
        return {
          id: ctx.auth.user.id,
          email: ctx.auth.user.email,
          firstName: ctx.auth.user.firstName,
          lastName: ctx.auth.user.lastName,
        }
      }),
    admin: (ctx) =>
      ctx.inertia.always(() => {
        const admin = (ctx as any).admin
        if (!admin) return null
        return {
          id: admin.id,
          email: admin.email,
          fullName: admin.fullName || admin.displayName,
          role: admin.role?.name || null,
          permissions: admin.role?.permissions?.map((p: any) => p.slug) || [],
        }
      }),
    store: (ctx) =>
      ctx.inertia.always(() => {
        const store = (ctx as any).store
        if (!store) return null
        return {
          name: store.name,
          currency: store.defaultCurrency,
          locale: store.defaultLocale,
          logoUrl: store.logoUrl || null,
        }
      }),
    customer: (ctx) =>
      ctx.inertia.always(async () => {
        const customerId = ctx.session?.get('customer_id')
        if (!customerId) return null
        try {
          const customer = await Customer.find(customerId)
          if (!customer) return null
          return {
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            email: customer.email,
          }
        } catch {
          return null
        }
      }),
    cartCount: (ctx) =>
      ctx.inertia.always(() => {
        const cart = (ctx as any).cart
        return cart?.totalItems || 0
      }),
  },

  /**
   * Options for the server-side rendering
   *
   * TEMPORARILY DISABLED for testing
   */
  ssr: {
    enabled: false,
    entrypoint: 'inertia/app/ssr.tsx',
  }
})

export default inertiaConfig

declare module '@adonisjs/inertia/types' {
  export interface SharedProps extends InferSharedProps<typeof inertiaConfig> {}
}