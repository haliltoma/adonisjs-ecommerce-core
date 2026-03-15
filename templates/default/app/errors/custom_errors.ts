/**
 * Custom Error Classes
 *
 * Consistent error handling across the application
 */

export class CustomerNotFoundError extends Error {
  constructor(customerId: string) {
    super(`Customer not found: ${customerId}`)
    this.name = 'CustomerNotFoundError'
  }
}

export class SegmentNotFoundError extends Error {
  constructor(segmentId: string) {
    super(`Segment not found: ${segmentId}`)
    this.name = 'SegmentNotFoundError'
  }
}

export class OrderNotFoundError extends Error {
  constructor(orderId: string) {
    super(`Order not found: ${orderId}`)
    this.name = 'OrderNotFoundError'
  }
}

export class ProductNotFoundError extends Error {
  constructor(productId: string) {
    super(`Product not found: ${productId}`)
    this.name = 'ProductNotFoundError'
  }
}

export class InsufficientStockError extends Error {
  constructor(productId: string, available: number, requested: number) {
    super(
      `Insufficient stock for product ${productId}. Available: ${available}, Requested: ${requested}`
    )
    this.name = 'InsufficientStockError'
  }
}

export class ReturnWindowExpiredError extends Error {
  constructor(orderDate: Date, returnWindowDays: number) {
    super(`Return window expired. Order date: ${orderDate}, Return window: ${returnWindowDays} days`)
    this.name = 'ReturnWindowExpiredError'
  }
}

export class InvalidReturnStatusError extends Error {
  constructor(currentStatus: string, attemptedAction: string) {
    super(`Cannot ${attemptedAction} return with status: ${currentStatus}`)
    this.name = 'InvalidReturnStatusError'
  }
}

export class ManualSegmentAssignmentError extends Error {
  constructor(segmentId: string) {
    super(`Cannot manually assign to dynamic segment: ${segmentId}`)
    this.name = 'ManualSegmentAssignmentError'
  }
}

export class ReservationExpiredError extends Error {
  constructor(reservationId: string) {
    super(`Reservation has expired: ${reservationId}`)
    this.name = 'ReservationExpiredError'
  }
}

export class InvalidReservationTypeError extends Error {
  constructor(reservationType: string) {
    super(`Invalid reservation type: ${reservationType}`)
    this.name = 'InvalidReservationTypeError'
  }
}

export class MeiliSearchConnectionError extends Error {
  constructor(host: string) {
    super(`Failed to connect to MeiliSearch at: ${host}`)
    this.name = 'MeiliSearchConnectionError'
  }
}

export class CurrencyConversionError extends Error {
  constructor(fromCurrency: string, toCurrency: string) {
    super(`Failed to convert currency from ${fromCurrency} to ${toCurrency}`)
    this.name = 'CurrencyConversionError'
  }
}

export class ForbiddenError extends Error {
  constructor(resource: string, resourceId: string) {
    super(`Access forbidden to resource: ${resource} (${resourceId})`)
    this.name = 'ForbiddenError'
  }
}
