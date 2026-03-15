/**
 * Product Category Manager
 *
 * Responsible for managing product categories.
 * Single Responsibility: Attach/detach categories from products.
 */

import db from '@adonisjs/lucid/services/db'

export default class ProductCategoryManager {
  /**
   * Attach categories to product
   */
  async attachCategories(
    productId: string,
    categoryIds: string[],
    trx?: any
  ): Promise<void> {
    if (categoryIds.length === 0) return

    const records = categoryIds.map((categoryId) => ({
      productId,
      categoryId,
      createdAt: new Date(),
      updatedAt: new Date(),
    }))

    await db.table('product_categories')
      .insert(records)
      .transacting(trx)
  }

  /**
   * Detach category from product
   */
  async detachCategory(
    productId: string,
    categoryId: string,
    trx?: any
  ): Promise<void> {
    await db.table('product_categories')
      .where('productId', productId)
      .where('categoryId', categoryId)
      .transacting(trx)
      .delete()
  }

  /**
   * Detach all categories from product
   */
  async detachAllCategories(productId: string, trx?: any): Promise<void> {
    await db.table('product_categories')
      .where('productId', productId)
      .transacting(trx)
      .delete()
  }

  /**
   * Sync categories (replace all)
   */
  async syncCategories(
    productId: string,
    categoryIds: string[],
    trx?: any
  ): Promise<void> {
    await db.transaction(async (transactionTrx) => {
      const actualTrx = trx || transactionTrx

      // Remove all existing categories
      await this.detachAllCategories(productId, actualTrx)

      // Attach new categories
      await this.attachCategories(productId, categoryIds, actualTrx)
    })
  }
}
