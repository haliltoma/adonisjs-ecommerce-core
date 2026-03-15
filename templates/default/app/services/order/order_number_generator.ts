/**
 * Order Number Generator
 *
 * Responsible for generating unique order numbers.
 * Single Responsibility: Generate order numbers.
 */

import string from '@adonisjs/core/helpers/string'
import db from '@adonisjs/lucid/services/db'

export default class OrderNumberGenerator {
  /**
   * Generate unique order number for store
   */
  async generate(storeId: string): Promise<string> {
    const prefix = 'ORD'
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = string.random(4).toUpperCase()

    return `${prefix}-${timestamp}-${random}`
  }

  /**
   * Generate sequential order number for store
   * Format: STORE-000001
   */
  async generateSequential(storeId: string): Promise<string> {
    // Get last order number for this store
    const lastOrder = await db
      .from('orders')
      .select('orderNumber')
      .where('storeId', storeId)
      .where('orderNumber', 'like', `${storeId}-%`)
      .orderBy('createdAt', 'desc')
      .first()

    let nextNumber = 1

    if (lastOrder) {
      // Extract number from last order number (e.g., STORE-000123 -> 123)
      const parts = lastOrder.orderNumber.split('-')
      const lastNumber = parseInt(parts[parts.length - 1], 10)
      nextNumber = lastNumber + 1
    }

    // Format with leading zeros
    const paddedNumber = nextNumber.toString().padStart(6, '0')

    return `${storeId}-${paddedNumber}`
  }

  /**
   * Generate order number with custom format
   */
  async generateCustom(
    storeId: string,
    format: 'sequential' | 'timestamp' | 'random' = 'timestamp'
  ): Promise<string> {
    switch (format) {
      case 'sequential':
        return await this.generateSequential(storeId)

      case 'timestamp':
        return await this.generate(storeId)

      case 'random':
        const prefix = 'ORD'
        const random = string.random(8).toUpperCase()
        return `${prefix}-${random}`

      default:
        return await this.generate(storeId)
    }
  }
}
