import type { HttpContext } from '@adonisjs/core/http'
import CartService from '#services/cart_service'
import OrderService from '#services/order_service'
import CustomerService from '#services/customer_service'
import DiscountService from '#services/discount_service'
import StoreService from '#services/store_service'
import { PaymentProvider } from '#contracts/payment_provider'
import Customer from '#models/customer'
import app from '@adonisjs/core/services/app'
import emitter from '@adonisjs/core/services/emitter'
import { PaymentCaptured, PaymentFailed } from '#events/payment_events'

export default class CheckoutController {
  private cartService: CartService
  private orderService: OrderService
  private customerService: CustomerService
  private discountService: DiscountService
  private storeService: StoreService

  constructor() {
    this.cartService = new CartService()
    this.orderService = new OrderService()
    this.customerService = new CustomerService()
    this.discountService = new DiscountService()
    this.storeService = new StoreService()
  }

  private async getShippingMethods(storeId: string) {
    const settings = await this.storeService.getSettingsByGroup(storeId, 'shipping')
    const methods: Array<{ id: string; name: string; price: number; estimatedDays: string }> = []

    // Look for shipping methods stored in settings
    for (const [key, value] of Object.entries(settings)) {
      if (key.startsWith('method_') && value) {
        const method = typeof value === 'string' ? JSON.parse(value) : value
        if (method.enabled !== false) {
          methods.push({
            id: method.id || key.replace('method_', ''),
            name: method.name || key.replace('method_', ''),
            price: Number(method.price) || 0,
            estimatedDays: method.estimatedDays || '5-7',
          })
        }
      }
    }

    // Fallback to defaults if no methods configured
    if (methods.length === 0) {
      return [
        { id: 'standard', name: 'Standard Shipping', price: 9.99, estimatedDays: '5-7' },
        { id: 'express', name: 'Express Shipping', price: 19.99, estimatedDays: '2-3' },
        { id: 'overnight', name: 'Overnight Shipping', price: 29.99, estimatedDays: '1' },
      ]
    }

    return methods
  }

