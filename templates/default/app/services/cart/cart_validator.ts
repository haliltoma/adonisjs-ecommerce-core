/**
 * Cart Validator
 *
 * Responsible for validating cart state and operations.
 * Single Responsibility: Validate cart operations.
 */

import type { Cart } from '@adonisjs/lucid/types/model'

export interface ValidationResult {
  valid: boolean
  errors: string[]
}

export default class CartValidator {
  /**
   * Validate cart is ready for checkout
   */
  async validateForCheckout(cart: Cart): Promise<ValidationResult> {
    const errors: string[] = []

    // Check if cart exists
    if (!cart.id) {
      errors.push('Cart does not exist')
    }

    // Check if cart has items
    if (!cart.items || cart.items.length === 0) {
      errors.push('Cart is empty')
    }

    // Check if cart has email
    if (!cart.email) {
      errors.push('Email is required')
    }

    // Check if all items are valid
    if (cart.items) {
      for (const item of cart.items) {
        const itemErrors = await this.validateItem(item)

        if (!itemErrors.valid) {
          errors.push(...itemErrors.errors)
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate cart item
   */
  async validateItem(item: any): Promise<ValidationResult> {
    const errors: string[] = []

    // Check quantity
    if (!item.quantity || item.quantity <= 0) {
      errors.push('Invalid quantity')
    }

    // Check price
    if (item.unitPrice === null || item.unitPrice === undefined) {
      errors.push('Item price is missing')
    }

    // Check product availability
    try {
      const product = await item.product?.load()

      if (!product) {
        errors.push('Product not found')
        return {
          valid: false,
          errors,
        }
      }

      if (product.status !== 'active') {
        errors.push(`Product "${product.title}" is not available`)
      }

      // Check variant availability
      if (item.variantId) {
        // Load variants for this product
        await product.load('variants')
        const variant = product.variants.find((v: any) => v.id === item.variantId)

        if (!variant) {
          errors.push('Product variant not found')
        } else if (variant.trackInventory && (variant.stockQuantity || 0) < item.quantity) {
          errors.push(`Insufficient stock for "${product.title}"`)
        }
      } else if (product.trackInventory && (product.stockQuantity || 0) < item.quantity) {
        errors.push(`Insufficient stock for "${product.title}"`)
      }
    } catch (error) {
      errors.push('Failed to validate product availability')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate coupon code
   */
  validateCouponCode(code: string): ValidationResult {
    const errors: string[] = []

    if (!code || code.trim().length === 0) {
      errors.push('Coupon code is required')
    }

    if (code.length > 100) {
      errors.push('Coupon code is too long')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }

  /**
   * Validate shipping address
   */
  validateShippingAddress(address: any): ValidationResult {
    const errors: string[] = []

    const requiredFields = [
      'firstName',
      'lastName',
      'address1',
      'city',
      'postalCode',
      'country',
    ]

    for (const field of requiredFields) {
      if (!address[field] || address[field].trim().length === 0) {
        errors.push(`${field} is required`)
      }
    }

    // Validate postal code format (basic)
    if (address.postalCode && !/^[A-Z0-9\s\-]{3,10}$/i.test(address.postalCode)) {
      errors.push('Invalid postal code format')
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}
