import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import Order from '#models/order'
import { createOrderValidator } from '#validators/order_validator'
import emitter from '@adonisjs/core/services/emitter'
import { OrderCreated } from '#events/order_events'

/**
 * OrdersController
 *
 * REST API controller for order operations.
 * Handles order creation, retrieval, and status management.
 */
export default class OrdersController {
  /**
   * GET /api/orders
   * List customer's orders
   */
  async index({ request, response, auth, store }: HttpContext) {
    const storeId = store.id
    const customer = auth.user

    if (!customer) {
      return response.unauthorized({ error: 'Authentication required' })
    }

    const { page = 1, limit = 10, status } = request.qs()

    const query = Order.query()
      .where('storeId', storeId)
      .where('customerId', customer.id)
      .preload('items', (q) => {
        q.preload('product', (pq) => pq.preload('images', (iq) => iq.limit(1)))
      })
      .orderBy('createdAt', 'desc')

    if (status) {
      query.where('status', status)
    }

    const orders = await query.paginate(page, Math.min(limit, 50))

    return response.json({
      data: orders.all().map((o) => this.formatOrder(o)),
      meta: {
        total: orders.total,
        perPage: orders.perPage,
        currentPage: orders.currentPage,
        lastPage: orders.lastPage,
      },
    })
  }

  /**
   * GET /api/orders/:id
   * Get a single order
   */
  async show({ params, request, response, auth, store }: HttpContext) {
    const storeId = store.id
    const customer = auth.user

    const query = Order.query()
      .where('storeId', storeId)
      .preload('items', (q) => {
        q.preload('product', (pq) => pq.preload('images', (iq) => iq.limit(1)))
        q.preload('variant')
      })
      .preload('transactions')
      .preload('fulfillments', (q) => q.preload('items'))
      .preload('statusHistory')

    // Check by order number or ID
    if (this.isUuid(params.id)) {
      query.where('id', params.id)
    } else {
      query.where('orderNumber', params.id)
    }

    // If authenticated, verify ownership
    if (customer) {
      query.where('customerId', customer.id)
    } else {
      // Allow guest order lookup by email + order number
      const { email } = request.qs()
      if (!email) {
        return response.unauthorized({ error: 'Authentication or email required' })
      }
      query.where('email', email)
    }

    const order = await query.first()

    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    return response.json({
      data: this.formatOrderDetailed(order),
    })
  }

