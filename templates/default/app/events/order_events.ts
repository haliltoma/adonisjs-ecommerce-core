import { BaseEvent } from '@adonisjs/core/events'
import Order from '#models/order'
import Customer from '#models/customer'

/**
 * Order Created Event
 * Fired when a new order is created
 */
export class OrderCreated extends BaseEvent {
  constructor(
    public order: Order,
    public customer: Customer | null
  ) {
    super()
  }
}

/**
 * Order Updated Event
 * Fired when an order is updated
 */
export class OrderUpdated extends BaseEvent {
  constructor(
    public order: Order,
    public changes: Partial<Order>
  ) {
    super()
  }
}

/**
 * Order Status Changed Event
 * Fired when order status changes
 */
export class OrderStatusChanged extends BaseEvent {
  constructor(
    public order: Order,
    public oldStatus: string,
    public newStatus: string
  ) {
    super()
  }
}

/**
 * Order Paid Event
 * Fired when an order is fully paid
 */
export class OrderPaid extends BaseEvent {
  constructor(
    public order: Order,
    public paymentMethod: string,
    public transactionId: string
  ) {
    super()
  }
}

/**
 * Order Shipped Event
 * Fired when an order is shipped
 */
export class OrderShipped extends BaseEvent {
  constructor(
    public order: Order,
    public trackingNumber: string | null,
    public carrier: string | null
  ) {
    super()
  }
}

/**
 * Order Delivered Event
 * Fired when an order is delivered
 */
export class OrderDelivered extends BaseEvent {
  constructor(public order: Order) {
    super()
  }
}

/**
 * Order Cancelled Event
 * Fired when an order is cancelled
 */
export class OrderCancelled extends BaseEvent {
  constructor(
    public order: Order,
    public reason: string | null
  ) {
    super()
  }
}

/**
 * Order Refunded Event
 * Fired when an order is refunded
 */
export class OrderRefunded extends BaseEvent {
  constructor(
    public order: Order,
    public refundAmount: number,
    public reason: string | null
  ) {
    super()
  }
}
