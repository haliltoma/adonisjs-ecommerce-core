import type { HttpContext } from '@adonisjs/core/http'
import Cart from '#models/cart'
import Order from '#models/order'
import { DateTime } from 'luxon'

export default class MarketingController {
  async index({ inertia, store }: HttpContext) {
    const storeId = store.id
    const now = DateTime.now()
    const thirtyDaysAgo = now.minus({ days: 30 })

    const abandonedCartsCount = await Cart.query()
      .where('storeId', storeId)
      .whereNull('completedAt')
      .where('updatedAt', '<=', now.minus({ hours: 1 }).toSQL()!)
      .where('totalItems', '>', 0)
      .count('* as total')

    const recoveredCount = await Order.query()
      .where('storeId', storeId)
      .where('createdAt', '>=', thirtyDaysAgo.toSQL()!)
      .whereNotNull('metadata')
      .count('* as total')

    return inertia.render('admin/marketing/Index', {
      stats: {
        abandonedCarts: Number(abandonedCartsCount[0]?.$extras.total || 0),
        recoveredCarts: Number(recoveredCount[0]?.$extras.total || 0),
        emailCampaigns: 0,
        conversionRate: 0,
      },
    })
  }

  async abandonedCarts({ inertia, request, store }: HttpContext) {
    const { page = 1, search } = request.qs()
    const storeId = store.id

    const query = Cart.query()
      .where('storeId', storeId)
      .whereNull('completedAt')
      .where('updatedAt', '<=', DateTime.now().minus({ hours: 1 }).toSQL()!)
      .where('totalItems', '>', 0)
      .preload('customer')
      .orderBy('updatedAt', 'desc')

    if (search) {
      query.whereHas('customer', (cq) => {
        cq.whereILike('email', `%${search}%`)
          .orWhereILike('firstName', `%${search}%`)
          .orWhereILike('lastName', `%${search}%`)
      })
    }

    const carts = await query.paginate(page, 20)

    return inertia.render('admin/marketing/AbandonedCarts', {
      carts: {
        data: carts.all().map((c) => ({
          id: c.id,
          customerEmail: c.customer?.email || 'Guest',
          customerName: c.customer ? `${c.customer.firstName} ${c.customer.lastName}` : 'Guest',
          totalItems: c.totalItems,
          grandTotal: c.grandTotal,
          currencyCode: c.currencyCode,
          updatedAt: c.updatedAt.toISO(),
        })),
        meta: {
          total: carts.total,
          perPage: carts.perPage,
          currentPage: carts.currentPage,
          lastPage: carts.lastPage,
        },
      },
      filters: { search: search || '' },
    })
  }

  async emailCampaigns({ inertia }: HttpContext) {
    return inertia.render('admin/marketing/EmailCampaigns', {
      campaigns: {
        data: [],
        meta: { total: 0, perPage: 20, currentPage: 1, lastPage: 1 },
      },
    })
  }
}
