import type { HttpContext } from '@adonisjs/core/http'
import { useSubscriptionService } from '#services/service_container'

export default class SubscriptionsController {
  protected subscriptionService = useSubscriptionService()

  /**
   * Create subscription
   * POST /api/subscriptions
   */
  async create({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'customerId',
        'productId',
        'orderId',
        'billingInterval',
        'amount',
        'currencyCode',
        'trialPeriodDays',
        'providerSubscriptionId',
        'providerCustomerId',
        'providerPlanId',
      ])

      const subscription = await this.subscriptionService.createSubscription(data)

      return response.status(201).json({
        data: subscription,
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Get subscription by ID
   * GET /api/subscriptions/:id
   */
  async show({ params, response }: HttpContext) {
    try {
      const subscription = await Subscription.findOrFail(params.id)

      await subscription.load('product')
      await subscription.load('customer')
      await subscription.load('items')

      return response.json({
        data: subscription,
      })
    } catch (error) {
      return response.status(404).json({
        error: 'Subscription not found',
      })
    }
  }

  /**
   * Update subscription
   * PATCH /api/subscriptions/:id
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const data = request.only(['status', 'billingInterval', 'amount', 'metadata'])

      const subscription = await this.subscriptionService.updateSubscription(params.id, data)

      return response.json({
        data: subscription,
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Pause subscription
   * POST /api/subscriptions/:id/pause
   */
  async pause({ params, response }: HttpContext) {
    try {
      const subscription = await this.subscriptionService.pauseSubscription(params.id)

      return response.json({
        data: subscription,
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Resume subscription
   * POST /api/subscriptions/:id/resume
   */
  async resume({ params, response }: HttpContext) {
    try {
      const subscription = await this.subscriptionService.resumeSubscription(params.id)

      return response.json({
        data: subscription,
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Cancel subscription
   * POST /api/subscriptions/:id/cancel
   */
  async cancel({ params, response }: HttpContext) {
    try {
      const subscription = await this.subscriptionService.cancelSubscription(params.id)

      return response.json({
        data: subscription,
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Get customer subscriptions
   * GET /api/subscriptions/customer/:customerId
   */
  async getCustomerSubscriptions({ params, response }: HttpContext) {
    try {
      const subscriptions = await this.subscriptionService.getCustomerSubscriptions(params.customerId)

      return response.json({
        data: subscriptions,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }

  /**
   * Add subscription item
   * POST /api/subscriptions/:id/items
   */
  async addItem({ params, request, response }: HttpContext) {
    try {
      const { productId, amount, quantity, description } = request.only([
        'productId',
        'amount',
        'quantity',
        'description',
      ])

      const item = await this.subscriptionService.addSubscriptionItem(
        params.id,
        productId,
        Number(amount),
        quantity ? Number(quantity) : 1,
        description
      )

      return response.status(201).json({
        data: item,
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Update subscription item
   * PATCH /api/subscriptions/items/:itemId
   */
  async updateItem({ params, request, response }: HttpContext) {
    try {
      const data = request.only(['amount', 'quantity', 'description'])

      const item = await this.subscriptionService.updateSubscriptionItem(params.itemId, data)

      return response.json({
        data: item,
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Remove subscription item
   * DELETE /api/subscriptions/items/:itemId
   */
  async removeItem({ params, response }: HttpContext) {
    try {
      await this.subscriptionService.removeSubscriptionItem(params.itemId)

      return response.status(204)
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Handle Stripe webhook
   * POST /api/subscriptions/webhook/stripe
   */
  async stripeWebhook({ request, response }: HttpContext) {
    try {
      const event = request.only(['type', 'data'])

      // Handle different webhook events
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscriptionData = event.data.object
          await this.subscriptionService.updateFromProviderWebhook({
            providerSubscriptionId: subscriptionData.id,
            status: subscriptionData.status,
            currentPeriodStartsAt: new Date(subscriptionData.current_period_start * 1000),
            currentPeriodEndsAt: new Date(subscriptionData.current_period_end * 1000),
            cancelAtPeriodEnd: subscriptionData.cancel_at_period_end,
          })
          break

        case 'invoice.payment_succeeded':
          await this.subscriptionService.handlePaymentSucceeded(
            event.data.object.subscription
          )
          break

        case 'invoice.payment_failed':
          await this.subscriptionService.handlePaymentFailed(
            event.data.object.subscription
          )
          break
      }

      return response.json({ received: true })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Process renewal (called by cron job)
   * POST /api/subscriptions/:id/renew
   */
  async renew({ params, response }: HttpContext) {
    try {
      const subscription = await this.subscriptionService.processRenewal(params.id)

      return response.json({
        data: subscription,
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }
}
