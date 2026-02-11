/**
 * Notification Provider Contract
 *
 * Abstract class for all notification channel providers.
 * Providers: SMTP/Email, SMS (Twilio, Netgsm), Push (FCM, OneSignal), etc.
 */
export abstract class NotificationProvider {
  /**
   * Unique identifier for the notification provider
   */
  abstract readonly name: string

  /**
   * Channel type this provider handles
   */
  abstract readonly channel: NotificationChannel

  /**
   * Send a notification
   */
  abstract send(notification: SendNotificationParams): Promise<NotificationResult>

  /**
   * Send bulk notifications
   */
  abstract sendBulk(notifications: SendNotificationParams[]): Promise<NotificationResult[]>

  /**
   * Check provider health / connectivity
   */
  abstract healthCheck(): Promise<{ healthy: boolean; message?: string }>
}

export type NotificationChannel = 'email' | 'sms' | 'push' | 'database'

export interface SendNotificationParams {
  to: string | string[]
  subject?: string
  body: string
  htmlBody?: string
  template?: string
  templateData?: Record<string, unknown>
  from?: string
  replyTo?: string
  attachments?: NotificationAttachment[]
  metadata?: Record<string, unknown>
}

export interface NotificationAttachment {
  filename: string
  content?: Buffer | string
  path?: string
  contentType?: string
}

export interface NotificationResult {
  success: boolean
  messageId: string | null
  provider: string
  channel: NotificationChannel
  errorMessage?: string
  errorCode?: string
}

/**
 * Notification Manager Contract
 *
 * Manages multiple notification providers and routes notifications
 * to the appropriate channel.
 */
export abstract class NotificationManager {
  /**
   * Register a notification provider for a channel
   */
  abstract registerProvider(provider: NotificationProvider): void

  /**
   * Send a notification through specified channel
   */
  abstract send(
    channel: NotificationChannel,
    notification: SendNotificationParams
  ): Promise<NotificationResult>

  /**
   * Send through multiple channels
   */
  abstract sendMultiChannel(
    channels: NotificationChannel[],
    notification: SendNotificationParams
  ): Promise<NotificationResult[]>

  /**
   * Get registered provider for a channel
   */
  abstract getProvider(channel: NotificationChannel): NotificationProvider | null
}
