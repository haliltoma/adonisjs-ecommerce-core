import {
  WebhookDispatcher,
  type DispatchWebhookParams,
  type WebhookDispatchResult,
} from '#contracts/webhook_provider'
import Webhook from '#models/webhook'
import WebhookLog from '#models/webhook_log'
import { randomUUID } from 'node:crypto'
import { createHmac } from 'node:crypto'
import logger from '@adonisjs/core/services/logger'

/**
 * HTTP Webhook Dispatcher
 *
 * Dispatches webhooks to registered endpoints via HTTP POST.
 * Signs payloads with HMAC-SHA256 for verification.
 */
export class HttpWebhookDispatcher extends WebhookDispatcher {
  async dispatch(params: DispatchWebhookParams): Promise<WebhookDispatchResult[]> {
    const webhooks = await Webhook.query()
      .where('storeId', params.storeId)
      .where('isActive', true)

    // Filter webhooks that are subscribed to this event
    const matchingWebhooks = webhooks.filter((webhook) => {
      const events = webhook.events as string[]
      return events.includes(params.event) || events.includes('*')
    })

    if (matchingWebhooks.length === 0) {
      return []
    }

    const results = await Promise.allSettled(
      matchingWebhooks.map((webhook) => this.sendWebhook(webhook, params))
    )

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      }
      return {
        webhookId: matchingWebhooks[index].id,
        success: false,
        statusCode: null,
        responseBody: null,
        durationMs: 0,
        errorMessage: result.reason?.message || 'Unknown error',
      }
    })
  }

  async retry(webhookLogId: string): Promise<WebhookDispatchResult> {
    const log = await WebhookLog.query()
      .where('id', webhookLogId)
      .preload('webhook')
      .firstOrFail()

    const webhook = log.webhook

    return this.sendWebhook(webhook, {
      storeId: webhook.storeId,
      event: log.event,
      payload: log.payload as Record<string, unknown>,
    })
  }

  generateSignature(payload: string, secret: string): string {
    return createHmac('sha256', secret).update(payload).digest('hex')
  }

  private async sendWebhook(
    webhook: Webhook,
    params: DispatchWebhookParams
  ): Promise<WebhookDispatchResult> {
    const start = Date.now()
    const payloadString = JSON.stringify(params.payload)
    const signature = webhook.secret
      ? this.generateSignature(payloadString, webhook.secret)
      : undefined

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Event': params.event,
      'X-Webhook-Id': webhook.id,
      ...(signature ? { 'X-Webhook-Signature': `sha256=${signature}` } : {}),
      ...(webhook.headers || {}),
    }

    let statusCode: number | null = null
    let responseBody: string | null = null
    let success = false
    let errorMessage: string | undefined

    try {
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers,
        body: payloadString,
        signal: AbortSignal.timeout(30000),
      })

      statusCode = response.status
      responseBody = await response.text().catch(() => null)
      success = response.ok

      if (!success) {
        errorMessage = `HTTP ${statusCode}: ${responseBody?.substring(0, 200)}`
      }
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : 'Network error'
      logger.error(`[Webhook] Failed to deliver to ${webhook.url}: ${errorMessage}`)
    }

    const durationMs = Date.now() - start

    // Log the webhook delivery attempt
    await WebhookLog.create({
      id: randomUUID(),
      webhookId: webhook.id,
      event: params.event,
      payload: params.payload,
      responseStatus: statusCode,
      responseBody: responseBody?.substring(0, 5000),
      status: success ? 'success' : 'failed',
      attempts: 1,
    }).catch((err) => {
      logger.error(`[Webhook] Failed to log delivery: ${err.message}`)
    })

    // Update webhook last triggered
    const { DateTime } = await import('luxon')
    webhook.lastTriggeredAt = DateTime.now()
    if (!success) {
      webhook.retryCount = (webhook.retryCount || 0) + 1
    }
    await webhook.save().catch(() => {})

    return {
      webhookId: webhook.id,
      success,
      statusCode,
      responseBody,
      durationMs,
      errorMessage,
    }
  }
}
