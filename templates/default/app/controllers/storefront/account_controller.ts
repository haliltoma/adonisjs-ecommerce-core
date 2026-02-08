import type { HttpContext } from '@adonisjs/core/http'
import AuthService from '#services/auth_service'
import CustomerService from '#services/customer_service'
import OrderService from '#services/order_service'
import CartService from '#services/cart_service'

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

    return inertia.render('storefront/account/Dashboard', {
      customer: {
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
      },
      recentOrders: recentOrders.all().map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        total: o.grandTotal,
        status: o.status,
        createdAt: o.createdAt.toISO(),
      })),
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
