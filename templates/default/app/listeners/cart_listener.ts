import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import {
  CartItemAdded,
  CartItemRemoved,
  CartAbandoned,
  CartConverted,
  CartCouponApplied,
} from '#events/cart_events'
import { QueueProvider } from '#contracts/queue_provider'
import AnalyticsEvent from '#models/analytics_event'
import DailyAnalytics from '#models/daily_analytics'
import { randomUUID } from 'node:crypto'
import { DateTime } from 'luxon'

export default class CartListener {
  async handleItemAdded(event: CartItemAdded) {
    const { cart, item } = event

    await AnalyticsEvent.create({
      id: randomUUID(),
      storeId: cart.storeId,
      sessionId: cart.sessionId,
      customerId: cart.customerId,
      eventType: 'add_to_cart',
      eventData: {
        cartId: cart.id,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.unitPrice,
      },
    }).catch(() => {})

    logger.info(`[CartListener] Item added to cart ${cart.id}: ${item.title} x${item.quantity}`)
  }

  async handleItemRemoved(event: CartItemRemoved) {
    const { cart, item } = event

    await AnalyticsEvent.create({
      id: randomUUID(),
      storeId: cart.storeId,
      sessionId: cart.sessionId,
      customerId: cart.customerId,
      eventType: 'remove_from_cart',
      eventData: {
        cartId: cart.id,
        productId: item.productId,
        variantId: item.variantId,
      },
    }).catch(() => {})

    logger.info(`[CartListener] Item removed from cart ${cart.id}: ${item.title}`)
  }

  async handleCouponApplied(event: CartCouponApplied) {
    const { cart, couponCode } = event

    // Track coupon usage analytics
    await AnalyticsEvent.create({
      id: randomUUID(),
      storeId: cart.storeId,
      sessionId: cart.sessionId,
      customerId: cart.customerId,
      eventType: 'coupon_applied',
      eventData: {
        cartId: cart.id,
        couponCode,
        cartTotal: cart.grandTotal,
      },
    }).catch(() => {})

    logger.info(`[CartListener] Coupon applied to cart ${cart.id}: ${couponCode}`)
  }

  async handleAbandoned(event: CartAbandoned) {
    const { cart } = event

    await AnalyticsEvent.create({
      id: randomUUID(),
      storeId: cart.storeId,
      sessionId: cart.sessionId,
      customerId: cart.customerId,
      eventType: 'cart_abandoned',
      eventData: {
        cartId: cart.id,
        total: cart.grandTotal,
        itemCount: cart.totalItems,
      },
    }).catch(() => {})

    // Update daily analytics — cart abandonment
    await this.incrementCartAbandonment(cart.storeId)

    // Queue abandoned cart recovery email (30 min delay)
    if (cart.customerId && cart.email) {
      try {
        const queue = await app.container.make(QueueProvider)
        await queue.dispatchLater(
          {
            name: 'send-email',
            queue: 'emails',
            data: {
              to: cart.email,
              subject: 'You left something in your cart!',
              template: 'cart-abandoned',
              data: {
                customerName: 'there',
                cartUrl: `${process.env.APP_URL || ''}/cart`,
                itemCount: cart.totalItems,
                total: cart.grandTotal,
              },
            },
          },
          30 * 60 * 1000 // 30 minutes delay
        )
      } catch (err) {
        logger.error(`[CartListener] Failed to queue abandoned email: ${(err as Error).message}`)
      }
    }

    logger.info(`[CartListener] Cart abandoned: ${cart.id}`)
  }

  async handleConverted(event: CartConverted) {
    const { cart, orderId } = event

    // Track conversion analytics
    await AnalyticsEvent.create({
      id: randomUUID(),
      storeId: cart.storeId,
      sessionId: cart.sessionId,
      customerId: cart.customerId,
      eventType: 'cart_converted',
      eventData: {
        cartId: cart.id,
        orderId,
        total: cart.grandTotal,
        itemCount: cart.totalItems,
      },
    }).catch(() => {})

    logger.info(`[CartListener] Cart ${cart.id} converted to order ${orderId}`)
  }

  private async incrementCartAbandonment(storeId: string) {
    const today = DateTime.now().toFormat('yyyy-MM-dd')

    const daily = await DailyAnalytics.query()
      .where('storeId', storeId)
      .where('date', today)
      .first()

    if (daily) {
      daily.cartAbandonment += 1
      await daily.save()
    }
  }
}