  /**
   * POST /api/orders
   * Create a new order (checkout)
   */
  async store({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const payload = await request.validateUsing(createOrderValidator)

    // Get cart
    const cartId = session.get('cart_id')
    if (!cartId) {
      return response.badRequest({ error: 'Cart is empty' })
    }

    const Cart = (await import('#models/cart')).default
    const cart = await Cart.query()
      .where('id', cartId)
      .where('storeId', storeId)
      .preload('items', (q) => {
        q.preload('product')
        q.preload('variant')
      })
      .first()

    if (!cart || cart.items.length === 0) {
      return response.badRequest({ error: 'Cart is empty' })
    }

    // Validate inventory
    for (const item of cart.items) {
      const stockItem = item.variant || item.product
      if (stockItem.trackInventory && (stockItem.stockQuantity || 0) < item.quantity) {
        return response.badRequest({
          error: `Insufficient stock for ${item.product.title}`,
        })
      }
    }

    // Generate order number
    const orderNumber = await this.generateOrderNumber(storeId)

    // Prepare addresses as JSONB objects
    const shippingAddressData = {
      firstName: payload.shippingAddress.firstName,
      lastName: payload.shippingAddress.lastName,
      company: payload.shippingAddress.company || null,
      address1: payload.shippingAddress.address1,
      address2: payload.shippingAddress.address2 || null,
      city: payload.shippingAddress.city,
      state: payload.shippingAddress.state || null,
      postalCode: payload.shippingAddress.postalCode,
      country: payload.shippingAddress.country,
      phone: payload.shippingAddress.phone || null,
    }

    const billingAddressData = payload.billingAddress && !payload.sameAsShipping
      ? {
          firstName: payload.billingAddress.firstName,
          lastName: payload.billingAddress.lastName,
          company: payload.billingAddress.company || null,
          address1: payload.billingAddress.address1,
          address2: payload.billingAddress.address2 || null,
          city: payload.billingAddress.city,
          state: payload.billingAddress.state || null,
          postalCode: payload.billingAddress.postalCode,
          country: payload.billingAddress.country,
          phone: payload.billingAddress.phone || null,
        }
      : shippingAddressData

    const order = await Order.create({
      storeId,
      orderNumber,
      customerId: payload.customerId || cart.customerId,
      email: payload.email,
      phone: payload.phone,
      shippingAddress: shippingAddressData,
      billingAddress: billingAddressData,
      subtotal: cart.subtotal,
      discountId: cart.discountId,
      couponCode: cart.couponCode,
      discountTotal: cart.discountTotal || 0,
      shippingTotal: cart.shippingTotal || 0,
      taxTotal: cart.taxTotal || 0,
      grandTotal: cart.grandTotal,
      currencyCode: cart.currencyCode,
      status: 'pending',
      paymentStatus: 'pending',
      fulfillmentStatus: 'unfulfilled',
      notes: payload.notes,
      placedAt: DateTime.now(),
    })

    // Create order items
    const OrderItem = (await import('#models/order_item')).default
    for (const cartItem of cart.items) {
      await OrderItem.create({
        orderId: order.id,
        productId: cartItem.productId,
        variantId: cartItem.variantId || undefined,
        title: cartItem.product.title,
        variantTitle: cartItem.variant?.title || undefined,
        sku: cartItem.variant?.sku || cartItem.product.sku || '',
        unitPrice: cartItem.unitPrice,
        quantity: cartItem.quantity,
        totalPrice: cartItem.totalPrice,
        thumbnailUrl: cartItem.product.images?.[0]?.url || undefined,
      })

      // Decrement inventory
      const stockItem = cartItem.variant || cartItem.product
      if (stockItem.trackInventory) {
        stockItem.stockQuantity = (stockItem.stockQuantity || 0) - cartItem.quantity
        await stockItem.save()
      }
    }

    // Increment discount usage
    if (cart.discountId) {
      const { discountEngine } = await import('#helpers/discount_engine')
      await discountEngine.incrementUsage(cart.discountId)
    }

    // Clear cart
    const CartItem = (await import('#models/cart_item')).default
    await CartItem.query().where('cartId', cart.id).delete()
    await cart.delete()
    session.forget('cart_id')

    // Emit order created event
    await emitter.emit(OrderCreated, new OrderCreated(order, null))

    // Reload order with relations
    await order.load('items', (q) => {
      q.preload('product', (pq) => pq.preload('images', (iq) => iq.limit(1)))
    })

    return response.created({
      data: this.formatOrderDetailed(order),
      message: 'Order created successfully',
    })
  }

  /**
   * POST /api/orders/:id/cancel
   * Cancel an order
   */
  async cancel({ params, request, response, auth, store }: HttpContext) {
    const storeId = store.id
    const customer = auth.user

    if (!customer) {
      return response.unauthorized({ error: 'Authentication required' })
    }

    const order = await Order.query()
      .where('id', params.id)
      .where('storeId', storeId)
      .where('customerId', customer.id)
      .first()

    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    // Only allow cancellation of pending orders
    if (!['pending', 'processing'].includes(order.status)) {
      return response.badRequest({
        error: 'Order cannot be cancelled in current status',
      })
    }

    order.status = 'cancelled'
    order.cancelledAt = DateTime.now()
    order.cancelReason = request.body().reason || 'Customer requested'
    await order.save()

    // Restore inventory
    await order.load('items', (q) => {
      q.preload('product')
      q.preload('variant')
    })

    for (const item of order.items) {
      const stockItem = item.variant || item.product
      if (stockItem.trackInventory) {
        stockItem.stockQuantity = (stockItem.stockQuantity || 0) + item.quantity
        await stockItem.save()
      }
    }

    return response.json({
      data: this.formatOrder(order),
      message: 'Order cancelled',
    })
  }

  /**
   * GET /api/orders/:id/track
   * Get order tracking info
   */
  async track({ params, request, response, store }: HttpContext) {
    const storeId = store.id
    const { email } = request.qs()

    const query = Order.query()
      .where('storeId', storeId)
      .preload('fulfillments', (q) => q.preload('items'))
      .preload('statusHistory')

    if (this.isUuid(params.id)) {
      query.where('id', params.id)
    } else {
      query.where('orderNumber', params.id)
    }

    if (email) {
      query.where('email', email)
    }

    const order = await query.first()

    if (!order) {
      return response.notFound({ error: 'Order not found' })
    }

    return response.json({
      data: {
        orderNumber: order.orderNumber,
        status: order.status,
        fulfillmentStatus: order.fulfillmentStatus,
        fulfillments: order.fulfillments?.map((f) => ({
          id: f.id,
          status: f.status,
          carrier: f.carrier,
          trackingNumber: f.trackingNumber,
          trackingUrl: f.trackingUrl,
          shippedAt: f.shippedAt,
          deliveredAt: f.deliveredAt,
        })),
        timeline: order.statusHistory?.map((t) => ({
          type: t.type,
          title: t.title,
          description: t.description,
          createdAt: t.createdAt,
        })),
      },
    })
  }

  // Helper methods
  private async generateOrderNumber(storeId: string): Promise<string> {
    const count = await Order.query()
      .where('storeId', storeId)
      .count('* as total')
      .first()

    const number = Number(count?.$extras.total || 0) + 1
    return `ORD-${number.toString().padStart(6, '0')}`
  }

  private formatOrder(order: Order) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      total: order.grandTotal,
      currency: order.currencyCode,
      itemCount: order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
      items: order.items?.map((item) => ({
        id: item.id,
        title: item.title,
        variantTitle: item.variantTitle,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        image: item.thumbnailUrl || item.product?.images?.[0]?.url || null,
      })),
      createdAt: order.createdAt,
    }
  }

  private formatOrderDetailed(order: Order) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      email: order.email,
      phone: order.phone,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      subtotal: order.subtotal,
      discountCode: order.couponCode,
      discountAmount: order.discountTotal,
      shippingAmount: order.shippingTotal,
      taxAmount: order.taxTotal,
      total: order.grandTotal,
      currency: order.currencyCode,
      items: order.items?.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        title: item.title,
        variantTitle: item.variantTitle,
        sku: item.sku,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        discountAmount: item.discountAmount,
        taxAmount: item.taxAmount,
        image: item.thumbnailUrl || item.product?.images?.[0]?.url || null,
        variantOptions: item.variant
          ? { option1: item.variant.option1, option2: item.variant.option2, option3: item.variant.option3 }
          : null,
      })),
      shippingAddress: order.shippingAddress
        ? {
            firstName: order.shippingAddress.firstName,
            lastName: order.shippingAddress.lastName,
            address1: order.shippingAddress.address1,
            address2: order.shippingAddress.address2,
            city: order.shippingAddress.city,
            state: order.shippingAddress.state,
            postalCode: order.shippingAddress.postalCode,
            country: order.shippingAddress.country,
          }
        : null,
      billingAddress: order.billingAddress
        ? {
            firstName: order.billingAddress.firstName,
            lastName: order.billingAddress.lastName,
            address1: order.billingAddress.address1,
            address2: order.billingAddress.address2,
            city: order.billingAddress.city,
            state: order.billingAddress.state,
            postalCode: order.billingAddress.postalCode,
            country: order.billingAddress.country,
          }
        : null,
      fulfillments: order.fulfillments?.map((f) => ({
        id: f.id,
        status: f.status,
        carrier: f.carrier,
        trackingNumber: f.trackingNumber,
        trackingUrl: f.trackingUrl,
        shippedAt: f.shippedAt,
        deliveredAt: f.deliveredAt,
        items: f.items?.map((fi) => ({
          orderItemId: fi.orderItemId,
          quantity: fi.quantity,
        })),
      })),
      transactions: order.transactions?.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        status: t.status,
        paymentMethod: t.paymentMethod,
        createdAt: t.createdAt,
      })),
      timeline: order.statusHistory?.map((t) => ({
        type: t.type,
        title: t.title,
        description: t.description,
        createdAt: t.createdAt,
      })),
      notes: order.notes,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      cancelledAt: order.cancelledAt,
      cancellationReason: order.cancelReason,
    }
  }

  private isUuid(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }
}
