import type { HttpContext } from '@adonisjs/core/http'
import OrderService from '#services/order_service'
import FulfillmentService from '#services/fulfillment_service'
import RefundService from '#services/refund_service'
import Order from '#models/order'
import { DateTime } from 'luxon'

export default class OrdersController {
  private orderService: OrderService
  private fulfillmentService: FulfillmentService
  private refundService: RefundService

  constructor() {
    this.orderService = new OrderService()
    this.fulfillmentService = new FulfillmentService()
    this.refundService = new RefundService()
  }

  async index({ inertia, request, store }: HttpContext) {
    const storeId = store.id
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')
    const paymentStatus = request.input('paymentStatus')
    const fulfillmentStatus = request.input('fulfillmentStatus')
    const search = request.input('search')
    const dateFrom = request.input('dateFrom')
    const dateTo = request.input('dateTo')
    const sortBy = request.input('sortBy', 'createdAt')
    const sortDir = request.input('sortDir', 'desc')

    const orders = await this.orderService.list({
      storeId,
      status,
      paymentStatus,
      fulfillmentStatus,
      search,
      dateFrom: dateFrom ? DateTime.fromISO(dateFrom) : undefined,
      dateTo: dateTo ? DateTime.fromISO(dateTo) : undefined,
      sortBy,
      sortDir,
      page,
      limit,
    })

    return inertia.render('admin/orders/Index', {
      orders: {
        data: orders.all().map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customer: o.customer
            ? { id: o.customer.id, name: o.customer.fullName, email: o.customer.email }
            : { email: o.email },
          total: o.grandTotal,
          currency: o.currencyCode,
          status: o.status,
          paymentStatus: o.paymentStatus,
          fulfillmentStatus: o.fulfillmentStatus,
          itemCount: o.items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
          createdAt: o.createdAt.toISO(),
        })),
        meta: orders.getMeta(),
      },
      filters: { status, paymentStatus, fulfillmentStatus, search, dateFrom, dateTo, sortBy, sortDir },
    })
  }

  async show({ params, inertia }: HttpContext) {
    const order = await this.orderService.findById(params.id)

    if (!order) {
      return inertia.render('admin/errors/NotFound', { resource: 'Order' })
    }

    const refundability = await this.refundService.canRefund(order.id)
    const unfulfilledItems = await this.fulfillmentService.getUnfulfilledItems(order.id)

    return inertia.render('admin/orders/Show', {
      order: this.serializeOrder(order),
      refundability,
      unfulfilledItems: unfulfilledItems.map((item) => ({
        id: item.id,
        title: item.title,
        variantTitle: item.variantTitle,
        quantity: item.quantity,
        fulfilledQuantity: item.fulfilledQuantity,
        remainingQuantity: item.quantity - item.fulfilledQuantity,
      })),
    })
  }

  async updateStatus({ params, request, response, session, auth }: HttpContext) {
    const { status, note } = request.only(['status', 'note'])

    try {
      await this.orderService.updateStatus(params.id, status, note, auth.user?.id)
      session.flash('success', 'Order status updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async createFulfillment({ params, request, response, session, auth }: HttpContext) {
    const data = request.only(['locationId', 'trackingNumber', 'trackingUrl', 'carrier', 'notes', 'items'])

    try {
      await this.fulfillmentService.create(
        {
          orderId: params.id,
          ...data,
        },
        auth.user?.id?.toString()
      )
      session.flash('success', 'Fulfillment created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async shipFulfillment({ params, request, response, session }: HttpContext) {
    const { trackingNumber, trackingUrl, carrier } = request.only([
      'trackingNumber',
      'trackingUrl',
      'carrier',
    ])

    try {
      await this.fulfillmentService.ship(params.fulfillmentId, {
        trackingNumber,
        trackingUrl,
        carrier,
      })
      session.flash('success', 'Fulfillment marked as shipped')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async deliverFulfillment({ params, response, session }: HttpContext) {
    try {
      await this.fulfillmentService.markDelivered(params.fulfillmentId)
      session.flash('success', 'Fulfillment marked as delivered')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async cancelFulfillment({ params, response, session }: HttpContext) {
    try {
      await this.fulfillmentService.cancel(params.fulfillmentId)
      session.flash('success', 'Fulfillment cancelled')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async createRefund({ params, request, response, session, auth }: HttpContext) {
    const data = request.only(['reason', 'notes', 'items', 'refundShipping'])

    try {
      const refund = await this.refundService.create(
        {
          orderId: params.id,
          ...data,
        },
        auth.user?.id
      )

      // Auto-process refund (in production, this would integrate with payment provider)
      await this.refundService.process(refund.id)

      session.flash('success', 'Refund processed successfully')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async cancel({ params, request, response, session, auth }: HttpContext) {
    const { reason } = request.only(['reason'])

    try {
      await this.orderService.cancel(params.id, reason, auth.user?.id)
      session.flash('success', 'Order cancelled')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async addNote({ params, request, response, session }: HttpContext) {
    const { note } = request.only(['note'])
    const order = await Order.findOrFail(params.id)

    const notes = order.notes ? `${order.notes}\n\n---\n\n${note}` : note
    order.notes = notes
    await order.save()

    session.flash('success', 'Note added')
    return response.redirect().back()
  }

  async export({ request, response, store }: HttpContext) {
    const storeId = store.id
    const { format = 'csv', dateFrom, dateTo } = request.qs()

    const orders = await this.orderService.list({
      storeId,
      dateFrom: dateFrom ? DateTime.fromISO(dateFrom) : undefined,
      dateTo: dateTo ? DateTime.fromISO(dateTo) : undefined,
      limit: 10000,
    })

    if (format === 'csv') {
      const csv = this.generateCSV(orders.all())
      response.header('Content-Type', 'text/csv')
      response.header('Content-Disposition', `attachment; filename="orders-${DateTime.now().toISODate()}.csv"`)
      return response.send(csv)
    }

    return response.json(orders.all().map((o) => this.serializeOrder(o)))
  }

  private serializeOrder(order: Order) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      email: order.email,
      phone: order.phone,
      status: order.status,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      currency: order.currencyCode,
      subtotal: order.subtotal,
      discountTotal: order.discountTotal,
      discountCode: order.couponCode,
      shippingTotal: order.shippingTotal,
      taxTotal: order.taxTotal,
      total: order.grandTotal,
      itemCount: order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
      billingAddress: order.billingAddress,
      shippingAddress: order.shippingAddress,
      shippingMethod: order.shippingMethod,
      notes: order.notes,
      metadata: order.metadata,
      paidAt: order.paymentStatus === 'paid' ? order.updatedAt?.toISO() : null,
      cancelledAt: order.cancelledAt?.toISO(),
      createdAt: order.createdAt.toISO(),
      updatedAt: order.updatedAt.toISO(),
      customer: order.customer
        ? {
            id: order.customer.id,
            name: order.customer.fullName,
            email: order.customer.email,
            phone: order.customer.phone,
          }
        : null,
      items: order.items?.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        sku: item.sku,
        title: item.title,
        variantTitle: item.variantTitle,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        discountAmount: item.discountAmount,
        taxAmount: item.taxAmount,
        totalPrice: item.totalPrice,
        fulfilledQuantity: item.fulfilledQuantity,
        returnedQuantity: item.returnedQuantity,
      })),
      transactions: order.transactions?.map((t) => ({
        id: t.id,
        type: t.type,
        amount: t.amount,
        currencyCode: t.currencyCode,
        paymentMethod: t.paymentMethod,
        status: t.status,
        createdAt: t.createdAt.toISO(),
      })),
      fulfillments: order.fulfillments?.map((f) => ({
        id: f.id,
        status: f.status,
        trackingNumber: f.trackingNumber,
        trackingUrl: f.trackingUrl,
        carrier: f.carrier,
        shippedAt: f.shippedAt?.toISO(),
        deliveredAt: f.deliveredAt?.toISO(),
        items: f.items?.map((fi) => ({
          orderItemId: fi.orderItemId,
          quantity: fi.quantity,
        })),
      })),
      refunds: order.refunds?.map((r) => ({
        id: r.id,
        amount: r.amount,
        reason: r.reason,
        status: r.status,
        createdAt: r.createdAt.toISO(),
        items: r.items?.map((ri) => ({
          orderItemId: ri.orderItemId,
          quantity: ri.quantity,
          amount: ri.amount,
        })),
      })),
      statusHistory: order.statusHistory?.map((h) => ({
        previousStatus: h.previousStatus,
        status: h.status,
        title: h.title,
        description: h.description,
        createdAt: h.createdAt.toISO(),
      })),
    }
  }

  private generateCSV(orders: Order[]): string {
    const headers = [
      'Order Number',
      'Date',
      'Customer Email',
      'Status',
      'Payment Status',
      'Fulfillment Status',
      'Subtotal',
      'Discount',
      'Shipping',
      'Tax',
      'Total',
      'Currency',
      'Items',
    ]

    const rows = orders.map((order) => [
      order.orderNumber,
      order.createdAt.toISO(),
      order.email,
      order.status,
      order.paymentStatus,
      order.fulfillmentStatus,
      order.subtotal,
      order.discountTotal,
      order.shippingTotal,
      order.taxTotal,
      order.grandTotal,
      order.currencyCode,
      order.items?.reduce((sum, i) => sum + i.quantity, 0) || 0,
    ])

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n')
  }
}
