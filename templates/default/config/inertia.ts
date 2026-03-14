import { defineConfig } from '@adonisjs/inertia'
import type { HttpContext } from '@adonisjs/core/http'
import Cart from '#models/cart'

const inertiaConfig = defineConfig({
  /**
   * Path to the Edge view that will be used as the root view for Inertia responses
   */
  rootView: 'inertia_layout',

  /**
   * Data shared with all Inertia responses
   */
  sharedData: {
    flash: (ctx: HttpContext) => {
      return {
        success: ctx.session?.flashMessages.get('success') || null,
        error: ctx.session?.flashMessages.get('error') || null,
        info: ctx.session?.flashMessages.get('info') || null,
      }
    },
    cartItemCount: async (ctx: HttpContext) => {
      try {
        const store = (ctx as any).store
        if (!store) return 0

        const sessionId = ctx.session?.sessionId
        const customerId = ctx.session?.get('customer_id')

        let cart: Cart | null = null

        if (customerId) {
          cart = await Cart.query()
            .where('storeId', store.id)
            .where('customerId', customerId)
            .whereNull('completedAt')
            .first()
        } else if (sessionId) {
          cart = await Cart.query()
            .where('storeId', store.id)
            .where('sessionId', sessionId)
            .whereNull('customerId')
            .whereNull('completedAt')
            .first()
        }

        return Number(cart?.totalItems) || 0
      } catch {
        return 0
      }
    },
    currentCustomer: (ctx: HttpContext) => {
      const customerId = ctx.session?.get('customer_id')
      const customerName = ctx.session?.get('customer_name')
      const customerEmail = ctx.session?.get('customer_email')
      if (!customerId) return null
      return { id: customerId, name: customerName, email: customerEmail }
    },
  },

  /**
   * Encrypt history for better security
   */
  encryptHistory: false,

  /**
   * Options for the server-side rendering
   *
   * TEMPORARILY DISABLED for testing
   */
  ssr: {
    enabled: false,
    entrypoint: 'inertia/app/ssr.tsx',
  },
})

export default inertiaConfig

