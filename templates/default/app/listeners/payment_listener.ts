import logger from '@adonisjs/core/services/logger'
import {
  PaymentAuthorized,
  PaymentCaptured,
  PaymentFailed,
  PaymentRefunded,
  PaymentVoided,
} from '#events/payment_events'
import OrderStatusHistory from '#models/order_status_history'
import { randomUUID } from 'node:crypto'

export default class PaymentListener {
  async handleAuthorized(event: PaymentAuthorized) {
    const { order, transaction } = event

    await OrderStatusHistory.create({
      id: randomUUID(),
      orderId: order.id,
      status: 'authorized',
      type: 'payment',
      title: 'Payment authorized',
      description: `Payment of ${transaction.amount} ${transaction.currencyCode} authorized via ${transaction.paymentMethod}`,
      metadata: { transactionId: transaction.id },
    }).catch(() => {})

    logger.info(
      `[PaymentListener] Payment authorized for order ${order.orderNumber}: ${transaction.amount} ${transaction.currencyCode}`
    )
  }

  async handleCaptured(event: PaymentCaptured) {
    const { order, transaction } = event

    await OrderStatusHistory.create({
      id: randomUUID(),
      orderId: order.id,
      status: 'captured',
      type: 'payment',
      title: 'Payment captured',
      description: `Payment of ${transaction.amount} ${transaction.currencyCode} captured`,
      metadata: { transactionId: transaction.id },
    }).catch(() => {})

    logger.info(
      `[PaymentListener] Payment captured for order ${order.orderNumber}: ${transaction.amount} ${transaction.currencyCode}`
    )
  }

  async handleFailed(event: PaymentFailed) {
    const { order, errorMessage } = event

    await OrderStatusHistory.create({
      id: randomUUID(),
      orderId: order.id,
      status: 'failed',
      type: 'payment',
      title: 'Payment failed',
      description: errorMessage,
      metadata: {},
    }).catch(() => {})

    logger.error(`[PaymentListener] Payment failed for order ${order.orderNumber}: ${errorMessage}`)
  }

  async handleRefunded(event: PaymentRefunded) {
    const { order, transaction, amount } = event

    await OrderStatusHistory.create({
      id: randomUUID(),
      orderId: order.id,
      status: 'refunded',
      type: 'refund',
      title: 'Payment refunded',
      description: `Refund of ${amount} ${transaction.currencyCode} processed`,
      metadata: { transactionId: transaction.id, amount },
    }).catch(() => {})

    logger.info(
      `[PaymentListener] Refund of ${amount} processed for order ${order.orderNumber}`
    )
  }

  async handleVoided(event: PaymentVoided) {
    const { order, transaction } = event

    await OrderStatusHistory.create({
      id: randomUUID(),
      orderId: order.id,
      status: 'voided',
      type: 'payment',
      title: 'Payment voided',
      description: `Payment authorization voided`,
      metadata: { transactionId: transaction.id },
    }).catch(() => {})

    logger.info(`[PaymentListener] Payment voided for order ${order.orderNumber}`)
  }
}
