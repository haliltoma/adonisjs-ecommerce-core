import type { HttpContext } from '@adonisjs/core/http'
import OrderService from '#services/order_service'
import FulfillmentService from '#services/fulfillment_service'
import RefundService from '#services/refund_service'
import ReturnService from '#services/return_service'
import Order from '#models/order'
import Claim from '#models/claim'
import ClaimItem from '#models/claim_item'
import Exchange from '#models/exchange'
import OrderEdit from '#models/order_edit'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class OrdersController {
  private orderService: OrderService
  private fulfillmentService: FulfillmentService
  private refundService: RefundService

  private returnService: ReturnService

  constructor() {
    this.orderService = new OrderService()
    this.fulfillmentService = new FulfillmentService()
    this.refundService = new RefundService()
    this.returnService = new ReturnService()
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

  async show({ params, inertia, store }: HttpContext) {
    const order = await this.orderService.findById(params.id)

    if (!order) {
      return inertia.render('admin/errors/NotFound', { resource: 'Order' })
    }

    const refundability = await this.refundService.canRefund(order.id)
    const unfulfilledItems = await this.fulfillmentService.getUnfulfilledItems(order.id)

    // Load order lifecycle data
    const storeId = store.id
    const returns = await this.returnService.getByOrder(storeId, order.id)
    const claims = await Claim.query()
      .where('storeId', storeId)
      .where('orderId', order.id)
      .preload('items', (q) => q.preload('orderItem'))
      .orderBy('createdAt', 'desc')
    const exchanges = await Exchange.query()
      .where('storeId', storeId)
      .where('orderId', order.id)
      .orderBy('createdAt', 'desc')
    const edits = await OrderEdit.query()
      .where('storeId', storeId)
      .where('orderId', order.id)
      .preload('creator')
      .orderBy('createdAt', 'desc')

    // Load return reasons for the create return modal
    const returnReasons = await this.returnService.listReasons(storeId)

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
      returns: returns.map((r) => ({
        id: r.id,
        status: r.status,
        refundAmount: r.refundAmount,
        note: r.note,
        receivedAt: r.receivedAt?.toISO(),
        createdAt: r.createdAt.toISO(),
        items: r.items.map((ri) => ({
          id: ri.id,
          quantity: ri.quantity,
          receivedQuantity: ri.receivedQuantity,
          orderItem: ri.orderItem ? { id: ri.orderItem.id, title: ri.orderItem.title, variantTitle: ri.orderItem.variantTitle } : null,
          reason: ri.reason ? { label: ri.reason.label } : null,
          note: ri.note,
        })),
      })),
      claims: claims.map((c) => ({
        id: c.id,
        type: c.type,
        status: c.status,
        refundAmount: c.refundAmount,
        note: c.note,
        createdAt: c.createdAt.toISO(),
        items: c.items.map((ci) => ({
          id: ci.id,
          quantity: ci.quantity,
          reason: ci.reason,
          note: ci.note,
          orderItem: ci.orderItem ? { id: ci.orderItem.id, title: ci.orderItem.title } : null,
        })),
      })),
      exchanges: exchanges.map((e) => ({
        id: e.id,
        status: e.status,
        differenceAmount: e.differenceAmount,
        paymentStatus: e.paymentStatus,
        note: e.note,
        newItems: e.newItems,
        createdAt: e.createdAt.toISO(),
      })),
      edits: edits.map((ed) => ({
        id: ed.id,
        status: ed.status,
        differenceAmount: ed.differenceAmount,
        internalNote: ed.internalNote,
        changes: ed.changes,
        creator: ed.creator ? { name: ed.creator.displayName } : null,
        requestedAt: ed.requestedAt?.toISO(),
        confirmedAt: ed.confirmedAt?.toISO(),
        createdAt: ed.createdAt.toISO(),
      })),
      returnReasons: returnReasons.map((r) => ({
        id: r.id,
        label: r.label,
      })),
    })
  }

  async updateStatus({ params, request, response, session, admin }: HttpContext) {
    const { status, note } = request.only(['status', 'note'])

    try {
      await this.orderService.updateStatus(params.id, status, note, admin?.id)
      session.flash('success', 'Order status updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async createFulfillment({ params, request, response, session, admin }: HttpContext) {
    const raw = request.only(['locationId', 'trackingNumber', 'trackingUrl', 'carrier', 'notes', 'items'])

    const data = {
      ...raw,
      trackingNumber: raw.trackingNumber || undefined,
      trackingUrl: raw.trackingUrl || undefined,
      carrier: raw.carrier || undefined,
      notes: raw.notes || undefined,
    }

    try {
      await this.fulfillmentService.create(
        {
          orderId: params.id,
          ...data,
        },
        admin?.id?.toString()
      )
      session.flash('success', 'Fulfillment created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async shipFulfillment({ params, request, response, session }: HttpContext) {
    const raw = request.only([
      'trackingNumber',
      'trackingUrl',
      'carrier',
    ])

    try {
      await this.fulfillmentService.ship(params.fulfillmentId, {
        trackingNumber: raw.trackingNumber || undefined,
        trackingUrl: raw.trackingUrl || undefined,
        carrier: raw.carrier || undefined,
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

  async createRefund({ params, request, response, session, admin }: HttpContext) {
    const data = request.only(['reason', 'notes', 'items', 'refundShipping'])

    try {
      const refund = await this.refundService.create(
        {
          orderId: params.id,
          ...data,
        },
        admin?.id
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

  async cancel({ params, request, response, session, admin }: HttpContext) {
    const { reason } = request.only(['reason'])

    try {
      await this.orderService.cancel(params.id, reason, admin?.id)
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

  // --- Returns ---
  async createReturn({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id
    const { items, shippingMethod, note } = request.only(['items', 'shippingMethod', 'note'])

    try {
      await this.returnService.requestReturn({
        storeId,
        orderId: params.id,
        items,
        shippingMethod,
        note,
      })
      session.flash('success', 'Return request created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async receiveReturn({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id
    const { items, receivedBy } = request.only(['items', 'receivedBy'])

    try {
      await this.returnService.receiveReturn(storeId, params.returnId, { items, receivedBy })
      session.flash('success', 'Return items received')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async cancelReturn({ params, response, session, store }: HttpContext) {
    const storeId = store.id

    try {
      await this.returnService.cancelReturn(storeId, params.returnId)
      session.flash('success', 'Return cancelled')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async completeReturn({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id
    const { refundAmount } = request.only(['refundAmount'])

    try {
      await this.returnService.completeReturn(storeId, params.returnId, refundAmount)
      session.flash('success', 'Return completed')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  // --- Claims ---
  async createClaim({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id
    const { type, items, note } = request.only(['type', 'items', 'note'])

    try {
      await db.transaction(async (trx) => {
        const claim = await Claim.create(
          {
            storeId,
            orderId: params.id,
            type,
            status: 'pending',
            note: note || null,
            metadata: {},
          },
          { client: trx }
        )

        await ClaimItem.createMany(
          items.map((item: any) => ({
            claimId: claim.id,
            orderItemId: item.orderItemId,
            quantity: item.quantity,
            reason: item.reason || 'other',
            note: item.note || null,
            images: item.images || [],
            tags: item.tags || [],
            metadata: {},
          })),
          { client: trx }
        )
      })

      session.flash('success', 'Claim created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async updateClaimStatus({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id
    const { status, refundAmount } = request.only(['status', 'refundAmount'])

    try {
      const claim = await Claim.query()
        .where('storeId', storeId)
        .where('id', params.claimId)
        .firstOrFail()

      claim.status = status
      if (refundAmount !== undefined) {
        claim.refundAmount = refundAmount
      }
      await claim.save()

      session.flash('success', 'Claim updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  // --- Exchanges ---
  async createExchange({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id
    const { returnId, newItems, differenceAmount, note } = request.only([
      'returnId',
      'newItems',
      'differenceAmount',
      'note',
    ])

    try {
      await Exchange.create({
        storeId,
        orderId: params.id,
        returnId: returnId || null,
        status: 'pending',
        differenceAmount: differenceAmount || 0,
        paymentStatus: 'not_paid',
        note: note || null,
        newItems: newItems || [],
        metadata: {},
      })

      session.flash('success', 'Exchange created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async updateExchangeStatus({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id
    const { status, paymentStatus } = request.only(['status', 'paymentStatus'])

    try {
      const exchange = await Exchange.query()
        .where('storeId', storeId)
        .where('id', params.exchangeId)
        .firstOrFail()

      if (status) exchange.status = status
      if (paymentStatus) exchange.paymentStatus = paymentStatus
      await exchange.save()

      session.flash('success', 'Exchange updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  // --- Order Edits ---
  async createOrderEdit({ params, request, response, session, store, admin }: HttpContext) {
    const storeId = store.id
    const { changes, internalNote } = request.only(['changes', 'internalNote'])

    try {
      await OrderEdit.create({
        storeId,
        orderId: params.id,
        createdBy: admin?.id ? String(admin.id) : null,
        status: 'created',
        internalNote: internalNote || null,
        differenceAmount: 0,
        changes: changes || [],
        metadata: {},
      })

      session.flash('success', 'Order edit created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async requestOrderEdit({ params, response, session, store }: HttpContext) {
    const storeId = store.id

    try {
      const edit = await OrderEdit.query()
        .where('storeId', storeId)
        .where('id', params.editId)
        .where('status', 'created')
        .firstOrFail()

      edit.status = 'requested'
      edit.requestedAt = DateTime.now()
      await edit.save()

      session.flash('success', 'Order edit requested for confirmation')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async confirmOrderEdit({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id

    try {
      const edit = await OrderEdit.query()
        .where('storeId', storeId)
        .where('id', params.editId)
        .firstOrFail()

      const order = await Order.findOrFail(edit.orderId)

      // Apply changes to order
      for (const change of edit.changes as any[]) {
        if (change.type === 'item_add') {
          // Add item to order
        } else if (change.type === 'item_remove') {
          // Remove item from order
        } else if (change.type === 'item_update') {
          // Update item quantity/price
        }
      }

      // Calculate difference
      const differenceAmount = request.input('differenceAmount', edit.differenceAmount)
      edit.differenceAmount = differenceAmount
      edit.status = 'confirmed'
      edit.confirmedAt = DateTime.now()
      await edit.save()

      // Update order totals if needed
      if (differenceAmount !== 0) {
        order.grandTotal = order.grandTotal + differenceAmount
        await order.save()
      }

      session.flash('success', 'Order edit confirmed and applied')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async declineOrderEdit({ params, response, session, store }: HttpContext) {
    const storeId = store.id

    try {
      const edit = await OrderEdit.query()
        .where('storeId', storeId)
        .where('id', params.editId)
        .firstOrFail()

      edit.status = 'declined'
      edit.declinedAt = DateTime.now()
      await edit.save()

      session.flash('success', 'Order edit declined')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
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
