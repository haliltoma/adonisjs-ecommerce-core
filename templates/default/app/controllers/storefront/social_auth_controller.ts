import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Customer from '#models/customer'
import CartService from '#services/cart_service'

type SocialProvider = 'google' | 'facebook'

export default class SocialAuthController {
  private cartService: CartService

  constructor() {
    this.cartService = new CartService()
  }

  async redirect(ctx: HttpContext) {
    const provider = ctx.params.provider as SocialProvider
    return (ctx as any).ally.use(provider).redirect()
  }

  async callback(ctx: HttpContext) {
    const { params, session, response } = ctx
    const store = (ctx as any).store
    const provider = params.provider as SocialProvider
    const social = (ctx as any).ally.use(provider)

    if (social.accessDenied()) {
      session.flash('error', 'Access denied. You cancelled the login.')
      return response.redirect().toRoute('storefront.account.login')
    }

    if (social.stateMisMatch()) {
      session.flash('error', 'Request expired. Please try again.')
      return response.redirect().toRoute('storefront.account.login')
    }

    if (social.hasError()) {
      session.flash('error', 'Something went wrong. Please try again.')
      return response.redirect().toRoute('storefront.account.login')
    }

    const socialUser = await social.user()

    if (!socialUser.email) {
      session.flash('error', 'Email is required for authentication.')
      return response.redirect().toRoute('storefront.account.login')
    }

    try {
      // Check if customer exists with this OAuth provider
      let customer = await Customer.query()
        .where('storeId', store.id)
        .where('oauthProvider', provider)
        .where('oauthProviderId', socialUser.id)
        .whereNull('deletedAt')
        .first()

      if (!customer) {
        // Check if customer exists with this email
        customer = await Customer.query()
          .where('storeId', store.id)
          .where('email', socialUser.email.toLowerCase())
          .whereNull('deletedAt')
          .first()

        if (customer) {
          // Link social account to existing customer
          customer.oauthProvider = provider
          customer.oauthProviderId = socialUser.id
          if (socialUser.avatarUrl) {
            customer.oauthAvatarUrl = socialUser.avatarUrl
          }
          await customer.save()
        } else {
          // Create new customer from social login
          const nameParts = (socialUser.name || '').split(' ')
          const firstName = socialUser.original?.given_name || nameParts[0] || ''
          const lastName = socialUser.original?.family_name || nameParts.slice(1).join(' ') || ''

          customer = await Customer.create({
            storeId: store.id,
            email: socialUser.email.toLowerCase(),
            passwordHash: null,
            firstName,
            lastName,
            avatarUrl: socialUser.avatarUrl || null,
            oauthProvider: provider,
            oauthProviderId: socialUser.id,
            oauthAvatarUrl: socialUser.avatarUrl || null,
            status: 'active',
            acceptsMarketing: false,
            totalOrders: 0,
            totalSpent: 0,
            tags: [],
            metadata: {},
            emailVerifiedAt: socialUser.emailVerificationState === 'verified' ? DateTime.now() : null,
          })
        }
      } else {
        // Update avatar if changed
        if (socialUser.avatarUrl && socialUser.avatarUrl !== customer.oauthAvatarUrl) {
          customer.oauthAvatarUrl = socialUser.avatarUrl
          await customer.save()
        }
      }

      if (customer.status !== 'active') {
        session.flash('error', 'Your account has been disabled.')
        return response.redirect().toRoute('storefront.account.login')
      }

      // Store customer in session
      session.put('customer_id', customer.id)

      // Merge guest cart
      const guestSessionId = session.sessionId
      if (guestSessionId) {
        await this.cartService.mergeGuestCart(guestSessionId, customer.id, store.id)
      }

      session.flash('success', 'Welcome!')
      return response.redirect().toRoute('storefront.account.dashboard')
    } catch (error) {
      session.flash('error', 'An error occurred during social login.')
      return response.redirect().toRoute('storefront.account.login')
    }
  }
}
