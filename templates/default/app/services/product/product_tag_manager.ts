/**
 * Product Tag Manager
 *
 * Responsible for managing product tags.
 * Single Responsibility: Attach and sync product tags.
 */

import Product from '#models/product'

export default class ProductTagManager {
  /**
   * Attach tags to product
   */
  async attachTags(productId: string, tagIds: string[], trx?: any): Promise<void> {
    const product = await Product.find(productId)

    if (!product) {
      throw new Error(`Product not found: ${productId}`)
    }

    await product.related('tags').attach(tagIds, trx)
  }

  /**
   * Sync tags for product
   * Replaces all existing tags with new ones
   */
  async syncTags(productId: string, tagIds: string[], trx?: any): Promise<void> {
    const product = await Product.find(productId)

    if (!product) {
      throw new Error(`Product not found: ${productId}`)
    }

    await product.related('tags').sync(tagIds, true, trx)
  }
}