  private async getPaymentMethods(storeId: string) {
    const settings = await this.storeService.getSettingsByGroup(storeId, 'payments')
    const methods: Array<{ id: string; name: string; icon: string }> = []

    for (const [key, value] of Object.entries(settings)) {
      if (key.startsWith('provider_') && value) {
        const provider = typeof value === 'string' ? JSON.parse(value) : value
        if (provider.enabled) {
          const id = key.replace('provider_', '')
          methods.push({
            id,
            name: provider.name || id,
            icon: provider.icon || id,
          })
        }
      }
    }

    // Fallback to defaults if no providers configured
    if (methods.length === 0) {
      return [
        { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card' },
        { id: 'paypal', name: 'PayPal', icon: 'paypal' },
      ]
    }

    return methods
  }

  async index({ inertia, session, response, store }: HttpContext) {
    const storeId = store.id
    const sessionId = session.sessionId
    const customerId = session.get('customer_id')

    const cart = await this.cartService.getOrCreateCart(storeId, customerId, sessionId)
    await cart.load('items', (query) => {
      query.preload('product', (q) => q.preload('images')).preload('variant')
    })

    if (cart.items.length === 0) {
      session.flash('error', 'Your cart is empty')
      return response.redirect().toRoute('storefront.cart')
    }

    let customer: Customer | null = null
    let addresses: any[] = []

    if (customerId) {
      customer = await this.customerService.findById(customerId)
      if (customer) {
        addresses = await this.customerService.getAddresses(customerId)
      }
    }

    return inertia.render('storefront/Checkout', {
      cart: this.serializeCart(cart),
      customer: customer
        ? {
            id: customer.id,
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
          }
        : null,
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
      shippingMethods: await this.getShippingMethods(storeId),
    })
  }

  async processCheckout({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const sessionId = session.sessionId
    let customerId = session.get('customer_id')

    const cart = await this.cartService.getOrCreateCart(storeId, customerId, sessionId)
    await cart.load('items')

    if (cart.items.length === 0) {
      session.flash('error', 'Your cart is empty')
      return response.redirect().toRoute('storefront.cart')
    }

    const data = request.only([
      'email',
      'createAccount',
      'password',
      'billingAddress',
      'shippingAddress',
      'sameAsShipping',
      'shippingMethod',
      'notes',
    ])

    try {
      // Create customer account if requested
      if (!customerId && data.createAccount && data.password) {
        const customer = await this.customerService.create({
          storeId,
          email: data.email,
          password: data.password,
          firstName: data.billingAddress.firstName,
          lastName: data.billingAddress.lastName,
          phone: data.billingAddress.phone,
        })
        customerId = customer.id
        session.put('customer_id', customerId)

        // Save addresses
        await this.customerService.addAddress(customerId, {
          ...data.billingAddress,
          type: 'billing',
          isDefault: true,
        })

        if (!data.sameAsShipping && data.shippingAddress) {
          await this.customerService.addAddress(customerId, {
            ...data.shippingAddress,
            type: 'shipping',
          })
        }
      }

      // Find guest customer or create order with guest info
      if (!customerId) {
        const existingCustomer = await this.customerService.findByEmail(storeId, data.email)
        if (existingCustomer) {
          customerId = existingCustomer.id
        } else {
          // Create guest customer
          const guestCustomer = await this.customerService.create({
            storeId,
            email: data.email,
            firstName: data.billingAddress.firstName,
            lastName: data.billingAddress.lastName,
            phone: data.billingAddress.phone,
          })
          customerId = guestCustomer.id
        }
      }

      // Get shipping cost from configured methods
      const shippingMethods = await this.getShippingMethods(storeId)
      const selectedMethod = shippingMethods.find((m) => m.id === data.shippingMethod)
      const shippingCost = selectedMethod?.price || 0

      // Update cart with email
      cart.email = data.email
      cart.customerId = customerId
      await cart.save()

      // Create order
      const order = await this.orderService.createFromCart({
        cartId: cart.id,
        customerId,
        billingAddress: data.billingAddress,
        shippingAddress: data.sameAsShipping ? data.billingAddress : data.shippingAddress,
        shippingMethod: data.shippingMethod,
        shippingCost,
        notes: data.notes,
      })

      // Increment discount usage + campaign budget if applicable
      if (cart.discountId) {
        await this.discountService.incrementUsage(
          cart.discountId,
          customerId,
          order.grandTotal
        )
      }

      // Redirect to payment page
      return response.redirect().toRoute('storefront.checkout.payment', { orderId: order.id })
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async payment({ params, inertia, session, response }: HttpContext) {
    const order = await this.orderService.findById(params.orderId)

    if (!order) {
      session.flash('error', 'Order not found')
      return response.redirect().toRoute('storefront.cart')
    }

    if (order.paymentStatus !== 'pending') {
      return response.redirect().toRoute('storefront.checkout.confirmation', { orderId: order.id })
    }

    const paymentProvider = await app.container.make(PaymentProvider)

    return inertia.render('storefront/checkout/Payment', {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.grandTotal,
        currency: order.currencyCode,
      },
      paymentMethods: await this.getPaymentMethods(order.storeId),
      paymentProvider: paymentProvider.name,
      stripePublicKey: paymentProvider.name === 'stripe'
        ? (process.env.STRIPE_PUBLIC_KEY || '')
        : undefined,
    })
  }

  async processPayment({ params, request, response, session }: HttpContext) {
    const order = await this.orderService.findById(params.orderId)

    if (!order) {
      session.flash('error', 'Order not found')
      return response.redirect().toRoute('storefront.cart')
    }

    const { paymentMethod } = request.only(['paymentMethod'])
    const paymentProvider = await app.container.make(PaymentProvider)

    try {
      const baseUrl = request.completeUrl().split('/checkout')[0]

      // Create payment via provider
      const result = await paymentProvider.createPayment({
        orderId: order.id,
        amount: order.grandTotal,
        currency: order.currencyCode,
        customerEmail: order.email,
        customerName: order.billingAddress?.firstName
          ? `${order.billingAddress.firstName} ${order.billingAddress.lastName || ''}`
          : undefined,
        description: `Order ${order.orderNumber}`,
        returnUrl: `${baseUrl}/checkout/confirmation/${order.id}`,
        cancelUrl: `${baseUrl}/checkout/payment/${order.id}`,
        metadata: { orderNumber: order.orderNumber },
      })

      if (!result.success) {
        // Record the failed attempt
        await this.orderService.addTransaction(order.id, {
          type: 'capture',
          amount: order.grandTotal,
          currencyCode: order.currencyCode,
          paymentMethod: paymentMethod || paymentProvider.name,
          gatewayTransactionId: result.transactionId || undefined,
          status: 'failed',
          gatewayResponse: result.gatewayResponse,
        })

        await emitter.emit(PaymentFailed, new PaymentFailed(
          order,
          result.errorMessage || 'Payment failed',
          result.errorCode
        ))

        session.flash('error', result.errorMessage || 'Payment failed. Please try again.')
        return response.redirect().back()
      }

      // Record the pending/authorized transaction
      const transaction = await this.orderService.addTransaction(order.id, {
        type: result.status === 'captured' ? 'capture' : 'authorization',
        amount: order.grandTotal,
        currencyCode: order.currencyCode,
        paymentMethod: paymentMethod || paymentProvider.name,
        gatewayTransactionId: result.transactionId || undefined,
        status: result.status === 'captured' ? 'success' : 'pending',
        gatewayResponse: result.gatewayResponse,
      })

      // If provider returned a redirect URL (Stripe Checkout, PayPal, etc.)
      if (result.redirectUrl) {
        // Store transaction reference on order for webhook matching
        order.paymentMethod = paymentProvider.name
        order.paymentMethodTitle = paymentProvider.displayName
        await order.save()

        return response.redirect(result.redirectUrl)
      }

      // If payment was captured immediately (manual provider, etc.)
      if (result.status === 'captured') {
        await this.orderService.updatePaymentStatus(order.id, 'paid')
        await this.orderService.updateStatus(order.id, 'confirmed', 'Payment received')

        if (order.customerId) {
          await this.customerService.incrementOrderStats(order.customerId, order.grandTotal)
        }

        const updatedOrder = await this.orderService.findById(order.id)
        if (updatedOrder) {
          await emitter.emit(PaymentCaptured, new PaymentCaptured(updatedOrder, transaction))
        }

        session.flash('success', 'Payment successful!')
        return response.redirect().toRoute('storefront.checkout.confirmation', { orderId: order.id })
      }

      // If authorized (auth-then-capture flow), update status and go to confirmation
      if (result.status === 'authorized') {
        await this.orderService.updatePaymentStatus(order.id, 'authorized')
        order.paymentMethod = paymentProvider.name
        order.paymentMethodTitle = paymentProvider.displayName
        await order.save()

        return response.redirect().toRoute('storefront.checkout.confirmation', { orderId: order.id })
      }

      // Pending (e.g. async webhook will confirm later)
      order.paymentMethod = paymentProvider.name
      order.paymentMethodTitle = paymentProvider.displayName
      await order.save()

      session.flash('info', 'Payment is being processed. You will receive a confirmation email.')
      return response.redirect().toRoute('storefront.checkout.confirmation', { orderId: order.id })
    } catch (error) {
      session.flash('error', `Payment failed: ${error.message}`)
      return response.redirect().back()
    }
  }

  async confirmation({ params, inertia, session, response }: HttpContext) {
    const order = await this.orderService.findById(params.orderId)

    if (!order) {
      session.flash('error', 'Order not found')
      return response.redirect().toRoute('storefront.home')
    }

    return inertia.render('storefront/checkout/Confirmation', {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        email: order.email,
        status: order.status,
        paymentStatus: order.paymentStatus,
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
        createdAt: order.createdAt.toISO(),
      },
    })
  }

  private serializeCart(cart: any) {
    return {
      id: cart.id,
      itemCount: cart.totalItems,
      subtotal: cart.subtotal,
      discountTotal: cart.discountTotal,
      discountCode: cart.couponCode,
      taxTotal: cart.taxTotal,
      total: cart.grandTotal,
      currency: cart.currencyCode,
      items: cart.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        title: item.title,
        variantTitle: item.variantTitle,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        thumbnail: item.product?.images?.[0]?.url,
      })),
    }
  }
}
