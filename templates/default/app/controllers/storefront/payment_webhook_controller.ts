import type { HttpContext } from '@adonisjs/core/http'
import { PaymentProvider } from '#contracts/payment_provider'
import OrderService from '#services/order_service'
import CustomerService from '#services/customer_service'
import emitter from '@adonisjs/core/services/emitter'
import {
  PaymentAuthorized,
  PaymentCaptured,
  PaymentFailed,
  PaymentRefunded,
  PaymentWebhookReceived,
} from '#events/payment_events'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'

/**
 * PaymentWebhookController
 *
 * Handles incoming webhook events from payment providers (Stripe, etc.).
 * This endpoint should be excluded from CSRF protection.
 */
export default class PaymentWebhookController {
  private orderService: OrderService

  constructor() {
    this.orderService = new OrderService()
  }

  /**
   * POST /webhooks/stripe
   *
   * Stripe sends webhook events for async payment confirmation.
   * The raw body is required for signature verification.
   */
  async stripe({ request, response }: HttpContext) {
    const paymentProvider = await app.container.make(PaymentProvider)
    const signature = request.header('stripe-signature') || ''
    const rawBody = request.raw() || ''

    let webhookEvent

    try {
      webhookEvent = await paymentProvider.verifyWebhook(rawBody, signature)
    } catch (error) {
      logger.warn({ error: error.message }, 'Stripe webhook signature verification failed')
      return response.status(400).json({ error: 'Invalid webhook signature' })
    }

    // Emit raw webhook event for audit/logging
    await emitter.emit('payment:webhook:received', new PaymentWebhookReceived(
      'stripe',
      webhookEvent.type,
      webhookEvent.data
    ))

    logger.info({ type: webhookEvent.type, transactionId: webhookEvent.transactionId }, 'Stripe webhook received')

    try {
      await this.handleStripeEvent(webhookEvent.type, webhookEvent.transactionId, webhookEvent.data)
    } catch (error) {
      logger.error({ error: error.message, type: webhookEvent.type }, 'Error processing Stripe webhook')
      // Still return 200 so Stripe doesn't retry
    }

    return response.status(200).json({ received: true })
  }

  /**
   * POST /webhooks/iyzico
   *
   * Iyzico posts the checkout form callback with a token.
   * We verify the token by retrieving payment details from Iyzico API.
   */
  async iyzico({ request, response }: HttpContext) {
    const paymentProvider = await app.container.make(PaymentProvider)
    const rawBody = request.raw() || JSON.stringify(request.all())

    let webhookEvent

    try {
      webhookEvent = await paymentProvider.verifyWebhook(rawBody, '')
    } catch (error) {
      logger.warn({ error: error.message }, 'Iyzico webhook verification failed')
      return response.status(400).json({ error: 'Invalid Iyzico callback' })
    }

    await emitter.emit('payment:webhook:received', new PaymentWebhookReceived(
      'iyzico',
      webhookEvent.type,
      webhookEvent.data
    ))

    logger.info({ type: webhookEvent.type, transactionId: webhookEvent.transactionId }, 'Iyzico webhook received')

    try {
      const data = webhookEvent.data
      const orderId = (data.basketId as string) || ''

      if (!orderId) {
        logger.warn({ token: webhookEvent.transactionId }, 'Iyzico callback missing basketId')
        return response.status(200).json({ received: true })
      }

      const order = await this.orderService.findById(orderId)
      if (!order) {
        logger.warn({ orderId }, 'Order not found for Iyzico callback')
        return response.status(200).json({ received: true })
      }

      if (order.paymentStatus === 'paid') {
        return response.status(200).json({ received: true })
      }

      if (webhookEvent.type === 'payment.success') {
        const paidAmount = Number.parseFloat(data.paidPrice as string || '0')

        const transaction = await this.orderService.addTransaction(order.id, {
          type: 'capture',
          amount: paidAmount || order.grandTotal,
          currencyCode: order.currencyCode,
          paymentMethod: 'iyzico',
          gatewayTransactionId: (data.paymentId as string) || webhookEvent.transactionId,
          status: 'success',
          gatewayResponse: data,
        })

        await this.orderService.updatePaymentStatus(order.id, 'paid')
        await this.orderService.updateStatus(order.id, 'confirmed', 'Payment received via Iyzico')

        if (order.customerId) {
          const customerService = new CustomerService()
          await customerService.incrementOrderStats(order.customerId, order.grandTotal)
        }

        const updatedOrder = await this.orderService.findById(order.id)
        if (updatedOrder) {
          await emitter.emit('payment:captured', new PaymentCaptured(updatedOrder, transaction))
        }
      } else {
        await this.orderService.addTransaction(order.id, {
          type: 'capture',
          amount: order.grandTotal,
          currencyCode: order.currencyCode,
          paymentMethod: 'iyzico',
          gatewayTransactionId: webhookEvent.transactionId,
          status: 'failed',
          gatewayResponse: data,
        })

        await this.orderService.updatePaymentStatus(order.id, 'failed')

        const updatedOrder = await this.orderService.findById(order.id)
        if (updatedOrder) {
          await emitter.emit('payment:failed', new PaymentFailed(
            updatedOrder,
            (data.errorMessage as string) || 'Payment failed',
            (data.errorCode as string) || 'iyzico_failed'
          ))
        }
      }
    } catch (error) {
      logger.error({ error: error.message }, 'Error processing Iyzico webhook')
    }

    // Iyzico expects a redirect to the confirmation page
    // Since this is the webhook (not the user redirect), return 200
    return response.status(200).json({ received: true })
  }

