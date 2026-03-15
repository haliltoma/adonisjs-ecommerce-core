/**
 * Product Inventory Manager
 *
 * Responsible for managing product inventory.
 * Single Responsibility: Track and update product stock levels.
 */

import type IProductRepository from '#repositories/interfaces/i_product_repository'

export default class ProductInventoryManager {
  /**
   * Update stock for product
   */
  async updateStock(
    productId: string,
    quantity: number,
    productRepository: IProductRepository,
    trx?: any
  ): Promise<void> {
    await productRepository.updateStock(productId, quantity, trx)
  }

  /**
   * Adjust stock (add or remove quantity)
   */
  async adjustStock(
    productId: string,
    adjustment: number,
    productRepository: IProductRepository,
    trx?: any
  ): Promise<void> {
    const product = await productRepository.findById(productId, trx)

    if (!product) {
      throw new Error(`Product not found: ${productId}`)
    }

    const currentStock = product.quantityAvailable || 0
    const newStock = Math.max(0, currentStock + adjustment)

    await productRepository.updateStock(productId, newStock, trx)
  }

  /**
   * Reserve stock (for cart/orders)
   */
  async reserveStock(
    productId: string,
    quantity: number,
    productRepository: IProductRepository,
    trx?: any
  ): Promise<boolean> {
    const product = await productRepository.findById(productId, trx)

    if (!product) {
      throw new Error(`Product not found: ${productId}`)
    }

    if (!product.trackQuantity) {
      return true // No tracking needed
    }

    const availableStock = product.quantityAvailable || 0

    if (availableStock < quantity) {
      return false
    }

    await productRepository.updateStock(productId, availableStock - quantity, trx)

    return true
  }

  /**
   * Release reserved stock
   */
  async releaseStock(
    productId: string,
    quantity: number,
    productRepository: IProductRepository,
    trx?: any
  ): Promise<void> {
    await this.adjustStock(productId, quantity, productRepository, trx)
  }
}
