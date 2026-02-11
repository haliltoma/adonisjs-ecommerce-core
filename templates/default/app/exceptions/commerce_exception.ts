import { Exception } from '@adonisjs/core/exceptions'
import type { HttpContext } from '@adonisjs/core/http'

/**
 * Base exception class for commerce-related errors.
 */
export class CommerceException extends Exception {
  static code = 'E_COMMERCE_ERROR'

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
      },
    })
  }
}

/**
 * Thrown when a product is not found.
 */
export class ProductNotFoundException extends CommerceException {
  static code = 'E_PRODUCT_NOT_FOUND'
  static status = 404

  constructor(identifier: string) {
    super(`Product not found: ${identifier}`, {
      status: 404,
      code: 'E_PRODUCT_NOT_FOUND',
    })
  }
}

/**
 * Thrown when a product variant is not found.
 */
export class VariantNotFoundException extends CommerceException {
  static code = 'E_VARIANT_NOT_FOUND'
  static status = 404

  constructor(variantId: string) {
    super(`Variant not found: ${variantId}`, {
      status: 404,
      code: 'E_VARIANT_NOT_FOUND',
    })
  }
}

/**
 * Thrown when there is insufficient stock.
 */
export class InsufficientStockException extends CommerceException {
  static code = 'E_INSUFFICIENT_STOCK'
  static status = 400

  constructor(
    productName: string,
    requested: number,
    available: number
  ) {
    super(
      `Insufficient stock for "${productName}". Requested: ${requested}, Available: ${available}`,
      {
        status: 400,
        code: 'E_INSUFFICIENT_STOCK',
      }
    )
  }
}

/**
 * Thrown when a cart is empty.
 */
export class EmptyCartException extends CommerceException {
  static code = 'E_EMPTY_CART'
  static status = 400

  constructor() {
    super('Cart is empty', {
      status: 400,
      code: 'E_EMPTY_CART',
    })
  }
}

/**
 * Thrown when a cart item is not found.
 */
export class CartItemNotFoundException extends CommerceException {
  static code = 'E_CART_ITEM_NOT_FOUND'
  static status = 404

  constructor(itemId: string) {
    super(`Cart item not found: ${itemId}`, {
      status: 404,
      code: 'E_CART_ITEM_NOT_FOUND',
    })
  }
}

/**
 * Thrown when an order is not found.
 */
export class OrderNotFoundException extends CommerceException {
  static code = 'E_ORDER_NOT_FOUND'
  static status = 404

  constructor(identifier: string) {
    super(`Order not found: ${identifier}`, {
      status: 404,
      code: 'E_ORDER_NOT_FOUND',
    })
  }
}

/**
 * Thrown when an order cannot be modified.
 */
export class OrderNotModifiableException extends CommerceException {
  static code = 'E_ORDER_NOT_MODIFIABLE'
  static status = 400

  constructor(orderNumber: string, status: string) {
    super(
      `Order ${orderNumber} cannot be modified in "${status}" status`,
      {
        status: 400,
        code: 'E_ORDER_NOT_MODIFIABLE',
      }
    )
  }
}

/**
 * Thrown when a discount code is invalid.
 */
export class InvalidDiscountException extends CommerceException {
  static code = 'E_INVALID_DISCOUNT'
  static status = 400

  constructor(message: string = 'Invalid discount code') {
    super(message, {
      status: 400,
      code: 'E_INVALID_DISCOUNT',
    })
  }
}

/**
 * Thrown when a discount has expired.
 */
export class DiscountExpiredException extends CommerceException {
  static code = 'E_DISCOUNT_EXPIRED'
  static status = 400

  constructor(code: string) {
    super(`Discount code "${code}" has expired`, {
      status: 400,
      code: 'E_DISCOUNT_EXPIRED',
    })
  }
}

/**
 * Thrown when a discount usage limit is reached.
 */
export class DiscountUsageLimitException extends CommerceException {
  static code = 'E_DISCOUNT_USAGE_LIMIT'
  static status = 400

  constructor(code: string) {
    super(`Discount code "${code}" has reached its usage limit`, {
      status: 400,
      code: 'E_DISCOUNT_USAGE_LIMIT',
    })
  }
}

/**
 * Thrown when payment fails.
 */
export class PaymentFailedException extends CommerceException {
  static code = 'E_PAYMENT_FAILED'
  static status = 400

