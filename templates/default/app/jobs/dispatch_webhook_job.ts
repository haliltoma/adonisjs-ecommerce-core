import type { JobContext } from '#contracts/queue_provider'
import logger from '@adonisjs/core/services/logger'
import { createHmac } from 'node:crypto'

export interface DispatchWebhookData {
  webhookId: string
  url: string
  secret: string
  event: string
  payload: Record<string, unknown>
  deliveryId?: string
}

/**
 * Dispatch Webhook Job
 *
 * Sends webhook payloads to registered endpoints with HMAC-SHA256 signing.
 * Queue: webhooks
 */
export async function handleDispatchWebhook(job: JobContext): Promise<void> {
  const payload = job.data as DispatchWebhookData

  logger.debug(`[WebhookJob] Dispatching "${payload.event}" to ${payload.url}`)

  try {
    await job.updateProgress(10)

    const body = JSON.stringify(payload.payload)
    const signature = createHmac('sha256', payload.secret).update(body).digest('hex')
    const deliveryId = payload.deliveryId || job.id

    const response = await fetch(payload.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Event': payload.event,
        'X-Webhook-Signature': `sha256=${signature}`,
        'X-Webhook-Id': deliveryId,
        'User-Agent': 'AdonisCommerce-Webhook/1.0',
      },
      body,
      signal: AbortSignal.timeout(30_000),
    })

    await job.updateProgress(80)

    // Log delivery result
    if (payload.deliveryId) {
      try {
        const WebhookLog = (await import('#models/webhook_log')).default
        const log = await WebhookLog.find(payload.deliveryId)
        if (log) {
          log.responseStatus = response.status
          log.responseBody = await response.text().catch(() => '')
          log.attempts = job.attemptsMade
          log.status = response.ok ? 'success' : 'failed'
          await log.save()
        }
      } catch {
        // Delivery logging is best-effort
      }
    }

    if (!response.ok) {
      throw new Error(`Webhook returned ${response.status}: ${response.statusText}`)
    }

    await job.updateProgress(100)
    logger.info(`[WebhookJob] Webhook "${payload.event}" delivered to ${payload.url} (${response.status})`)
  } catch (error: unknown) {
    logger.error(`[WebhookJob] Failed to deliver webhook to ${payload.url}: ${(error as Error).message}`)
    throw error
  }
}
