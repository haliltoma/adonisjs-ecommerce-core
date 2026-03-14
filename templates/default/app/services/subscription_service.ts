import { DateTime } from 'luxon'
import Subscription from '#models/subscription'
import SubscriptionItem from '#models/subscription_item'
import Product from '#models/product'
import Customer from '#models/customer'
import Order from '#models/order'
import Application from '@adonisjs/core/app'

interface CreateSubscriptionDTO {
  customerId: string
  productId: string
  orderId?: string
  billingInterval: 'daily' | 'weekly' | 'monthly' | 'yearly'
  amount: number
  currencyCode?: string
  trialPeriodDays?: number
  providerSubscriptionId?: string
  providerCustomerId?: string
  providerPlanId?: string
  startsAt?: DateTime
}

interface UpdateSubscriptionDTO {
  status?: 'active' | 'paused' | 'cancelled' | 'expired'
  billingInterval?: 'daily' | 'weekly' | 'monthly' | 'yearly'
  amount?: number
  metadata?: Record<string, any>
}

interface ProrationDTO {
  subscriptionId: string
  newPlanId: string
  newAmount: number
  prorationDate: DateTime
}

export default class SubscriptionService {
  constructor(protected app: Application) {}

  /**
   * Create new subscription
   */
  async createSubscription(data: CreateSubscriptionDTO): Promise<Subscription> {
    const now = DateTime.now()
    const startsAt = data.startsAt || now
    const trialEndsAt = data.trialPeriodDays
      ? now.plus({ days: data.trialPeriodDays })
      : null

    // Calculate period dates
    const currentPeriodStartsAt = trialEndsAt || startsAt
    const currentPeriodEndsAt = this.calculatePeriodEnd(currentPeriodStartsAt, data.billingInterval)

    const subscription = await Subscription.create({
      customerId: data.customerId,
      productId: data.productId,
      orderId: data.orderId,
      status: trialEndsAt ? 'trialing' : 'active',
      billingInterval: data.billingInterval,
      intervalCount: 1,
      amount: data.amount,
      currencyCode: data.currencyCode || 'USD',
      trialPeriodDays: data.trialPeriodDays,
      trialEndsAt,
      startsAt,
      currentPeriodStartsAt,
      currentPeriodEndsAt,
      providerSubscriptionId: data.providerSubscriptionId,
      providerCustomerId: data.providerCustomerId,
      providerPlanId: data.providerPlanId,
      metadata: {},
    })

    return subscription
  }

  /**
   * Calculate period end date based on interval
   */
  private calculatePeriodEnd(startDate: DateTime, interval: string): DateTime {
    switch (interval) {
      case 'daily':
        return startDate.plus({ days: 1 })
      case 'weekly':
        return startDate.plus({ weeks: 1 })
      case 'monthly':
        return startDate.plus({ months: 1 })
      case 'yearly':
        return startDate.plus({ years: 1 })
      default:
        return startDate.plus({ months: 1 })
    }
  }

  /**
   * Update subscription
   */
  async updateSubscription(subscriptionId: string, data: UpdateSubscriptionDTO): Promise<Subscription> {
    const subscription = await Subscription.findOrFail(subscriptionId)

    if (data.status) {
      subscription.status = data.status
      if (data.status === 'cancelled') {
        subscription.cancelledAt = DateTime.now()
      }
    }

    if (data.billingInterval) {
      subscription.billingInterval = data.billingInterval
    }

    if (data.amount) {
      subscription.amount = data.amount
    }

    if (data.metadata) {
      subscription.metadata = { ...subscription.metadata, ...data.metadata }
    }

    await subscription.save()
    return subscription
  }

  /**
   * Pause subscription
   */
  async pauseSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await Subscription.findOrFail(subscriptionId)

    if (!subscription.canBePaused()) {
      throw new Error('Subscription cannot be paused')
    }