  constructor(message: string = 'Payment processing failed') {
    super(message, {
      status: 400,
      code: 'E_PAYMENT_FAILED',
    })
  }
}

/**
 * Thrown when a refund fails.
 */
export class RefundFailedException extends CommerceException {
  static code = 'E_REFUND_FAILED'
  static status = 400

  constructor(message: string = 'Refund processing failed') {
    super(message, {
      status: 400,
      code: 'E_REFUND_FAILED',
    })
  }
}

/**
 * Thrown when a shipping method is not available.
 */
export class ShippingNotAvailableException extends CommerceException {
  static code = 'E_SHIPPING_NOT_AVAILABLE'
  static status = 400

  constructor(message: string = 'Shipping not available for this address') {
    super(message, {
      status: 400,
      code: 'E_SHIPPING_NOT_AVAILABLE',
    })
  }
}

/**
 * Thrown when a category is not found.
 */
export class CategoryNotFoundException extends CommerceException {
  static code = 'E_CATEGORY_NOT_FOUND'
  static status = 404

  constructor(identifier: string) {
    super(`Category not found: ${identifier}`, {
      status: 404,
      code: 'E_CATEGORY_NOT_FOUND',
    })
  }
}

/**
 * Thrown when a customer is not found.
 */
export class CustomerNotFoundException extends CommerceException {
  static code = 'E_CUSTOMER_NOT_FOUND'
  static status = 404

  constructor(identifier: string) {
    super(`Customer not found: ${identifier}`, {
      status: 404,
      code: 'E_CUSTOMER_NOT_FOUND',
    })
  }
}

/**
 * Thrown when authentication fails.
 */
export class AuthenticationException extends CommerceException {
  static code = 'E_AUTHENTICATION_FAILED'
  static status = 401

  constructor(message: string = 'Authentication failed') {
    super(message, {
      status: 401,
      code: 'E_AUTHENTICATION_FAILED',
    })
  }
}

/**
 * Thrown when authorization fails.
 */
export class AuthorizationException extends CommerceException {
  static code = 'E_AUTHORIZATION_FAILED'
  static status = 403

  constructor(message: string = 'You do not have permission to perform this action') {
    super(message, {
      status: 403,
      code: 'E_AUTHORIZATION_FAILED',
    })
  }
}

/**
 * Thrown when a store is not found.
 */
export class StoreNotFoundException extends CommerceException {
  static code = 'E_STORE_NOT_FOUND'
  static status = 404

  constructor(identifier: string) {
    super(`Store not found: ${identifier}`, {
      status: 404,
      code: 'E_STORE_NOT_FOUND',
    })
  }
}

// ── Inventory Exceptions ─────────────────────────────────

/**
 * Thrown when an inventory location is not found.
 */
export class InventoryLocationNotFoundException extends CommerceException {
  static code = 'E_INVENTORY_LOCATION_NOT_FOUND'
  static status = 404

  constructor(identifier: string) {
    super(`Inventory location not found: ${identifier}`, {
      status: 404,
      code: 'E_INVENTORY_LOCATION_NOT_FOUND',
    })
  }
}

// ── Fulfillment Exceptions ───────────────────────────────

/**
 * Thrown when a fulfillment is not found.
 */
export class FulfillmentNotFoundException extends CommerceException {
  static code = 'E_FULFILLMENT_NOT_FOUND'
  static status = 404

  constructor(identifier: string) {
    super(`Fulfillment not found: ${identifier}`, {
      status: 404,
      code: 'E_FULFILLMENT_NOT_FOUND',
    })
  }
}

/**
 * Thrown when a fulfillment cannot be created (e.g. already fulfilled).
 */
export class FulfillmentNotAllowedException extends CommerceException {
  static code = 'E_FULFILLMENT_NOT_ALLOWED'
  static status = 400

  constructor(message: string = 'Fulfillment not allowed for this order') {
    super(message, {
      status: 400,
      code: 'E_FULFILLMENT_NOT_ALLOWED',
    })
  }
}

// ── Media Exceptions ─────────────────────────────────────

/**
 * Thrown when a media file upload fails.
 */
export class MediaUploadException extends CommerceException {
  static code = 'E_MEDIA_UPLOAD_FAILED'
  static status = 400

  constructor(message: string = 'File upload failed') {
    super(message, {
      status: 400,
      code: 'E_MEDIA_UPLOAD_FAILED',
    })
  }
}

/**
 * Thrown when a media file type is not allowed.
 */
