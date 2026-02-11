import type { JobContext } from '#contracts/queue_provider'
import logger from '@adonisjs/core/services/logger'

export interface SyncInventoryData {
  action: 'check_low_stock' | 'release_expired_reservations' | 'recalculate_stock'
  variantId?: string
  storeId?: string
}

/**
 * Sync Inventory Job
 *
 * Handles inventory-related background tasks like low stock checks
 * and reservation cleanup.
 * Queue: inventory
 */
export async function handleSyncInventory(job: JobContext): Promise<void> {
  const payload = job.data as SyncInventoryData

  logger.debug(`[SyncInventoryJob] Action: ${payload.action}`)

  try {
    await job.updateProgress(10)

    switch (payload.action) {
      case 'check_low_stock': {
        const ProductVariant = (await import('#models/product_variant')).default
        const commerceConfig = (await import('#config/commerce')).default
        const emitter = (await import('@adonisjs/core/services/emitter')).default

        const threshold = commerceConfig.inventory.lowStockThreshold
        const lowStockVariants = await ProductVariant.query()
          .where('stockQuantity', '<=', threshold)
          .where('stockQuantity', '>', 0)
          .where('trackInventory', true)
          .preload('product')

        for (const variant of lowStockVariants) {
          const { ProductLowStock } = await import('#events/product_events')
          await emitter.emit(ProductLowStock, new ProductLowStock(variant.product, variant, variant.stockQuantity, threshold))
        }

        const outOfStockVariants = await ProductVariant.query()
          .where('stockQuantity', '<=', 0)
          .where('trackInventory', true)
          .preload('product')

        for (const variant of outOfStockVariants) {
          const { ProductOutOfStock } = await import('#events/product_events')
          await emitter.emit(ProductOutOfStock, new ProductOutOfStock(variant.product, variant))
        }

        await job.updateProgress(80)
        logger.info(
          `[SyncInventoryJob] Low stock check complete: ${lowStockVariants.length} low, ${outOfStockVariants.length} out`
        )
        break
      }

      case 'release_expired_reservations': {
        const InventoryReservation = (await import('#models/inventory_reservation')).default
        const { DateTime } = await import('luxon')

        const expired = await InventoryReservation.query()
          .whereNotNull('expiresAt')
          .where('expiresAt', '<', DateTime.now().toSQL()!)

        for (const reservation of expired) {
          // Restore stock
          const ProductVariant = (await import('#models/product_variant')).default
          const variant = await ProductVariant.find(reservation.variantId)
          if (variant) {
            variant.stockQuantity += reservation.quantity
            await variant.save()
          }
          await reservation.delete()
        }

        await job.updateProgress(80)
        logger.info(`[SyncInventoryJob] Released ${expired.length} expired reservations`)
        break
      }

      case 'recalculate_stock': {
        if (payload.variantId) {
          const ProductVariant = (await import('#models/product_variant')).default
          const InventoryReservation = (await import('#models/inventory_reservation')).default

          const variant = await ProductVariant.findOrFail(payload.variantId)
          const reserved = await InventoryReservation.query()
            .where('variantId', variant.id)
            .where('status', 'reserved')
            .sum('quantity as total')
            .first()

          const reservedQty = Number(reserved?.$extras?.total || 0)
          // Update available stock based on reservations
          variant.stockQuantity = Math.max(0, variant.inventoryQuantity - reservedQty)
          await variant.save()
        }
        await job.updateProgress(80)
        break
      }
    }

    await job.updateProgress(100)
  } catch (error) {
    logger.error(`[SyncInventoryJob] Failed: ${(error as Error).message}`)
    throw error
  }
}
