/**
 * Checkout Service
 *
 * Orchestrates the checkout process.
 * Single Responsibility: Coordinate order creation from cart.
 * Extracted from OrdersController to follow SRP.
 */

import type ICartRepository from '#repositories/interfaces/i_cart_repository'
import type IOrderRepository from '#repositories/interfaces/i_order_repository'
import type IInventoryRepository from '#repositories/interfaces/i_inventory_repository'
import { DateTime } from 'luxon'


export interface CheckoutPayload {
  customerId: string
  billingAddress: {
    firstName: string
    lastName: string
    company?: string
    address1: string
    address2?: string
    city: string
    state?: string
    postalCode: string
    country: string
    phone?: string
  }
  shippingAddress?: {
    firstName: string
    lastName: string
    company?: string
    address1: string
    address2?: string
    city: string
    state?: string
    postalCode: string
    country: string
    phone?: string
  }
  shippingMethod?: string
  shippingCost?: number
  notes?: string
}

export interface CheckoutResult {
  order: any
  message: string
}

export default class CheckoutService {
  constructor(
    private cartRepository: ICartRepository,
    private orderRepository: IOrderRepository,
    private inventoryRepository: IInventoryRepository
  ) {}

  /**
   * Process checkout - create order from cart (SRP: Orchestrate workflow)
   */
  async processOrder(
    cartId: string,
    payload: CheckoutPayload,
    userId?: number
  ): Promise<CheckoutResult> {
    return await this.orderRepository.transaction(async (trx) => {
      // Step 1: Get and validate cart
      const cart = await this.cartRepository.findById(cartId, trx)

      if (!cart) {
        throw new Error('Cart not found')
      }

      if (cart.items.length === 0) {
        throw new Error('Cart is empty')
      }

      if (!cart.email) {
        throw new Error('Cart email is required')
      }

      // Step 2: Validate inventory availability
      await this.validateInventoryAvailability(cart.items)

      // Step 3: Prepare order data
      const orderData = {
        cartId: cart.id,
        customerId: payload.customerId,
        billingAddress: payload.billingAddress,
        shippingAddress: payload.shippingAddress || payload.billingAddress,
        shippingMethod: payload.shippingMethod,
        shippingCost: payload.shippingCost,
        notes: payload.notes,
      }

      // Step 4: Create order via repository
      const order = await this.orderRepository.create(orderData as any)

      // Step 5: Process order items
      await this.processOrderItems(order.id, cart.items, trx)

      // Step 6: Update discount usage if applicable
      if (cart.discountId) {
        await this.updateDiscountUsage(cart.discountId, cart.customerId ?? undefined, cart.grandTotal)
      }

      // Step 7: Mark cart as completed
      await this.cartRepository.markCompleted(cartId, trx)

      return {
        order,
        message: 'Order created successfully',
      }
    })
  }

  /**
   * Validate inventory availability for cart items
   */
  private async validateInventoryAvailability(items: any[]): Promise<void> {
    for (const item of items) {
      const productId = item.productId
      const variantId = item.variantId
      const quantity = item.quantity

      // Check stock availability
      const stockLevels = await this.inventoryRepository.getStockLevels(
        productId,
        variantId,
        undefined // Get from all locations
      )

      if (stockLevels.length === 0) {
        throw new Error(`Product "${item.title}" is not available`)
      }

      const totalAvailable = stockLevels.reduce((sum, level) => sum + level.quantityAvailable, 0)

      if (totalAvailable < quantity) {
        throw new Error(`Insufficient stock for "${item.title}". Available: ${totalAvailable}, Requested: ${quantity}`)
      }
    }
  }

  /**
   * Process order items (create order items, update inventory)
   */
  private async processOrderItems(orderId: string, cartItems: any[], trx?: any): Promise<void> {
    for (const cartItem of cartItems) {
      // Update inventory
      const productId = cartItem.productId
      const variantId = cartItem.variantId
      const quantity = cartItem.quantity

      // Get current stock
      const stockLevels = await this.inventoryRepository.getStockLevels(productId, variantId)

      if (stockLevels.length > 0) {
        const stockLevel = stockLevels[0]
        const newQuantity = Math.max(0, stockLevel.quantityOnHand - quantity)

        // Create inventory movement
        await this.inventoryRepository.adjustStock(
          productId,
          stockLevel.locationId,
          -quantity,
          'sale',
          `Order ${orderId}`,
          trx
        )
      }
    }
  }

  /**
   * Update discount usage count
   */
  private async updateDiscountUsage(discountId: string, customerId?: string, orderTotal?: number): Promise<void> {
    // This would integrate with DiscountService
    // For now, we'll track usage separately
    // TODO: Implement when DiscountService is refactored
  }

  /**
   * Calculate shipping cost (integration point)
   */
  async calculateShippingCost(cartId: string, shippingMethod?: string): Promise<number> {
    // This would integrate with a shipping service
    // For now, return default cost
    return 0
  }

  /**
   * Calculate estimated tax
   */
  async calculateEstimatedTax(cartId: string): Promise<number> {
    const cart = await this.cartRepository.findById(cartId)

    if (!cart) {
      return 0
    }

    return cart.taxTotal || 0
  }

  /**
   * Validate checkout readiness
   */
  async validateCheckoutReady(cartId: string): Promise<{
    valid: boolean
    errors: string[]
  }> {
    const errors: string[] = []

    const cart = await this.cartRepository.findById(cartId)

    if (!cart) {
      errors.push('Cart not found')
      return { valid: false, errors }
    }

    if (cart.items.length === 0) {
      errors.push('Cart is empty')
    }

    if (!cart.email) {
      errors.push('Email is required')
    }

    // Validate inventory
    try {
      await this.validateInventoryAvailability(cart.items)
    } catch (error) {
      errors.push((error as Error).message)
    }

    return {
      valid: errors.length === 0,
      errors,
    }
  }
}
