import logger from '@adonisjs/core/services/logger'
import {
  ProductLowStock,
  ProductOutOfStock,
  ProductBackInStock,
} from '#events/product_events'
import Notification from '#models/notification'
import { randomUUID } from 'crypto'

export default class InventoryListener {
  /**
   * Handle product low stock event
   * - Send alert to admin
   * - Create notification
   */
  async handleLowStock(event: ProductLowStock) {
    const { product, variant, currentStock, threshold } = event

    const productName = variant
      ? `${product.title} - ${variant.title}`
      : product.title

    // Create notification for admins
    await Notification.create({
      id: randomUUID(),
      userId: null,
      type: 'low_stock',
      title: 'Low Stock Alert',
      message: `${productName} is running low on stock (${currentStock} remaining, threshold: ${threshold})`,
      data: {
        storeId: product.storeId,
        productId: product.id,
        variantId: variant?.id || null,
        currentStock,
        threshold,
      },
      channel: 'database',
      isRead: false,
    })

    logger.info(`[InventoryListener] Low stock alert: ${productName} (${currentStock}/${threshold})`)
  }

  /**
   * Handle product out of stock event
   * - Send critical alert to admin
   * - Notify customers on waitlist
   */
  async handleOutOfStock(event: ProductOutOfStock) {
    const { product, variant } = event

    const productName = variant
      ? `${product.title} - ${variant.title}`
      : product.title

    // Create critical notification
    await Notification.create({
      id: randomUUID(),
      userId: null,
      type: 'out_of_stock',
      title: 'Out of Stock Alert',
      message: `${productName} is now out of stock!`,
      data: {
        storeId: product.storeId,
        productId: product.id,
        variantId: variant?.id || null,
      },
      channel: 'database',
      isRead: false,
    })

    logger.info(`[InventoryListener] Out of stock: ${productName}`)
  }

  /**
   * Handle product back in stock event
   * - Notify customers on waitlist
   * - Clear out of stock notifications
   */
  async handleBackInStock(event: ProductBackInStock) {
    const { product, variant, quantity } = event

    const productName = variant
      ? `${product.title} - ${variant.title}`
      : product.title

    // Create back in stock notification
    await Notification.create({
      id: randomUUID(),
      userId: null,
      type: 'back_in_stock',
      title: 'Back in Stock',
      message: `${productName} is back in stock (${quantity} units available)`,
      data: {
        storeId: product.storeId,
        productId: product.id,
        variantId: variant?.id || null,
        quantity,
      },
      channel: 'database',
      isRead: false,
    })

    logger.info(`[InventoryListener] Back in stock: ${productName} (${quantity} units)`)

    // TODO: Notify waitlist customers via email
  }
}
