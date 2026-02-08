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
