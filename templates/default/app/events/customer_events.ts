import { BaseEvent } from '@adonisjs/core/events'
import Customer from '#models/customer'

/**
 * Customer Registered Event
 */
export class CustomerRegistered extends BaseEvent {
  constructor(public customer: Customer) {
    super()
  }
}

/**
 * Customer Verified Event
 */
export class CustomerVerified extends BaseEvent {
  constructor(public customer: Customer) {
    super()
  }
}

/**
 * Customer Login Event
 */
export class CustomerLoggedIn extends BaseEvent {
  constructor(
    public customer: Customer,
    public ipAddress: string,
    public userAgent: string
  ) {
    super()
  }
}

/**
 * Customer Logout Event
 */
export class CustomerLoggedOut extends BaseEvent {
  constructor(public customer: Customer) {
    super()
  }
}

/**
 * Customer Updated Event
 */
export class CustomerUpdated extends BaseEvent {
  constructor(
    public customer: Customer,
    public changes: Partial<Customer>
  ) {
    super()
  }
}

/**
 * Customer Password Changed Event
 */
export class CustomerPasswordChanged extends BaseEvent {
  constructor(public customer: Customer) {
    super()
  }
}

/**
 * Customer Password Reset Requested Event
 */
export class CustomerPasswordResetRequested extends BaseEvent {
  constructor(
    public customer: Customer,
    public resetToken: string
  ) {
    super()
  }
}

/**
 * Customer Subscribed to Newsletter Event
 */
export class CustomerSubscribedNewsletter extends BaseEvent {
  constructor(public customer: Customer) {
    super()
  }
}

/**
 * Customer Unsubscribed from Newsletter Event
 */
export class CustomerUnsubscribedNewsletter extends BaseEvent {
  constructor(public customer: Customer) {
    super()
  }
}

/**
 * Customer Deactivated Event
 */
export class CustomerDeactivated extends BaseEvent {
  constructor(
    public customer: Customer,
    public reason: string | null
  ) {
    super()
  }
}