    await subscription.pause()
    return subscription
  }

  /**
   * Resume subscription
   */
  async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await Subscription.findOrFail(subscriptionId)
    await subscription.resume()
    return subscription
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await Subscription.findOrFail(subscriptionId)

    if (!subscription.canBeCancelled()) {
      throw new Error('Subscription cannot be cancelled')
    }

    await subscription.cancel()
    return subscription
  }

  /**
   * Expire subscription
   */
  async expireSubscription(subscriptionId: string): Promise<Subscription> {
    const subscription = await Subscription.findOrFail(subscriptionId)
    await subscription.expire()
    return subscription
  }

  /**
   * Process subscription renewal
   */
  async processRenewal(subscriptionId: string): Promise<Subscription> {
    const subscription = await Subscription.findOrFail(subscriptionId)

    // Update period dates
    subscription.currentPeriodStartsAt = subscription.currentPeriodEndsAt || DateTime.now()
    subscription.currentPeriodEndsAt = this.calculatePeriodEnd(
      subscription.currentPeriodStartsAt,
      subscription.billingInterval
    )

    // Check if trial is ending
    if (subscription.status === 'trialing' && subscription.trialEndsAt) {
      if (DateTime.now() >= subscription.trialEndsAt) {
        subscription.status = 'active'
      }
    }

    await subscription.save()
    return subscription
  }

  /**
   * Add subscription item
   */
  async addSubscriptionItem(
    subscriptionId: string,
    productId: string,
    amount: number,
    quantity: number = 1,
    description?: string
  ): Promise<SubscriptionItem> {
    const subscriptionItem = await SubscriptionItem.create({
      subscriptionId,
      productId,
      amount,
      quantity,
      description,
      metadata: {},
    })

    return subscriptionItem
  }

  /**
   * Update subscription item
   */
  async updateSubscriptionItem(
    itemId: string,
    data: { amount?: number; quantity?: number; description?: string }
  ): Promise<SubscriptionItem> {
    const item = await SubscriptionItem.findOrFail(itemId)

    if (data.amount !== undefined) {
      item.amount = data.amount
    }

    if (data.quantity !== undefined) {
      item.quantity = data.quantity
    }

    if (data.description !== undefined) {
      item.description = data.description
    }

    await item.save()
    return item
  }

  /**
   * Remove subscription item
   */
  async removeSubscriptionItem(itemId: string): Promise<void> {
    const item = await SubscriptionItem.findOrFail(itemId)
    await item.delete()
  }

  /**
   * Get subscription by customer
   */
  async getCustomerSubscriptions(customerId: string): Promise<Subscription[]> {
    return await Subscription.query()
      .where('customerId', customerId)
      .whereNot('status', 'cancelled')
      .preload('product')
      .preload('items', (itemsQuery) => {
        itemsQuery.preload('product')
      })
      .orderBy('createdAt', 'desc')
  }

  /**
   * Get active subscriptions
   */
  async getActiveSubscriptions(): Promise<Subscription[]> {
    return await Subscription.query()
      .where('status', 'active')
      .orWhere('status', 'trialing')
      .preload('customer')
      .preload('product')
  }

  /**
   * Get subscriptions due for renewal
   */
  async getSubscriptionsDueForRenewal(): Promise<Subscription[]> {
    const now = DateTime.now()

    return await Subscription.query()
      .where('currentPeriodEndsAt', '<=', now.toSQL())
      .whereIn('status', ['active', 'trialing'])
      .whereNull('cancelledAt')
  }

  /**
   * Calculate proration for plan change
   */
  async calculateProration(data: ProrationDTO): Promise<number> {
    const subscription = await Subscription.findOrFail(data.subscriptionId)

    const currentPeriodStart = subscription.currentPeriodStartsAt || DateTime.now()
    const currentPeriodEnd = subscription.currentPeriodEndsAt || DateTime.now()

    const totalPeriodDays = currentPeriodEnd.diff(currentPeriodStart, 'days').days
    const daysUsed = data.prorationDate.diff(currentPeriodStart, 'days').days
    const daysRemaining = totalPeriodDays - daysUsed

    // Calculate unused amount
    const dailyRate = subscription.amount / totalPeriodDays
    const unusedAmount = dailyRate * daysRemaining

    // Calculate prorated new plan cost
    const newDailyRate = data.newAmount / totalPeriodDays
    const proratedNewAmount = newDailyRate * daysRemaining

    // Return proration difference (positive = charge extra, negative = credit)
    return proratedNewAmount - unusedAmount
  }

  /**
   * Handle subscription payment failed
   */
  async handlePaymentFailed(subscriptionId: string): Promise<void> {
    const subscription = await Subscription.findOrFail(subscriptionId)
    subscription.status = 'past_due'
    await subscription.save()
  }

  /**
   * Handle subscription payment succeeded
   */
  async handlePaymentSucceeded(subscriptionId: string): Promise<void> {
    const subscription = await Subscription.findOrFail(subscriptionId)

    if (subscription.status === 'past_due') {
      subscription.status = 'active'
      await subscription.save()
    }
  }

  /**
   * Get subscription by provider ID
   */
  async getByProviderId(providerSubscriptionId: string): Promise<Subscription | null> {
    return await Subscription.query()
      .where('providerSubscriptionId', providerSubscriptionId)
      .first()
  }

  /**
   * Update subscription from provider webhook
   */
  async updateFromProviderWebhook(data: {
    providerSubscriptionId: string
    status?: string
    currentPeriodStartsAt?: DateTime
    currentPeriodEndsAt?: DateTime
    cancelAtPeriodEnd?: boolean
  }): Promise<Subscription> {
    const subscription = await Subscription.query()
      .where('providerSubscriptionId', data.providerSubscriptionId)
      .firstOrFail()

    if (data.status) {
      subscription.status = data.status as any
    }

    if (data.currentPeriodStartsAt) {
      subscription.currentPeriodStartsAt = data.currentPeriodStartsAt
    }

    if (data.currentPeriodEndsAt) {
      subscription.currentPeriodEndsAt = data.currentPeriodEndsAt
    }

    if (data.cancelAtPeriodEnd) {
      subscription.metadata = {
        ...subscription.metadata,
        cancelAtPeriodEnd: true,
      }
    }

    await subscription.save()
    return subscription
  }
}
