/**
 * Product Inventory Manager
 *
 * Responsible for managing product inventory.
 * Single Responsibility: Track and update product stock levels.
 */

import type IProductRepository from '#repositories/interfaces/i_product_repository'
import ProductVariant from '#models/product_variant'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

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

    const currentStock = product.stockQuantity || 0
    const newStock = Math.max(0, currentStock + adjustment)

    await productRepository.updateStock(productId, newStock, trx)
  }

  /**
   * Reserve stock (for cart/orders)
   * CRITICAL: Uses database-level atomic update to prevent race conditions
   */
  async reserveStock(
    productId: string,
    quantity: number,
    productRepository: IProductRepository,
    trx?: any
  ): Promise<boolean> {
    // Use atomic database update to prevent race conditions
    // This ensures that stock check and update happen in a single transaction
    const updated = await productRepository.atomicReserveStock(productId, quantity, trx)

    if (!updated) {
      // Stock was insufficient or product not found
      return false
    }

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

  /**
   * Update variant inventory quantity
   * Works with product variants (not base products)
   */
  /**
   * Update variant inventory quantity
   * HARDENED: iter-2 - Validates quantity is non-negative
   */
  async updateVariantInventory(
    variantId: string,
    quantity: number,
    trx?: any
  ): Promise<void> {
    // HARDENED: iter-2 - Validate quantity is non-negative
    if (quantity < 0) {
      throw new Error('Inventory quantity cannot be negative')
    }

    const result = await db.from('product_variants')
      .where('id', variantId)
      .update({
        inventory_quantity: quantity,
        updated_at: DateTime.now().toSQL(),
      })

    if ((result as any).rowCount === 0 || result === 0) {
      throw new Error(`Variant not found: ${variantId}`)
    }
  }

  /**
   * Adjust variant inventory quantity
   * Works with product variants (not base products)
   * HARDENED: iter-2 - Uses atomic database update to prevent race conditions
   */
  async adjustVariantInventory(
    variantId: string,
    adjustment: number,
    trx?: any
  ): Promise<void> {
    console.log('[INVENTORY MANAGER] adjustVariantInventory START', { variantId, adjustment })

    // First check if variant exists and get current state
    const variant = await (trx || db).from('product_variants')
      .where('id', variantId)
      .first()

    if (!variant) {
      console.error('[INVENTORY MANAGER] Variant not found:', variantId)
      throw new Error(`Variant not found: ${variantId}`)
    }

    console.log('[INVENTORY MANAGER] Variant found:', {
      variantId,
      trackInventory: variant.track_inventory,
      currentStock: variant.inventory_quantity,
      adjustment,
    })

    // If variant doesn't track inventory, skip
    if (!variant.track_inventory) {
      console.log('[INVENTORY MANAGER] Variant does not track inventory, skipping')
      return
    }

    // HARDENED: iter-2 - Use atomic update with raw SQL to prevent race conditions
    const query = (trx || db).from('product_variants')
      .where('id', variantId)

    const result = await query
      .where('track_inventory', true)
      .whereRaw('COALESCE(inventory_quantity, 0) + ? >= 0', [adjustment])
      .update({
        inventory_quantity: db.rawQuery('COALESCE(inventory_quantity, 0) + ?', [adjustment]),
        updated_at: DateTime.now().toSQL(),
      })

    console.log('[INVENTORY MANAGER] Update result:', result)

    if ((result as any).rowCount === 0 || result === 0) {
      // Either variant doesn't exist, doesn't track inventory, or would go negative
      console.error('[INVENTORY MANAGER] Failed to adjust inventory:', {
        variantId,
        currentStock: variant.inventory_quantity,
        adjustment,
        wouldGoNegative: (variant.inventory_quantity || 0) + adjustment < 0,
      })
      throw new Error(`Failed to adjust inventory for variant: ${variantId}. Current stock: ${variant.inventory_quantity}, adjustment: ${adjustment}`)
    }

    console.log('[INVENTORY MANAGER] Successfully adjusted inventory')
  }
}