export class MediaTypeNotAllowedException extends CommerceException {
  static code = 'E_MEDIA_TYPE_NOT_ALLOWED'
  static status = 400

  constructor(mimeType: string) {
    super(`File type not allowed: ${mimeType}`, {
      status: 400,
      code: 'E_MEDIA_TYPE_NOT_ALLOWED',
    })
  }
}

/**
 * Thrown when a file exceeds size limit.
 */
export class MediaSizeLimitException extends CommerceException {
  static code = 'E_MEDIA_SIZE_LIMIT'
  static status = 400

  constructor(maxSize: string) {
    super(`File exceeds maximum size limit of ${maxSize}`, {
      status: 400,
      code: 'E_MEDIA_SIZE_LIMIT',
    })
  }
}

// ── Search Exceptions ────────────────────────────────────

/**
 * Thrown when search service encounters an error.
 */
export class SearchException extends CommerceException {
  static code = 'E_SEARCH_ERROR'
  static status = 500

  constructor(message: string = 'Search service error') {
    super(message, {
      status: 500,
      code: 'E_SEARCH_ERROR',
    })
  }
}

// ── Webhook Exceptions ───────────────────────────────────

/**
 * Thrown when a webhook delivery fails.
 */
export class WebhookDeliveryException extends CommerceException {
  static code = 'E_WEBHOOK_DELIVERY_FAILED'
  static status = 500

  constructor(webhookId: string, message: string) {
    super(`Webhook delivery failed for ${webhookId}: ${message}`, {
      status: 500,
      code: 'E_WEBHOOK_DELIVERY_FAILED',
    })
  }
}

/**
 * Thrown when webhook signature verification fails.
 */
export class WebhookSignatureException extends CommerceException {
  static code = 'E_WEBHOOK_SIGNATURE_INVALID'
  static status = 401

  constructor() {
    super('Invalid webhook signature', {
      status: 401,
      code: 'E_WEBHOOK_SIGNATURE_INVALID',
    })
  }
}

// ── Notification Exceptions ──────────────────────────────

/**
 * Thrown when notification sending fails.
 */
export class NotificationSendException extends CommerceException {
  static code = 'E_NOTIFICATION_SEND_FAILED'
  static status = 500

  constructor(channel: string, message: string = 'Failed to send notification') {
    super(`${message} via ${channel}`, {
      status: 500,
      code: 'E_NOTIFICATION_SEND_FAILED',
    })
  }
}

// ── Review Exceptions ────────────────────────────────────

/**
 * Thrown when a review is not found.
 */
export class ReviewNotFoundException extends CommerceException {
  static code = 'E_REVIEW_NOT_FOUND'
  static status = 404

  constructor(identifier: string) {
    super(`Review not found: ${identifier}`, {
      status: 404,
      code: 'E_REVIEW_NOT_FOUND',
    })
  }
}

/**
 * Thrown when a duplicate review is attempted.
 */
export class DuplicateReviewException extends CommerceException {
  static code = 'E_DUPLICATE_REVIEW'
  static status = 400

  constructor() {
    super('You have already reviewed this product', {
      status: 400,
      code: 'E_DUPLICATE_REVIEW',
    })
  }
}

// ── Rate Limiting Exception ──────────────────────────────

/**
 * Thrown when rate limit is exceeded.
 */
export class RateLimitException extends CommerceException {
  static code = 'E_RATE_LIMIT_EXCEEDED'
  static status = 429

  constructor(retryAfterSeconds?: number) {
    const msg = retryAfterSeconds
      ? `Rate limit exceeded. Try again in ${retryAfterSeconds} seconds.`
      : 'Rate limit exceeded. Please try again later.'
    super(msg, {
      status: 429,
      code: 'E_RATE_LIMIT_EXCEEDED',
    })
  }
}

// ── Validation Exception ─────────────────────────────────

/**
 * Thrown when validation fails.
 */
export class ValidationException extends CommerceException {
  static code = 'E_VALIDATION_FAILED'
  static status = 422

  public errors: Record<string, string[]>

  constructor(errors: Record<string, string[]>) {
    super('Validation failed', {
      status: 422,
      code: 'E_VALIDATION_FAILED',
    })
    this.errors = errors
  }

  async handle(error: this, ctx: HttpContext) {
    ctx.response.status(error.status).json({
      error: {
        code: error.code,
        message: error.message,
        errors: error.errors,
      },
    })
  }
}
