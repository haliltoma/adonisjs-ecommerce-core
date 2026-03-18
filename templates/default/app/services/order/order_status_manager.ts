/**
 * Order Status Manager
 *
 * Responsible for managing order status history and state transitions.
 * Single Responsibility: Track order status changes with valid state machine.
 */

import OrderStatusHistory from '#models/order_status_history'
import { DateTime } from 'luxon'

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'

// Valid state transitions - prevents illegal status changes like delivered -> pending
const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['refunded'], // Can only refund a delivered order
  cancelled: [], // Terminal state - no transitions out
  refunded: [], // Terminal state - no transitions out
}

/**
 * Check if a status transition is valid
 */
function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  const allowedTransitions = VALID_TRANSITIONS[from]
  return allowedTransitions?.includes(to) || false
}

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
   * Record status change with validation
   * HARDENED: iter-4 - Added state machine validation to prevent illegal transitions
   */
  async recordStatusChange(
    orderId: string,
    previousStatus: OrderStatus,
    newStatus: OrderStatus,
    userId?: number,
    note?: string,
    trx?: any
  ): Promise<OrderStatusHistory> {
    // CRITICAL: Validate state transition
    if (!isValidTransition(previousStatus, newStatus)) {
      throw new Error(
        `Invalid status transition from '${previousStatus}' to '${newStatus}'. ` +
        `Allowed transitions from '${previousStatus}': ${VALID_TRANSITIONS[previousStatus]?.join(', ') || 'none'}`
      )
    }

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
