/**
 * Webhook Provider Contract
 *
 * Abstract class for dispatching webhooks to external systems.
 */
export abstract class WebhookDispatcher {
  /**
   * Dispatch a webhook event to registered endpoints
   */
  abstract dispatch(params: DispatchWebhookParams): Promise<WebhookDispatchResult[]>

  /**
   * Retry a failed webhook delivery
   */
  abstract retry(webhookLogId: string): Promise<WebhookDispatchResult>

  /**
   * Verify a webhook signature
   */
  abstract generateSignature(payload: string, secret: string): string
}

export interface DispatchWebhookParams {
  storeId: string
  event: string
  payload: Record<string, unknown>
}

export interface WebhookDispatchResult {
  webhookId: string
  success: boolean
  statusCode: number | null
  responseBody: string | null
  durationMs: number
  errorMessage?: string
}
