import type { HttpContext } from '@adonisjs/core/http'
import CartService from '#services/cart_service'
import OrderService from '#services/order_service'
import CustomerService from '#services/customer_service'
import DiscountService from '#services/discount_service'
import Customer from '#models/customer'

export default class CheckoutController {
  private cartService: CartService
  private orderService: OrderService
  private customerService: CustomerService
  private discountService: DiscountService

  constructor() {
    this.cartService = new CartService()
    this.orderService = new OrderService()
    this.customerService = new CustomerService()
    this.discountService = new DiscountService()
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
        address1: a.address1,
        address2: a.address2,
        city: a.city,
        state: a.state,
        postalCode: a.postalCode,
        country: a.country,
        phone: a.phone,
      })),
      shippingMethods: [
        { id: 'standard', name: 'Standard Shipping', price: 9.99, estimatedDays: '5-7' },
        { id: 'express', name: 'Express Shipping', price: 19.99, estimatedDays: '2-3' },
        { id: 'overnight', name: 'Overnight Shipping', price: 29.99, estimatedDays: '1' },
      ],
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

      // Get shipping cost
      const shippingCosts: Record<string, number> = {
        standard: 9.99,
        express: 19.99,
        overnight: 29.99,
      }
      const shippingCost = shippingCosts[data.shippingMethod] || 0

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

      // Increment discount usage if applicable
      if (cart.couponCode) {
        const discount = await this.discountService.findByCode(storeId, cart.couponCode)
        if (discount) {
          await this.discountService.incrementUsage(discount.id, customerId)
        }
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

    return inertia.render('storefront/checkout/Payment', {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.grandTotal,
        currency: order.currencyCode,
      },
      paymentMethods: [
        { id: 'card', name: 'Credit/Debit Card', icon: 'credit-card' },
        { id: 'paypal', name: 'PayPal', icon: 'paypal' },
      ],
    })
  }

  async processPayment({ params, request, response, session }: HttpContext) {
    const order = await this.orderService.findById(params.orderId)

    if (!order) {
      session.flash('error', 'Order not found')
      return response.redirect().toRoute('storefront.cart')
    }

    const { paymentMethod } = request.only(['paymentMethod'])

    try {
      // In a real implementation, this would integrate with a payment provider
      // For now, we'll simulate successful payment

      // Create payment transaction
      await this.orderService.addTransaction(order.id, {
        type: 'capture',
        amount: order.grandTotal,
        currencyCode: order.currencyCode,
        paymentMethod,
        status: 'success',
      })

      // Update order status
      await this.orderService.updatePaymentStatus(order.id, 'paid')
      await this.orderService.updateStatus(order.id, 'confirmed', 'Payment received')

      // Update customer stats
      if (order.customerId) {
        await this.customerService.incrementOrderStats(order.customerId, order.grandTotal)
      }

      session.flash('success', 'Payment successful!')
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
