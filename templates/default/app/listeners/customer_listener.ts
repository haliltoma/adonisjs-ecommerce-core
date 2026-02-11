import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import {
  CustomerRegistered,
  CustomerVerified,
  CustomerPasswordResetRequested,
  CustomerLoggedIn,
  CustomerDeactivated,
} from '#events/customer_events'
import { QueueProvider } from '#contracts/queue_provider'
import AnalyticsEvent from '#models/analytics_event'
import DailyAnalytics from '#models/daily_analytics'
import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'

export default class CustomerListener {
  async handleRegistered(event: CustomerRegistered) {
    const { customer } = event

    // Track analytics event
    await AnalyticsEvent.create({
      id: randomUUID(),
      storeId: customer.storeId,
      sessionId: null,
      customerId: customer.id,
      eventType: 'customer_registered',
      eventData: {
        email: customer.email,
        acceptsMarketing: customer.acceptsMarketing,
      },
    }).catch(() => {})

    // Update daily analytics
    await this.incrementNewCustomers(customer.storeId)

    // Send welcome email via queue
    try {
      const queue = await app.container.make(QueueProvider)
      await queue.dispatch({
        name: 'send-email',
        queue: 'emails',
        data: {
          to: customer.email,
          subject: 'Welcome to our store!',
          template: 'customer-welcome',
          data: {
            customerName: customer.firstName || customer.email,
            loginUrl: `${process.env.APP_URL || ''}/account/login`,
          },
        },
      })
    } catch (err) {
      logger.error(`[CustomerListener] Failed to queue welcome email: ${(err as Error).message}`)
    }

    logger.info(`[CustomerListener] New customer registered: ${customer.email}`)
  }

  async handleVerified(event: CustomerVerified) {
    const { customer } = event

    // Send verification success email
    try {
      const queue = await app.container.make(QueueProvider)
      await queue.dispatch({
        name: 'send-email',
        queue: 'emails',
        data: {
          to: customer.email,
          subject: 'Email Verified Successfully',
          template: 'customer-verified',
          data: {
            customerName: customer.firstName || customer.email,
          },
        },
      })
    } catch (err) {
      logger.error(`[CustomerListener] Failed to queue verification email: ${(err as Error).message}`)
    }

    logger.info(`[CustomerListener] Customer verified: ${customer.email}`)
  }

  async handlePasswordResetRequested(event: CustomerPasswordResetRequested) {
    const { customer, resetToken } = event

    // Send password reset email
    try {
      const queue = await app.container.make(QueueProvider)
      await queue.dispatch({
        name: 'send-email',
        queue: 'emails',
        data: {
          to: customer.email,
          subject: 'Reset Your Password',
          template: 'customer-password-reset',
          data: {
            customerName: customer.firstName || customer.email,
            resetUrl: `${process.env.APP_URL || ''}/account/reset-password?token=${resetToken}`,
            expiresIn: '1 hour',
          },
        },
      })
    } catch (err) {
      logger.error(`[CustomerListener] Failed to queue reset email: ${(err as Error).message}`)
    }

    logger.info(`[CustomerListener] Password reset requested: ${customer.email}`)
  }

  async handleLoggedIn(event: CustomerLoggedIn) {
    const { customer, ipAddress } = event

    // Track login analytics
    await AnalyticsEvent.create({
      id: randomUUID(),
      storeId: customer.storeId,
      sessionId: null,
      customerId: customer.id,
      eventType: 'customer_login',
      eventData: { ipAddress },
    }).catch(() => {})

    // Update returning customers count
    await this.incrementReturningCustomers(customer.storeId)

    logger.info(`[CustomerListener] Customer logged in: ${customer.email} from ${ipAddress}`)
  }

  async handleDeactivated(event: CustomerDeactivated) {
    const { customer, reason } = event

    // Send account deactivation notification
    try {
      const queue = await app.container.make(QueueProvider)
      await queue.dispatch({
        name: 'send-email',
        queue: 'emails',
        data: {
          to: customer.email,
          subject: 'Account Deactivated',
          template: 'customer-deactivated',
          data: {
            customerName: customer.firstName || customer.email,
            reason: reason || 'Your account has been deactivated.',
            supportEmail: process.env.STORE_EMAIL || 'support@example.com',
          },
        },
      })
    } catch (err) {
      logger.error(`[CustomerListener] Failed to queue deactivation email: ${(err as Error).message}`)
    }

    logger.info(
      `[CustomerListener] Customer deactivated: ${customer.email} - ${reason || 'No reason'}`
    )
  }

  private async incrementNewCustomers(storeId: string) {
    const today = DateTime.now().toFormat('yyyy-MM-dd')

    let daily = await DailyAnalytics.query()
      .where('storeId', storeId)
      .where('date', today)
      .first()

    if (!daily) {
      daily = await DailyAnalytics.create({
        id: randomUUID(),
        storeId,
        date: DateTime.fromFormat(today, 'yyyy-MM-dd'),
        pageViews: 0,
        uniqueVisitors: 0,
        totalOrders: 0,
        totalRevenue: 0,
        averageOrderValue: 0,
        conversionRate: 0,
        cartAbandonment: 0,
        newCustomers: 0,
        returningCustomers: 0,
      })
    }

    daily.newCustomers += 1
    await daily.save()
  }

  private async incrementReturningCustomers(storeId: string) {
    const today = DateTime.now().toFormat('yyyy-MM-dd')

    const daily = await DailyAnalytics.query()
      .where('storeId', storeId)
      .where('date', today)
      .first()

    if (daily) {
      daily.returningCustomers += 1
      await daily.save()
    }
  }
}
