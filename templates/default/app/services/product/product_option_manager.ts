/**
 * Product Option Manager
 *
 * Responsible for managing product options (size, color, etc.)
 * Single Responsibility: Create and sync product options.
 */

import ProductOption from '#models/product_option'

export interface CreateOptionData {
  productId: string
  name: string
  values: string[]
  position?: number
}

export default class ProductOptionManager {
  /**
   * Create options for product
   */
  async createOptions(
    productId: string,
    options: CreateOptionData[],
    trx?: any
  ): Promise<void> {
    for (let i = 0; i < options.length; i++) {
      await ProductOption.create(
        {
          productId,
          name: options[i].name,
          values: options[i].values,
          position: options[i].position ?? i,
        },
        { client: trx }
      )
    }
  }

  /**
   * Sync options - replace all options for a product
   * Used in product update operations
   */
  async syncOptions(
    productId: string,
    options: CreateOptionData[],
    trx?: any
  ): Promise<void> {
    // Delete all existing options
    await ProductOption.query({ client: trx })
      .where('productId', productId)
      .delete()

    // Create new options
    await this.createOptions(productId, options, trx)
  }
}
