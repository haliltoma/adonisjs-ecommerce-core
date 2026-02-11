import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/auth_service'
import CustomerService from '#services/customer_service'
import OrderService from '#services/order_service'
import CartService from '#services/cart_service'
import Review from '#models/review'
import Wishlist from '#models/wishlist'
import WishlistItem from '#models/wishlist_item'

export default class AccountController {
  private authService: AuthService
  private customerService: CustomerService
  private orderService: OrderService
  private cartService: CartService

  constructor() {
    this.authService = new AuthService()
    this.customerService = new CustomerService()
    this.orderService = new OrderService()
    this.cartService = new CartService()
  }

  async wishlist({ inertia, session }: HttpContext) {
    const customerId = session.get('customer_id')
    let items: Array<Record<string, unknown>> = []

    if (customerId) {
      const wishlist = await Wishlist.query()
        .where('customerId', customerId)
        .preload('items', (q) => {
          q.preload('product', (pq) => {
            pq.preload('images', (iq) => iq.orderBy('sortOrder', 'asc').limit(1))
          })
        })
        .first()

      if (wishlist) {
        items = wishlist.items.map((item) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          note: item.note,
          createdAt: item.createdAt.toISO(),
          product: item.product ? {
            id: item.product.id,
            title: item.product.title,
            slug: item.product.slug,
            price: item.product.price,
            compareAtPrice: item.product.compareAtPrice,
            status: item.product.status,
            imageUrl: item.product.images?.[0]?.url || null,
          } : null,
        }))
      }
    }

    return inertia.render('storefront/Wishlist', { items })
  }

  async addToWishlist({ request, response, session }: HttpContext) {
    const customerId = session.get('customer_id')

    if (!customerId) {
      session.flash('error', 'Please login to use wishlist')
      return response.redirect().toRoute('storefront.account.login')
    }

    const { productId, variantId } = request.only(['productId', 'variantId'])

    try {
      let wishlist = await Wishlist.query()
        .where('customerId', customerId)
        .first()

      if (!wishlist) {
        wishlist = await Wishlist.create({
          customerId,
          name: 'My Wishlist',
          isPublic: false,
        })
      }

      const existing = await WishlistItem.query()
        .where('wishlistId', wishlist.id)
        .where('productId', productId)
        .first()

      if (!existing) {
        await WishlistItem.create({
          wishlistId: wishlist.id,
          productId,
          variantId: variantId || null,
        })
      }

      session.flash('success', 'Added to wishlist')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async removeFromWishlist({ params, response, session }: HttpContext) {
    const customerId = session.get('customer_id')

    if (!customerId) {
      return response.redirect().toRoute('storefront.account.login')
    }

    try {
      const wishlist = await Wishlist.query()
        .where('customerId', customerId)
        .firstOrFail()

      await WishlistItem.query()
        .where('wishlistId', wishlist.id)
        .where('id', params.id)
        .delete()

      session.flash('success', 'Removed from wishlist')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async orderTracking({ inertia, request, store }: HttpContext) {
    const { orderNumber, email } = request.qs()

    if (!orderNumber || !email) {
      return inertia.render('storefront/account/OrderTracking')
    }

    const order = await this.orderService.findByOrderNumber(store.id, orderNumber)

    if (!order || order.email !== email) {
      return inertia.render('storefront/account/OrderTracking')
    }

    const events: Array<Record<string, unknown>> = []

    // Add order placed event
    events.push({
      id: 'placed',
      status: 'order_placed',
      description: 'Order placed',
      timestamp: order.createdAt.toISO(),
    })

    // Add fulfillment events
    if (order.fulfillments) {
      for (const f of order.fulfillments) {
        if (f.createdAt) {
          events.push({
            id: `ful-${f.id}`,
            status: 'processing',
            description: 'Order is being prepared',
            timestamp: f.createdAt.toISO(),
          })
        }
        if (f.shippedAt) {
          events.push({
            id: `ship-${f.id}`,
            status: 'shipped',
            description: `Shipped via ${f.carrier || 'carrier'}`,
            location: f.trackingNumber || undefined,
            timestamp: f.shippedAt.toISO(),
          })
        }
        if (f.deliveredAt) {
          events.push({
            id: `del-${f.id}`,
            status: 'delivered',
            description: 'Package delivered',
            timestamp: f.deliveredAt.toISO(),
          })
        }
      }
    }

    // Sort events newest first
    events.sort((a, b) => {
      const ta = a.timestamp as string
      const tb = b.timestamp as string
      return tb.localeCompare(ta)
    })

    const latestFulfillment = order.fulfillments?.[0]

    return inertia.render('storefront/account/OrderTracking', {
      tracking: {
        orderNumber: order.orderNumber,
        status: latestFulfillment?.status || order.status,
        carrier: latestFulfillment?.carrier || '',
        trackingNumber: latestFulfillment?.trackingNumber || '',
        estimatedDelivery: null,
        events,
      },
    })
  }

  async showLogin({ inertia }: HttpContext) {
    return inertia.render('storefront/account/Login')
  }

  async login({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const { email, password, remember } = request.only(['email', 'password', 'remember'])

    try {
      const customer = await this.authService.authenticateCustomer({
        storeId,
        email,
        password,
      })

      if (!customer) {
        session.flash('error', 'Invalid credentials')
        return response.redirect().back()
      }

      // Store customer in session
      session.put('customer_id', customer.id)

      if (remember) {
        // Extend session
      }

      // Merge guest cart with customer cart
      const guestSessionId = session.sessionId
      if (guestSessionId) {
        await this.cartService.mergeGuestCart(guestSessionId, customer.id, storeId)
      }

      session.flash('success', 'Welcome back!')
      return response.redirect().toRoute('storefront.account.dashboard')
    } catch (error) {
      session.flash('error', 'An error occurred during login')
      return response.redirect().back()
    }
  }

  async showRegister({ inertia }: HttpContext) {
    return inertia.render('storefront/account/Register')
  }

  async register({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const data = request.only([
      'email',
      'password',
      'firstName',
      'lastName',
      'phone',
      'acceptsMarketing',
    ])

    try {
      const customer = await this.authService.registerCustomer({
        storeId,
        ...data,
      })

      session.put('customer_id', customer.id)

      // Merge guest cart
      const guestSessionId = session.sessionId
      if (guestSessionId) {
        await this.cartService.mergeGuestCart(guestSessionId, customer.id, storeId)
      }

      session.flash('success', 'Account created successfully!')
      return response.redirect().toRoute('storefront.account.dashboard')
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async logout({ response, session }: HttpContext) {
    session.forget('customer_id')
    session.flash('success', 'You have been logged out')
    return response.redirect().toRoute('storefront.home')
  }

  async dashboard({ inertia, session, response }: HttpContext) {
    const customerId = session.get('customer_id')

    if (!customerId) {
      return response.redirect().toRoute('storefront.account.login')
    }

    const customer = await this.customerService.findById(customerId)

    if (!customer) {
      session.forget('customer_id')
      return response.redirect().toRoute('storefront.account.login')
    }

    const recentOrders = await this.orderService.getCustomerOrders(customerId, 1, 5)

    return inertia.render('storefront/account/Index', {
      customer: {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        createdAt: customer.createdAt.toISO(),
      },
      recentOrders: recentOrders.all().map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: o.grandTotal,
        status: o.status,
        itemCount: o.items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
        createdAt: o.createdAt.toISO(),
      })),
      stats: {
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
      },
    })
  }

  async orders({ inertia, session, response, request }: HttpContext) {
    const customerId = session.get('customer_id')

    if (!customerId) {
      return response.redirect().toRoute('storefront.account.login')
    }

    const page = request.input('page', 1)
    const orders = await this.orderService.getCustomerOrders(customerId, page, 10)

    return inertia.render('storefront/account/Orders', {
      orders: {
        data: orders.all().map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          total: o.grandTotal,
          status: o.status,
          paymentStatus: o.paymentStatus,
          fulfillmentStatus: o.fulfillmentStatus,
          itemCount: o.items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
          createdAt: o.createdAt.toISO(),
        })),
        meta: orders.getMeta(),
      },
    })
  }

  async orderDetail({ params, inertia, session, response }: HttpContext) {
    const customerId = session.get('customer_id')

    if (!customerId) {
      return response.redirect().toRoute('storefront.account.login')
    }

    const order = await this.orderService.findById(params.id)

    if (!order || order.customerId !== customerId) {
      return inertia.render('storefront/errors/NotFound', { resource: 'Order' })
    }

    return inertia.render('storefront/account/OrderDetail', {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        email: order.email,
        status: order.status,
        paymentStatus: order.paymentStatus,
        fulfillmentStatus: order.fulfillmentStatus,
        subtotal: order.subtotal,
        discountTotal: order.discountTotal,
        shippingTotal: order.shippingTotal,
        taxTotal: order.taxTotal,
        total: order.grandTotal,
        currency: order.currencyCode,
        billingAddress: order.billingAddress,
        shippingAddress: order.shippingAddress,
        shippingMethod: order.shippingMethod,
        items: order.items?.map((item) => ({
          title: item.title,
          variantTitle: item.variantTitle,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
        })),
        fulfillments: order.fulfillments?.map((f) => ({
          status: f.status,
          trackingNumber: f.trackingNumber,
          trackingUrl: f.trackingUrl,
          carrier: f.carrier,
          shippedAt: f.shippedAt?.toISO(),
          deliveredAt: f.deliveredAt?.toISO(),
        })),
        createdAt: order.createdAt.toISO(),
      },
    })
  }

  async reviews({ inertia, session, response, request }: HttpContext) {
    const customerId = session.get('customer_id')

    if (!customerId) {
      return response.redirect().toRoute('storefront.account.login')
    }

    const page = request.input('page', 1)

    const reviews = await Review.query()
      .where('customerId', customerId)
      .preload('product', (pq) => {
        pq.preload('images', (iq) => iq.orderBy('sortOrder', 'asc').limit(1))
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, 10)

    return inertia.render('storefront/account/Reviews', {
      reviews: {
        data: reviews.all().map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          content: r.content,
          status: r.status,
          isVerifiedPurchase: r.isVerifiedPurchase,
          helpfulCount: r.helpfulCount,
          product: r.product
            ? {
                id: r.product.id,
                title: r.product.title,
                slug: r.product.slug,
                thumbnail: r.product.images?.[0]?.url || null,
              }
            : null,
          createdAt: r.createdAt.toISO(),
        })),
        meta: {
          total: reviews.total,
          perPage: reviews.perPage,
          currentPage: reviews.currentPage,
          lastPage: reviews.lastPage,
        },
      },
    })
  }

  async profile({ inertia, session, response }: HttpContext) {
    const customerId = session.get('customer_id')

    if (!customerId) {
      return response.redirect().toRoute('storefront.account.login')
    }

    const customer = await this.customerService.findById(customerId)

    if (!customer) {
      session.forget('customer_id')
      return response.redirect().toRoute('storefront.account.login')
    }

    return inertia.render('storefront/account/Profile', {
      customer: {
        id: customer.id,
        email: customer.email,
        firstName: customer.firstName,
        lastName: customer.lastName,
        phone: customer.phone,
        acceptsMarketing: customer.acceptsMarketing,
      },
    })
  }

  async updateProfile({ request, response, session }: HttpContext) {
    const customerId = session.get('customer_id')

    if (!customerId) {
      return response.redirect().toRoute('storefront.account.login')
    }

    const data = request.only(['firstName', 'lastName', 'phone', 'acceptsMarketing'])

    try {
      await this.customerService.update(customerId, data)
      session.flash('success', 'Profile updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async updatePassword({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const customerId = session.get('customer_id')

    if (!customerId) {
      return response.redirect().toRoute('storefront.account.login')
    }

    const { currentPassword, newPassword } = request.only(['currentPassword', 'newPassword'])

    try {
      const customer = await this.customerService.findById(customerId)
      if (!customer) {
        session.flash('error', 'Customer not found')
        return response.redirect().back()
      }

      // Verify current password
      const isValid = await this.authService.authenticateCustomer({
        storeId,
        email: customer.email,
        password: currentPassword,
      })

      if (!isValid) {
        session.flash('error', 'Current password is incorrect')
        return response.redirect().back()
      }

      await this.customerService.updatePassword(customerId, newPassword)
      session.flash('success', 'Password updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async addresses({ inertia, session, response }: HttpContext) {
    const customerId = session.get('customer_id')

    if (!customerId) {
      return response.redirect().toRoute('storefront.account.login')
    }

    const addresses = await this.customerService.getAddresses(customerId)

    return inertia.render('storefront/account/Addresses', {
      addresses: addresses.map((a) => ({
        id: a.id,
        type: a.type,
        isDefault: a.isDefault,
        firstName: a.firstName,
        lastName: a.lastName,
        company: a.company,
        address1: a.addressLine1,
        address2: a.addressLine2,
        city: a.city,
        state: a.state,
        postalCode: a.postalCode,
        country: a.countryCode,
        phone: a.phone,
      })),
    })
  }

  async addAddress({ request, response, session }: HttpContext) {
    const customerId = session.get('customer_id')

    if (!customerId) {
      return response.redirect().toRoute('storefront.account.login')
    }

    const data = request.only([
      'type',
      'isDefault',
      'firstName',
      'lastName',
      'company',
      'address1',
      'address2',
      'city',
      'state',
      'postalCode',
      'country',
      'phone',
    ])

    try {
      await this.customerService.addAddress(customerId, data)
      session.flash('success', 'Address added')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async updateAddress({ params, request, response, session }: HttpContext) {
    const customerId = session.get('customer_id')

    if (!customerId) {
      return response.redirect().toRoute('storefront.account.login')
    }

    const data = request.only([
      'type',
      'isDefault',
      'firstName',
      'lastName',
      'company',
      'address1',
      'address2',
      'city',
      'state',
      'postalCode',
      'country',
      'phone',
    ])

    try {
      await this.customerService.updateAddress(params.id, data)
      session.flash('success', 'Address updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async deleteAddress({ params, response, session }: HttpContext) {
    const customerId = session.get('customer_id')

    if (!customerId) {
      return response.redirect().toRoute('storefront.account.login')
    }

    try {
      await this.customerService.deleteAddress(params.id)
      session.flash('success', 'Address deleted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async showForgotPassword({ inertia }: HttpContext) {
    return inertia.render('storefront/account/ForgotPassword')
  }

  async forgotPassword({ request, response, session }: HttpContext) {
    const { email } = request.only(['email'])

    try {
      await this.authService.generatePasswordResetToken(email, false)
      session.flash('success', 'If an account exists with this email, you will receive a password reset link.')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', 'An error occurred')
      return response.redirect().back()
    }
  }

  async showResetPassword({ params, inertia }: HttpContext) {
    return inertia.render('storefront/account/ResetPassword', {
      token: params.token,
    })
  }

  async resetPassword({ request, response, session }: HttpContext) {
    const { token, password } = request.only(['token', 'password'])

    try {
      const success = await this.authService.resetPassword({ token, password }, false)

      if (!success) {
        session.flash('error', 'Invalid or expired reset token')
        return response.redirect().back()
      }

      session.flash('success', 'Password has been reset. Please login with your new password.')
      return response.redirect().toRoute('storefront.account.login')
    } catch (error) {
      session.flash('error', 'An error occurred')
      return response.redirect().back()
    }
  }
}
