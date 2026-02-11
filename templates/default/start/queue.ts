/*
|--------------------------------------------------------------------------
| Queue Worker Registration
|--------------------------------------------------------------------------
|
| This file registers all queue workers and scheduled jobs.
| It is preloaded when the application starts in worker mode
| or can be imported manually.
|
*/

import { QueueProvider } from '#contracts/queue_provider'
import { resolveJobHandler } from '#jobs/index'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'
import commerceConfig from '#config/commerce'

/**
 * Boot queue workers for all defined queues.
 * Each queue gets a single worker that routes jobs to their handlers by name.
 */
export async function bootQueueWorkers() {
  const queue = await app.container.make(QueueProvider)
  const queueNames = Object.values(commerceConfig.queue.queues)

  for (const queueName of queueNames) {
    queue.process(queueName, async (job) => {
      const handler = await resolveJobHandler(job.name)
      if (!handler) {
        logger.warn(`[QueueWorker] No handler found for job "${job.name}" on queue "${queueName}"`)
        return
      }
      await handler(job)
    })
  }

  logger.info(`[QueueWorker] Workers booted for ${queueNames.length} queues: ${queueNames.join(', ')}`)
}

/**
 * Register scheduled (cron/repeating) jobs.
 * Only available when using BullMQ provider.
 */
export async function bootScheduledJobs() {
  if (commerceConfig.queue.driver !== 'bullmq') {
    logger.debug('[QueueWorker] Scheduled jobs skipped (not using BullMQ)')
    return
  }

  const queue = await app.container.make(QueueProvider)

  // Clean up abandoned carts — every 6 hours
  await queue.schedule(
    'cleanup-carts-scheduler',
    'scheduled',
    'cleanup-carts',
    {},
    '0 */6 * * *'
  )

  // Generate sitemap — every 6 hours
  await queue.schedule(
    'generate-sitemap-scheduler',
    'scheduled',
    'generate-sitemap',
    {},
    '0 1,7,13,19 * * *'
  )

  // Aggregate analytics — every 15 minutes
  await queue.schedule(
    'aggregate-analytics-scheduler',
    'analytics',
    'aggregate-analytics',
    {},
    '*/15 * * * *'
  )

  // Release expired inventory reservations — every 5 minutes
  await queue.schedule(
    'release-reservations-scheduler',
    'inventory',
    'sync-inventory',
    { action: 'release_expired_reservations' },
    '*/5 * * * *'
  )

  // Check low stock — daily at 8 AM
  await queue.schedule(
    'check-low-stock-scheduler',
    'inventory',
    'sync-inventory',
    { action: 'check_low_stock' },
    '0 8 * * *'
  )

  logger.info('[QueueWorker] Scheduled jobs registered')
}
