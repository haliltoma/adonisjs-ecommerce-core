import type { HttpContext } from '@adonisjs/core/http'
import Cart from '#models/cart'
import EmailCampaign from '#models/email_campaign'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

export default class MarketingController {
  async index({ inertia, store }: HttpContext) {
    const storeId = store.id
    const now = DateTime.now()

    const abandonedCartsResult = await Cart.query()
      .where('storeId', storeId)
      .whereNull('completedAt')
      .where('updatedAt', '<=', now.minus({ hours: 1 }).toSQL()!)
      .where('totalItems', '>', 0)
      .count('* as total')
      .sum('grand_total as revenue')

    const abandonedCarts = Number(abandonedCartsResult[0]?.$extras.total || 0)
    const abandonedRevenue = Number(abandonedCartsResult[0]?.$extras.revenue || 0)

    const emailSubscribersResult = await Cart.query()
      .where('storeId', storeId)
      .whereNotNull('email')
      .countDistinct('email as total')

    const emailSubscribers = Number(emailSubscribersResult[0]?.$extras.total || 0)

    // Calculate real conversion rate: completed carts / total carts with items
    const totalCartsResult = await Cart.query()
      .where('storeId', storeId)
      .where('totalItems', '>', 0)
      .count('* as total')

    const completedCartsResult = await Cart.query()
      .where('storeId', storeId)
      .where('totalItems', '>', 0)
      .whereNotNull('completedAt')
      .count('* as total')

    const totalCarts = Number(totalCartsResult[0]?.$extras.total || 0)
    const completedCarts = Number(completedCartsResult[0]?.$extras.total || 0)
    const conversionRate = totalCarts > 0
      ? Math.round((completedCarts / totalCarts) * 10000) / 100
      : 0

    return inertia.render('admin/marketing/Index', {
      stats: {
        abandonedCarts,
        abandonedRevenue,
        emailSubscribers,
        conversionRate,
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
      query.where((builder) => {
        builder
          .whereILike('email', `%${search}%`)
          .orWhereHas('customer', (cq) => {
            cq.whereILike('email', `%${search}%`)
              .orWhereILike('firstName', `%${search}%`)
              .orWhereILike('lastName', `%${search}%`)
          })
      })
    }

    const carts = await query.paginate(page, 20)

    return inertia.render('admin/marketing/AbandonedCarts', {
      carts: {
        data: carts.all().map((c) => ({
          id: c.id,
          customerEmail: c.customer?.email || c.email || 'Guest',
          customerName: c.customer
            ? `${c.customer.firstName} ${c.customer.lastName}`.trim()
            : null,
          itemCount: c.totalItems,
          total: Number(c.grandTotal || 0),
          lastActivityAt: c.updatedAt.toISO(),
          recoveryEmailSent: !!c.metadata?.recoveryEmailSent,
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

  async sendRecoveryEmail({ params, response, session, store }: HttpContext) {
    const cart = await Cart.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .whereNull('completedAt')
      .preload('customer')
      .firstOrFail()

    const email = cart.customer?.email || cart.email
    if (!email) {
      session.flash('error', 'No email address associated with this cart')
      return response.redirect().back()
    }

    // Mark the cart as having a recovery email sent via metadata
    const metadata = (cart.metadata || {}) as Record<string, unknown>
    metadata.recoveryEmailSent = true
    metadata.recoveryEmailSentAt = DateTime.now().toISO()
    cart.metadata = metadata
    await cart.save()

    // TODO: Integrate with actual email provider to send recovery email
    session.flash('success', `Recovery email marked for ${email}`)
    return response.redirect().back()
  }

  async destroyAbandonedCart({ params, response, session, store }: HttpContext) {
    const cart = await Cart.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .whereNull('completedAt')
      .firstOrFail()

    await cart.delete()

    session.flash('success', 'Abandoned cart deleted')
    return response.redirect().back()
  }

  async emailCampaigns({ inertia, request, store }: HttpContext) {
    const page = request.input('page', 1)

    const campaigns = await EmailCampaign.query()
      .where('storeId', store.id)
      .orderBy('createdAt', 'desc')
      .paginate(page, 20)

    return inertia.render('admin/marketing/EmailCampaigns', {
      campaigns: {
        data: campaigns.all().map((c) => ({
          id: c.id,
          name: c.name,
          subject: c.subject,
          status: c.status,
          recipientCount: c.recipientCount,
          openRate: c.openRate,
          clickRate: c.clickRate,
          scheduledAt: c.scheduledAt?.toISO() || null,
          sentAt: c.sentAt?.toISO() || null,
          createdAt: c.createdAt.toISO(),
        })),
        meta: {
          total: campaigns.total,
          perPage: campaigns.perPage,
          currentPage: campaigns.currentPage,
          lastPage: campaigns.lastPage,
        },
      },
    })
  }

  async storeEmailCampaign({ request, response, session, store }: HttpContext) {
    const data = request.only(['name', 'subject', 'body'])

    try {
      // Count unique email subscribers for this store
      const subscribersResult = await db
        .from('customers')
        .where('store_id', store.id)
        .whereNotNull('email')
        .countDistinct('email as total')

      const recipientCount = Number(subscribersResult[0]?.total || 0)

      await EmailCampaign.create({
        id: randomUUID(),
        storeId: store.id,
        name: data.name,
        subject: data.subject,
        body: data.body || '',
        status: 'draft',
        recipientCount,
      })

      session.flash('success', 'Campaign created')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async sendEmailCampaign({ params, response, session, store }: HttpContext) {
    const campaign = await EmailCampaign.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .firstOrFail()

    if (campaign.status !== 'draft') {
      session.flash('error', 'Only draft campaigns can be sent')
      return response.redirect().back()
    }

    // Mark as sent (actual email sending would be handled by a job/queue)
    campaign.status = 'sent'
    campaign.sentAt = DateTime.now()
    await campaign.save()

    // TODO: Integrate with actual email provider to send campaign
    session.flash('success', 'Campaign marked as sent')
    return response.redirect().back()
  }

  async destroyEmailCampaign({ params, response, session, store }: HttpContext) {
    const campaign = await EmailCampaign.query()
      .where('id', params.id)
      .where('storeId', store.id)
      .firstOrFail()

    await campaign.delete()

    session.flash('success', 'Campaign deleted')
    return response.redirect().back()
  }
}
