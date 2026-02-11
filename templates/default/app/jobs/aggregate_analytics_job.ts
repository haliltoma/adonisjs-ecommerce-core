import type { JobContext } from '#contracts/queue_provider'
import logger from '@adonisjs/core/services/logger'

/**
 * Aggregate Analytics Job
 *
 * Computes and caches daily analytics summaries.
 * Queue: analytics
 */
export async function handleAggregateAnalytics(job: JobContext): Promise<void> {
  logger.debug('[AnalyticsJob] Aggregating analytics data')

  try {
    await job.updateProgress(10)

    const Order = (await import('#models/order')).default
    const { DateTime } = await import('luxon')

    const today = DateTime.now().startOf('day')
    const yesterday = today.minus({ days: 1 })

    // Today's metrics
    const todayOrders = await Order.query()
      .where('createdAt', '>=', today.toSQL()!)
      .where('status', '!=', 'cancelled')

    const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.grandTotal || 0), 0)
    const todayCount = todayOrders.length

    await job.updateProgress(30)

    // Yesterday's metrics for comparison
    const yesterdayOrders = await Order.query()
      .where('createdAt', '>=', yesterday.toSQL()!)
      .where('createdAt', '<', today.toSQL()!)
      .where('status', '!=', 'cancelled')

    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + Number(o.grandTotal || 0), 0)
    const yesterdayCount = yesterdayOrders.length

    await job.updateProgress(50)

    // New customers today
    const User = (await import('#models/user')).default
    const newCustomersToday = await User.query()
      .where('createdAt', '>=', today.toSQL()!)
      .where('role', 'customer')
      .count('* as total')
      .first()

    await job.updateProgress(70)

    // Store in cache
    const { CacheProvider } = await import('#contracts/cache_provider')
    const appService = (await import('@adonisjs/core/services/app')).default

    try {
      const cache = await appService.container.make(CacheProvider)
      await cache.set(
        'analytics:daily_summary',
        JSON.stringify({
          date: today.toISODate(),
          revenue: { today: todayRevenue, yesterday: yesterdayRevenue },
          orders: { today: todayCount, yesterday: yesterdayCount },
          newCustomers: Number(newCustomersToday?.$extras?.total || 0),
          aov: todayCount > 0 ? todayRevenue / todayCount : 0,
          updatedAt: DateTime.now().toISO(),
        }),
        900 // 15 min TTL
      )
    } catch {
      // Cache is optional
    }

    await job.updateProgress(100)
    logger.info(
      `[AnalyticsJob] Daily summary: ${todayCount} orders, $${todayRevenue.toFixed(2)} revenue`
    )
  } catch (error) {
    logger.error(`[AnalyticsJob] Failed: ${(error as Error).message}`)
    throw error
  }
}
