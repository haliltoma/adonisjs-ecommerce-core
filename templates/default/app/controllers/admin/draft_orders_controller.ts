import type { HttpContext } from '@adonisjs/core/http'
import DraftOrderService from '#services/draft_order_service'
import Customer from '#models/customer'
import Product from '#models/product'
import Region from '#models/region'

export default class DraftOrdersController {
  private draftOrderService: DraftOrderService

  constructor() {
    this.draftOrderService = new DraftOrderService()
  }

  async index({ inertia, request, store }: HttpContext) {
    const storeId = store.id
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')
    const search = request.input('search')

    const draftOrders = await this.draftOrderService.list({
      storeId,
      status,
      search,
      page,
      limit,
    })

    return inertia.render('admin/draft-orders/Index', {
      draftOrders: {
        data: draftOrders.all().map((d) => ({
          id: d.id,
          displayId: d.displayId,
          status: d.status,
          customer: d.customer
            ? { id: d.customer.id, name: d.customer.fullName, email: d.customer.email }
            : d.email
              ? { email: d.email }
              : null,
          itemCount: d.items?.length || 0,
          grandTotal: d.grandTotal,
          currencyCode: d.currencyCode,
          createdAt: d.createdAt.toISO(),
        })),
        meta: draftOrders.getMeta(),
      },
      filters: { status, search },
    })
  }

  async create({ inertia, store }: HttpContext) {
    const storeId = store.id
    const customers = await Customer.query().where('storeId', storeId).orderBy('firstName', 'asc')
    const products = await Product.query()
      .where('storeId', storeId)
      .where('status', 'active')
      .preload('variants')
      .orderBy('title', 'asc')
    const regions = await Region.query().where('storeId', storeId).where('isActive', true)

    return inertia.render('admin/draft-orders/Create', {
      customers: customers.map((c) => ({
        id: c.id,
        name: c.fullName,
        email: c.email,
      })),
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        variants: p.variants.map((v) => ({
          id: v.id,
          title: v.title,
          sku: v.sku,
          price: v.price,
        })),
      })),
      regions: regions.map((r) => ({
        id: r.id,
        name: r.name,
        currencyCode: r.currencyCode,
      })),
    })
  }

  async store({ request, response, session, store, admin }: HttpContext) {
    const storeId = store.id
    const data = request.only([
      'customerId',
      'email',
      'regionId',
      'currencyCode',
      'items',
      'shippingAddress',
      'billingAddress',
      'shippingMethod',
      'shippingTotal',
      'note',
    ])

    try {
      await this.draftOrderService.create({
        storeId,
        ...data,
        createdBy: admin?.id ? String(admin.id) : undefined,
      })
      session.flash('success', 'Draft order created')
      return response.redirect().toRoute('admin.draftOrders.index')
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async show({ params, inertia, store }: HttpContext) {
    const storeId = store.id

    try {
      const draftOrder = await this.draftOrderService.findById(storeId, params.id)

      return inertia.render('admin/draft-orders/Show', {
        draftOrder: {
          id: draftOrder.id,
          displayId: draftOrder.displayId,
          status: draftOrder.status,
          customer: draftOrder.customer
            ? { id: draftOrder.customer.id, name: draftOrder.customer.fullName, email: draftOrder.customer.email }
            : null,
          email: draftOrder.email,
          region: draftOrder.region
            ? { id: draftOrder.region.id, name: draftOrder.region.name }
            : null,
          currencyCode: draftOrder.currencyCode,
          items: draftOrder.items,
          shippingAddress: draftOrder.shippingAddress,
          billingAddress: draftOrder.billingAddress,
          shippingMethod: draftOrder.shippingMethod,
          shippingTotal: draftOrder.shippingTotal,
          discountTotal: draftOrder.discountTotal,
          taxTotal: draftOrder.taxTotal,
          subtotal: draftOrder.subtotal,
          grandTotal: draftOrder.grandTotal,
          note: draftOrder.note,
          orderId: draftOrder.orderId,
          createdAt: draftOrder.createdAt.toISO(),
          completedAt: draftOrder.completedAt?.toISO(),
        },
      })
    } catch {
      return inertia.render('admin/errors/NotFound', { resource: 'Draft Order' })
    }
  }

  async update({ params, request, response, session, store }: HttpContext) {
    const storeId = store.id
    const data = request.only([
      'customerId',
      'email',
      'items',
      'shippingAddress',
      'billingAddress',
      'shippingMethod',
      'shippingTotal',
      'discountTotal',
      'note',
    ])

    try {
      await this.draftOrderService.update(storeId, params.id, data)
      session.flash('success', 'Draft order updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async registerPayment({ params, response, session, store }: HttpContext) {
    const storeId = store.id

    try {
      const { order } = await this.draftOrderService.registerPayment(storeId, params.id)
      session.flash('success', `Payment registered. Order ${order.orderNumber} created.`)
      return response.redirect().toRoute('admin.orders.show', { id: order.id })
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session, store }: HttpContext) {
    const storeId = store.id

    try {
      await this.draftOrderService.delete(storeId, params.id)
      session.flash('success', 'Draft order deleted')
      return response.redirect().toRoute('admin.draftOrders.index')
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }
}
