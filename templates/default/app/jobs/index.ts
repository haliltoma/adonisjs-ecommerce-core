/**
 * Job Registry
 *
 * Maps job names to their handler functions.
 * Used by the queue worker to dispatch incoming jobs.
 */

import type { JobContext } from '#contracts/queue_provider'

type JobHandlerFn = (job: JobContext) => Promise<void>

const jobHandlers: Record<string, () => Promise<{ default?: JobHandlerFn; [key: string]: unknown }>> = {
  'send-email': () => import('#jobs/send_email_job'),
  'process-order': () => import('#jobs/process_order_job'),
  'sync-inventory': () => import('#jobs/sync_inventory_job'),
  'dispatch-webhook': () => import('#jobs/dispatch_webhook_job'),
  'process-import': () => import('#jobs/process_import_job'),
  'cleanup-carts': () => import('#jobs/cleanup_carts_job'),
  'generate-sitemap': () => import('#jobs/generate_sitemap_job'),
  'aggregate-analytics': () => import('#jobs/aggregate_analytics_job'),
}

const handlerFnNames: Record<string, string> = {
  'send-email': 'handleSendEmail',
  'process-order': 'handleProcessOrder',
  'sync-inventory': 'handleSyncInventory',
  'dispatch-webhook': 'handleDispatchWebhook',
  'process-import': 'handleProcessImport',
  'cleanup-carts': 'handleCleanupCarts',
  'generate-sitemap': 'handleGenerateSitemap',
  'aggregate-analytics': 'handleAggregateAnalytics',
}

/**
 * Resolve a job handler by name
 */
export async function resolveJobHandler(jobName: string): Promise<JobHandlerFn | null> {
  const loader = jobHandlers[jobName]
  if (!loader) return null

  const mod = await loader()
  const fnName = handlerFnNames[jobName]
  return (mod as Record<string, JobHandlerFn>)[fnName] || null
}

/**
 * Get all registered job names
 */
export function getRegisteredJobs(): string[] {
  return Object.keys(jobHandlers)
}
