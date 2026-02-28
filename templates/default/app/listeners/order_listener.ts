import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import {
  OrderCreated,
  OrderPaid,
  OrderShipped,
  OrderDelivered,
  OrderCancelled,
  OrderRefunded,
  OrderStatusChanged,
} from '#events/order_events'
import { QueueProvider } from '#contracts/queue_provider'
import InventoryItem from '#models/inventory_item'
import OrderStatusHistory from '#models/order_status_history'
import AnalyticsEvent from '#models/analytics_event'
import DailyAnalytics from '#models/daily_analytics'
import { DateTime } from 'luxon'
import { randomUUID } from 'crypto'

export default class OrderListener {
  /**
   * Handle order created event
   * - Decrease inventory
   * - Send order confirmation email
   * - Create analytics event
   * - Update daily analytics
   */
  async handleOrderCreated(event: OrderCreated) {
    const { order, customer } = event

    // Update inventory
    await this.decreaseInventory(order)

    // Create analytics event
    await AnalyticsEvent.create({
      id: randomUUID(),
      storeId: order.storeId,
      sessionId: null,
      customerId: customer?.id || null,
      eventType: 'purchase',
      eventData: {
        orderId: order.id,
        orderNumber: order.orderNumber,
        total: order.grandTotal,
        itemCount: order.items?.reduce((sum: number, i: any) => sum + i.quantity, 0) || 0,
      },
    })

    // Update daily analytics
    await this.updateDailyAnalytics(order.storeId, {
      orders: 1,
      revenue: order.grandTotal,
    })

    // Queue order confirmation email
    try {
      const queue = await app.container.make(QueueProvider)
      await queue.dispatch({
        name: 'send-email',
        queue: 'emails',
        data: {
          to: order.email,
          subject: `Order Confirmed - #${order.orderNumber}`,
          template: 'order-confirmation',
          data: { orderId: order.id, orderNumber: order.orderNumber },
        },
      })
    } catch (err: unknown) {
      logger.error(`[OrderListener] Failed to queue confirmation email: ${(err as Error).message}`)
    }

    logger.info(`[OrderListener] Order confirmation email queued for order ${order.orderNumber}`)
  }

  /**
   * Handle order status changed event
   * - Log status history
   * - Send notification
   */
  async handleOrderStatusChanged(event: OrderStatusChanged) {
    const { order, oldStatus, newStatus } = event

    // Log status change
    await OrderStatusHistory.create({
      id: randomUUID(),
      orderId: order.id,
      status: newStatus,
      previousStatus: oldStatus,
      type: 'status_change',
      title: `Status changed to ${newStatus}`,
      description: `Order status changed from ${oldStatus} to ${newStatus}`,
      isCustomerNotified: false,
      metadata: {},
    })

    logger.info(`[OrderListener] Order ${order.orderNumber} status changed: ${oldStatus} -> ${newStatus}`)
  }

  /**
   * Handle order paid event
   * - Update order payment status
   * - Send payment confirmation
   */
  async handleOrderPaid(event: OrderPaid) {
    const { order, paymentMethod, transactionId } = event

    logger.info(`[OrderListener] Order ${order.orderNumber} paid via ${paymentMethod} (${transactionId})`)
  }

  /**
   * Handle order shipped event
   * - Send shipping confirmation email
   * - Update analytics
   */
  async handleOrderShipped(event: OrderShipped) {
    const { order, trackingNumber, carrier } = event

    logger.info(`[OrderListener] Order ${order.orderNumber} shipped via ${carrier || 'unknown'} (${trackingNumber || 'no tracking'})`)

    // Queue shipping confirmation email
    try {
      const queue = await app.container.make(QueueProvider)
      await queue.dispatch({
        name: 'send-email',
        queue: 'emails',
        data: {
          to: order.email,
          subject: `Your Order #${order.orderNumber} Has Been Shipped`,
          template: 'order-shipped',
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            trackingNumber: trackingNumber || null,
            carrier: carrier || null,
          },
        },
      })
    } catch (err: unknown) {
      logger.error(`[OrderListener] Failed to queue shipping email: ${(err as Error).message}`)
    }
  }

  /**
   * Handle order delivered event
   * - Send delivery confirmation
   * - Request review
   */
  async handleOrderDelivered(event: OrderDelivered) {
    const { order } = event

    logger.info(`[OrderListener] Order ${order.orderNumber} delivered`)

    // Queue review request email with 3-day delay
    try {
      const queue = await app.container.make(QueueProvider)
      await queue.dispatchLater(
        {
          name: 'send-email',
          queue: 'emails',
          data: {
            to: order.email,
            subject: `How was your order #${order.orderNumber}?`,
            template: 'order-review-request',
            data: { orderId: order.id, orderNumber: order.orderNumber },
          },
        },
        3 * 24 * 60 * 60 * 1000 // 3 days delay
      )
    } catch (err: unknown) {
      logger.error(`[OrderListener] Failed to queue review request: ${(err as Error).message}`)
    }
  }

  /**
   * Handle order cancelled event
   * - Restore inventory
   * - Send cancellation email
   * - Update analytics
   */
  async handleOrderCancelled(event: OrderCancelled) {
    const { order, reason } = event

    // Restore inventory
    await this.restoreInventory(order)

    // Update daily analytics
    await this.updateDailyAnalytics(order.storeId, {
      orders: -1,
      revenue: -order.grandTotal,
    })

    logger.info(`[OrderListener] Order ${order.orderNumber} cancelled: ${reason || 'No reason provided'}`)
  }

  /**
   * Handle order refunded event
   * - Update analytics
   * - Send refund confirmation
   */
  async handleOrderRefunded(event: OrderRefunded) {
    const { order, refundAmount, reason } = event

    // Update daily analytics
    await this.updateDailyAnalytics(order.storeId, {
      revenue: -refundAmount,
    })

    logger.info(`[OrderListener] Order ${order.orderNumber} refunded: $${refundAmount} - ${reason || 'No reason'}`)
  }

  /**
   * Decrease inventory for order items
   */
  private async decreaseInventory(order: any) {
    await order.load('items')

    for (const item of order.items || []) {
      if (item.variantId) {
        const inventoryLevel = await InventoryItem.query()
          .where('variantId', item.variantId)
          .first()

        if (inventoryLevel) {
          inventoryLevel.quantity -= item.quantity
          await inventoryLevel.save()
        }
      }
    }
  }

  /**
   * Restore inventory for cancelled order
   */
  private async restoreInventory(order: any) {
    await order.load('items')

    for (const item of order.items || []) {
      if (item.variantId) {
        const inventoryLevel = await InventoryItem.query()
          .where('variantId', item.variantId)
          .first()

        if (inventoryLevel) {
          inventoryLevel.quantity += item.quantity
          await inventoryLevel.save()
        }
      }
    }
  }

  /**
   * Update daily analytics
   */
  private async updateDailyAnalytics(storeId: string, data: { orders?: number; revenue?: number }) {
    const today = DateTime.now().toFormat('yyyy-MM-dd')

    let dailyAnalytics = await DailyAnalytics.query()
      .where('storeId', storeId)
      .where('date', today)
      .first()

    if (!dailyAnalytics) {
      dailyAnalytics = await DailyAnalytics.create({
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

    if (data.orders) {
      dailyAnalytics.totalOrders += data.orders
    }
    if (data.revenue) {
      dailyAnalytics.totalRevenue += data.revenue
    }
    if (dailyAnalytics.totalOrders > 0) {
      dailyAnalytics.averageOrderValue = dailyAnalytics.totalRevenue / dailyAnalytics.totalOrders
    }

    await dailyAnalytics.save()
  }
}
