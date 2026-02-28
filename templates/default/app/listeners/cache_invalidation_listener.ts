import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import { CacheProvider } from '#contracts/cache_provider'
import type {
  ProductCreated,
  ProductUpdated,
  ProductDeleted,
} from '#events/product_events'
import type {
  OrderCreated,
  OrderStatusChanged,
} from '#events/order_events'
import type { InventoryAdjusted } from '#events/inventory_events'

/**
 * Cache Invalidation Listener
 *
 * Listens to domain events and invalidates relevant cache entries.
 * Uses pattern-based deletion and tagged cache for group invalidation.
 */
export default class CacheInvalidationListener {
  private async getCache(): Promise<CacheProvider> {
    return app.container.make(CacheProvider)
  }

  // ── Product Cache Invalidation ──────────────────────────

  async handleProductCreated(event: ProductCreated) {
    try {
      const cache = await this.getCache()
      const storeId = event.product.storeId

      await Promise.all([
        cache.deletePattern(`store:${storeId}:products:*`),
        cache.deletePattern(`store:${storeId}:categories:*`),
        cache.deletePattern(`store:${storeId}:navigation`),
      ])

      if (event.product.isFeatured) {
        await cache.deletePattern(`store:${storeId}:products:featured`)
      }
    } catch (error: unknown) {
      logger.error({ err: error }, 'Cache invalidation failed: ProductCreated')
    }
  }

  async handleProductUpdated(event: ProductUpdated) {
    try {
      const cache = await this.getCache()
      const product = event.product
      const storeId = product.storeId

      // Always invalidate the specific product
      await cache.delete(`store:${storeId}:product:${product.slug}`)
      await cache.delete(`store:${storeId}:product:${product.id}`)

      // Invalidate listings for price/status/feature changes
      const listingKeys = Object.keys(event.changes)
      const affectsListings = ['status', 'price', 'compareAtPrice', 'isFeatured', 'title', 'sortOrder'].some(
        (k) => listingKeys.includes(k)
      )

      if (affectsListings) {
        await cache.deletePattern(`store:${storeId}:products:*`)
      }

      if ('isFeatured' in event.changes) {
        await cache.deletePattern(`store:${storeId}:products:featured`)
      }
    } catch (error: unknown) {
      logger.error({ err: error }, 'Cache invalidation failed: ProductUpdated')
    }
  }

  async handleProductDeleted(event: ProductDeleted) {
    try {
      const cache = await this.getCache()
      const storeId = event.product.storeId

      await Promise.all([
        cache.delete(`store:${storeId}:product:${event.product.slug}`),
        cache.delete(`store:${storeId}:product:${event.product.id}`),
        cache.deletePattern(`store:${storeId}:products:*`),
        cache.deletePattern(`store:${storeId}:categories:*`),
      ])
    } catch (error: unknown) {
      logger.error({ err: error }, 'Cache invalidation failed: ProductDeleted')
    }
  }

  // ── Order Cache Invalidation ────────────────────────────

  async handleOrderCreated(event: OrderCreated) {
    try {
      const cache = await this.getCache()
      const storeId = event.order.storeId

      await cache.deletePattern(`store:${storeId}:analytics:*`)

      if (event.customer) {
        await cache.deletePattern(`store:${storeId}:orders:customer:${event.customer.id}:*`)
      }
    } catch (error: unknown) {
      logger.error({ err: error }, 'Cache invalidation failed: OrderCreated')
    }
  }

  async handleOrderStatusChanged(event: OrderStatusChanged) {
    try {
      const cache = await this.getCache()
      const storeId = event.order.storeId

      await Promise.all([
        cache.delete(`store:${storeId}:order:${event.order.id}`),
        cache.deletePattern(`store:${storeId}:analytics:*`),
        cache.deletePattern(`store:${storeId}:orders:customer:${event.order.customerId}:*`),
      ])
    } catch (error: unknown) {
      logger.error({ err: error }, 'Cache invalidation failed: OrderStatusChanged')
    }
  }

  // ── Inventory Cache Invalidation ────────────────────────

  async handleInventoryAdjusted(_event: InventoryAdjusted) {
    try {
      const cache = await this.getCache()

      // Invalidate product cache since stock affects availability display
      await cache.deletePattern(`store:*:product:*`)
      await cache.deletePattern(`store:*:products:*`)
    } catch (error: unknown) {
      logger.error({ err: error }, 'Cache invalidation failed: InventoryAdjusted')
    }
  }
}
