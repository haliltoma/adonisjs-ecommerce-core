/**
 * Order Status Manager
 *
 * Responsible for managing order status history.
 * Single Responsibility: Track order status changes.
 */

import OrderStatusHistory from '#models/order_status_history'
import { DateTime } from 'luxon'

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

export default class OrderStatusManager {
  /**
   * Record initial status when order is created
   */
  async recordInitialStatus(orderId: string, userId?: number, trx?: any): Promise<OrderStatusHistory> {
    return await OrderStatusHistory.create(
      {
        orderId,
        status: 'pending',
        type: 'status_change',
        title: 'Order created',
        description: 'Order was placed',
        userId,
        createdAt: DateTime.now(),
      },
      { client: trx }
    )
  }

  /**
   * Record status change
   */
  async recordStatusChange(
    orderId: string,
    previousStatus: OrderStatus,
    newStatus: OrderStatus,
    userId?: number,
    note?: string,
    trx?: any
  ): Promise<OrderStatusHistory> {
    return await OrderStatusHistory.create(
      {
        orderId,
        previousStatus,
        status: newStatus,
        type: 'status_change',
        title: `Status changed to ${newStatus}`,
        description: note,
        userId,
        createdAt: DateTime.now(),
      },
      { client: trx }
    )
  }

  /**
   * Record payment status change
   */
  async recordPaymentStatusChange(
    orderId: string,
    paymentStatus: string,
    userId?: number,
    trx?: any
  ): Promise<OrderStatusHistory> {
    return await OrderStatusHistory.create(
      {
        orderId,
        status: paymentStatus,
        type: 'payment_change',
        title: `Payment ${paymentStatus}`,
        description: `Payment status changed to ${paymentStatus}`,
        userId,
        createdAt: DateTime.now(),
      },
      { client: trx }
    )
  }

  /**
   * Record fulfillment status change
   */
  async recordFulfillmentStatusChange(
    orderId: string,
    fulfillmentStatus: string,
    userId?: number,
    trx?: any
  ): Promise<OrderStatusHistory> {
    return await OrderStatusHistory.create(
      {
        orderId,
        status: fulfillmentStatus,
        type: 'fulfillment_change',
        title: `Fulfillment ${fulfillmentStatus}`,
        description: `Fulfillment status changed to ${fulfillmentStatus}`,
        userId,
        createdAt: DateTime.now(),
      },
      { client: trx }
    )
  }
}