  private async handleStripeEvent(
    eventType: string,
    transactionId: string,
    data: Record<string, unknown>
  ) {
    switch (eventType) {
      case 'checkout.session.completed': {
        await this.handleCheckoutComplete(transactionId, data)
        break
      }

      case 'checkout.session.expired': {
        await this.handleCheckoutExpired(transactionId, data)
        break
      }

      case 'payment_intent.succeeded': {
        await this.handlePaymentSucceeded(transactionId, data)
        break
      }

      case 'payment_intent.payment_failed': {
        await this.handlePaymentFailed(transactionId, data)
        break
      }

      case 'charge.refunded': {
        await this.handleChargeRefunded(data)
        break
      }

      default:
        logger.debug({ eventType }, 'Unhandled Stripe webhook event type')
    }
  }

  /**
   * Checkout session completed — payment successful.
   */
  private async handleCheckoutComplete(sessionId: string, data: Record<string, unknown>) {
    const orderId = (data.client_reference_id || (data.metadata as any)?.orderId) as string
    if (!orderId) {
      logger.warn({ sessionId }, 'Checkout complete webhook missing orderId')
      return
    }

    const order = await this.orderService.findById(orderId)
    if (!order) {
      logger.warn({ orderId }, 'Order not found for checkout.session.completed')
      return
    }

    // Avoid double-processing
    if (order.paymentStatus === 'paid') {
      logger.info({ orderId }, 'Order already paid, skipping webhook')
      return
    }

    const paymentIntentId = (data.payment_intent as string) || sessionId
    const amountTotal = Number(data.amount_total || 0) / 100

    // Record transaction
    const transaction = await this.orderService.addTransaction(order.id, {
      type: 'capture',
      amount: amountTotal || order.grandTotal,
      currencyCode: order.currencyCode,
      paymentMethod: 'stripe',
      gatewayTransactionId: paymentIntentId,
      status: 'success',
      gatewayResponse: data,
    })

    // Update order status
    await this.orderService.updatePaymentStatus(order.id, 'paid')
    await this.orderService.updateStatus(order.id, 'confirmed', 'Payment received via Stripe')

    // Update customer stats
    if (order.customerId) {
      const customerService = new CustomerService()
      await customerService.incrementOrderStats(order.customerId, order.grandTotal)
    }

    // Emit payment captured event
    const updatedOrder = await this.orderService.findById(order.id)
    if (updatedOrder) {
      await emitter.emit('payment:captured', new PaymentCaptured(updatedOrder, transaction))
    }
  }

