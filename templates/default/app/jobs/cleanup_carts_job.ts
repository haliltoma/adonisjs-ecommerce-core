import type { JobContext } from '#contracts/queue_provider'
import logger from '@adonisjs/core/services/logger'

/**
 * Cleanup Carts Job
 *
 * Removes abandoned carts older than the configured session timeout.
 * Also emits CartAbandoned events for carts with items.
 * Queue: scheduled
 */
export async function handleCleanupCarts(job: JobContext): Promise<void> {
  logger.debug('[CleanupCartsJob] Starting cart cleanup')

  try {
    await job.updateProgress(10)

    const Cart = (await import('#models/cart')).default
    const commerceConfig = (await import('#config/commerce')).default
    const { DateTime } = await import('luxon')
    const emitter = (await import('@adonisjs/core/services/emitter')).default

    const cutoff = DateTime.now().minus({ days: commerceConfig.cart.sessionTimeout })

    // Find abandoned carts with items (for notification)
    const abandonedCarts = await Cart.query()
      .where('updatedAt', '<', cutoff.toSQL()!)
      .whereNull('completedAt')
      .preload('items')

    let abandoned = 0
    let cleaned = 0

    for (const cart of abandonedCarts) {
      if (cart.items.length > 0) {
        // Emit abandoned event before cleanup
        try {
          const { CartAbandoned } = await import('#events/cart_events')
          await emitter.emit(CartAbandoned, new CartAbandoned(cart))
          abandoned++
        } catch {
          // Event emission is best-effort
        }
      }

      // Delete cart and items
      await cart.related('items').query().delete()
      await cart.delete()
      cleaned++
    }

    await job.updateProgress(100)
    logger.info(`[CleanupCartsJob] Cleaned ${cleaned} carts, ${abandoned} abandoned notifications sent`)
  } catch (error) {
    logger.error(`[CleanupCartsJob] Failed: ${(error as Error).message}`)
    throw error
  }
}
