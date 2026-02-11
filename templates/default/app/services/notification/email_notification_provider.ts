import {
  NotificationProvider,
  type NotificationChannel,
  type SendNotificationParams,
  type NotificationResult,
} from '#contracts/notification_provider'
import mail from '@adonisjs/core/services/mail'
import logger from '@adonisjs/core/services/logger'
import { randomUUID } from 'node:crypto'

/**
 * Email Notification Provider
 *
 * Sends email notifications via AdonisJS Mail (SMTP/SES/Mailgun).
 * Supports Edge template rendering and HTML body.
 */
export class EmailNotificationProvider extends NotificationProvider {
  readonly name = 'email'
  readonly channel: NotificationChannel = 'email'

  async send(notification: SendNotificationParams): Promise<NotificationResult> {
    const messageId = randomUUID()

    try {
      const recipients = Array.isArray(notification.to) ? notification.to : [notification.to]

      await mail.send((message) => {
        for (const to of recipients) {
          message.to(to)
        }

        if (notification.subject) {
          message.subject(notification.subject)
        }

        if (notification.from) {
          message.from(notification.from)
        }

        if (notification.replyTo) {
          message.replyTo(notification.replyTo)
        }

        // Use Edge template if specified
        if (notification.template) {
          message.htmlView(`emails/${notification.template}`, {
            ...notification.templateData,
            storeName: process.env.STORE_NAME || 'AdonisCommerce',
            storeUrl: process.env.APP_URL || '',
            storeEmail: process.env.STORE_EMAIL || '',
            currentYear: new Date().getFullYear(),
          })
        } else if (notification.htmlBody) {
          message.html(notification.htmlBody)
        } else {
          message.text(notification.body)
        }

        // Add attachments
        if (notification.attachments) {
          for (const attachment of notification.attachments) {
            if (attachment.path) {
              message.attach(attachment.path, { filename: attachment.filename })
            } else if (attachment.content) {
              message.attachData(
                typeof attachment.content === 'string'
                  ? Buffer.from(attachment.content)
                  : attachment.content,
                { filename: attachment.filename, contentType: attachment.contentType }
              )
            }
          }
        }
      })

      return {
        success: true,
        messageId,
        provider: this.name,
        channel: this.channel,
      }
    } catch (error) {
      logger.error(`[EmailProvider] Failed to send email: ${(error as Error).message}`)
      return {
        success: false,
        messageId: null,
        provider: this.name,
        channel: this.channel,
        errorMessage: (error as Error).message,
      }
    }
  }

  async sendBulk(notifications: SendNotificationParams[]): Promise<NotificationResult[]> {
    const results = await Promise.allSettled(
      notifications.map((n) => this.send(n))
    )

    return results.map((r) =>
      r.status === 'fulfilled'
        ? r.value
        : {
            success: false,
            messageId: null,
            provider: this.name,
            channel: this.channel as NotificationChannel,
            errorMessage: r.reason?.message || 'Unknown error',
          }
    )
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      // Basic check — verify mail config exists
      const mailer = mail.use()
      return { healthy: !!mailer, message: 'Email provider is configured' }
    } catch (error) {
      return { healthy: false, message: (error as Error).message }
    }
  }
}