  /**
   * Checkout session expired — customer didn't complete payment.
   */
  private async handleCheckoutExpired(sessionId: string, data: Record<string, unknown>) {
    const orderId = (data.client_reference_id || (data.metadata as any)?.orderId) as string
    if (!orderId) return

    const order = await this.orderService.findById(orderId)
    if (!order || order.paymentStatus !== 'pending') return

    await this.orderService.updatePaymentStatus(order.id, 'failed')

    const updatedOrder = await this.orderService.findById(order.id)
    if (updatedOrder) {
      await emitter.emit('payment:failed', new PaymentFailed(
        updatedOrder,
        'Checkout session expired',
        'session_expired'
      ))
    }

    logger.info({ orderId, sessionId }, 'Checkout session expired')
  }

  /**
   * PaymentIntent succeeded (direct PI flow, not Checkout Session).
   */
  private async handlePaymentSucceeded(paymentIntentId: string, data: Record<string, unknown>) {
    const orderId = ((data.metadata as any)?.orderId) as string
    if (!orderId) return

    const order = await this.orderService.findById(orderId)
    if (!order || order.paymentStatus === 'paid') return

    const amount = Number(data.amount || 0) / 100

    const transaction = await this.orderService.addTransaction(order.id, {
      type: 'capture',
      amount: amount || order.grandTotal,
      currencyCode: order.currencyCode,
      paymentMethod: 'stripe',
      gatewayTransactionId: paymentIntentId,
      status: 'success',
      gatewayResponse: data,
    })

    await this.orderService.updatePaymentStatus(order.id, 'paid')
    await this.orderService.updateStatus(order.id, 'confirmed', 'Payment received via Stripe')

    if (order.customerId) {
      const customerService = new CustomerService()
      await customerService.incrementOrderStats(order.customerId, order.grandTotal)
    }

    const updatedOrder = await this.orderService.findById(order.id)
    if (updatedOrder) {
      await emitter.emit('payment:captured', new PaymentCaptured(updatedOrder, transaction))
    }
  }

  /**
   * PaymentIntent failed.
   */
  private async handlePaymentFailed(paymentIntentId: string, data: Record<string, unknown>) {
    const orderId = ((data.metadata as any)?.orderId) as string
    if (!orderId) return

    const order = await this.orderService.findById(orderId)
    if (!order) return

    await this.orderService.addTransaction(order.id, {
      type: 'capture',
      amount: order.grandTotal,
      currencyCode: order.currencyCode,
      paymentMethod: 'stripe',
      gatewayTransactionId: paymentIntentId,
      status: 'failed',
      gatewayResponse: data,
    })

    await this.orderService.updatePaymentStatus(order.id, 'failed')

    const updatedOrder = await this.orderService.findById(order.id)
    if (updatedOrder) {
      const lastError = (data.last_payment_error as any)
      await emitter.emit('payment:failed', new PaymentFailed(
        updatedOrder,
        lastError?.message || 'Payment failed',
        lastError?.code || 'payment_failed'
      ))
    }
  }

  /**
   * Charge refunded (full or partial).
   */
  private async handleChargeRefunded(data: Record<string, unknown>) {
    const paymentIntentId = data.payment_intent as string
    if (!paymentIntentId) return

    // Find the order by searching transactions with this gateway ID
    const OrderTransaction = (await import('#models/order_transaction')).default
    const txn = await OrderTransaction.query()
      .where('gatewayTransactionId', paymentIntentId)
      .first()

    if (!txn) {
      logger.warn({ paymentIntentId }, 'No transaction found for charge.refunded event')
      return
    }

    const order = await this.orderService.findById(txn.orderId)
    if (!order) return

    const amountRefunded = Number(data.amount_refunded || 0) / 100
    const amountTotal = Number(data.amount || 0) / 100
    const isFullRefund = amountRefunded >= amountTotal

    const refundTxn = await this.orderService.addTransaction(order.id, {
      type: 'refund',
      amount: amountRefunded,
      currencyCode: order.currencyCode,
      paymentMethod: 'stripe',
      gatewayTransactionId: paymentIntentId,
      status: 'success',
      gatewayResponse: data,
    })

    await this.orderService.updatePaymentStatus(
      order.id,
      isFullRefund ? 'refunded' : 'partially_refunded'
    )

    const updatedOrder = await this.orderService.findById(order.id)
    if (updatedOrder) {
      await emitter.emit('payment:refunded', new PaymentRefunded(
        updatedOrder,
        refundTxn,
        amountRefunded
      ))
    }
  }
}
