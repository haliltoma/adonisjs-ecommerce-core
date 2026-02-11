import { BaseEvent } from '@adonisjs/core/events'
import Order from '#models/order'
import OrderTransaction from '#models/order_transaction'

/**
 * Payment Authorized Event
 */
export class PaymentAuthorized extends BaseEvent {
  constructor(
    public order: Order,
    public transaction: OrderTransaction
  ) {
    super()
  }
}

/**
 * Payment Captured Event
 */
export class PaymentCaptured extends BaseEvent {
  constructor(
    public order: Order,
    public transaction: OrderTransaction
  ) {
    super()
  }
}

/**
 * Payment Failed Event
 */
export class PaymentFailed extends BaseEvent {
  constructor(
    public order: Order,
    public errorMessage: string,
    public errorCode?: string
  ) {
    super()
  }
}

/**
 * Payment Refunded Event
 */
export class PaymentRefunded extends BaseEvent {
  constructor(
    public order: Order,
    public transaction: OrderTransaction,
    public amount: number
  ) {
    super()
  }
}

/**
 * Payment Voided Event
 */
export class PaymentVoided extends BaseEvent {
  constructor(
    public order: Order,
    public transaction: OrderTransaction
  ) {
    super()
  }
}

/**
 * Payment Webhook Received Event
 */
export class PaymentWebhookReceived extends BaseEvent {
  constructor(
    public provider: string,
    public eventType: string,
    public payload: Record<string, unknown>
  ) {
    super()
  }
}
