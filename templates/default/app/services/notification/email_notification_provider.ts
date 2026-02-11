import {
  NotificationProvider,
  type NotificationChannel,
  type SendNotificationParams,
  type NotificationResult,
} from '#contracts/notification_provider'
import logger from '@adonisjs/core/services/logger'
import { randomUUID } from 'node:crypto'

/**
 * Email Notification Provider
 *
 * Sends email notifications. Requires @adonisjs/mail to be installed
 * and configured. Falls back to logging when mail is not available.
 */
export class EmailNotificationProvider extends NotificationProvider {
  readonly name = 'email'
  readonly channel: NotificationChannel = 'email'

  private async getMailer(): Promise<any> {
    try {
      // @ts-ignore - @adonisjs/mail is an optional dependency
      const mod = await import('@adonisjs/mail/services/main')
      return mod.default
    } catch {
      return null
    }
  }

  async send(notification: SendNotificationParams): Promise<NotificationResult> {
    const messageId = randomUUID()

    try {
      const mail = await this.getMailer()
      if (!mail) {
        logger.warn('[EmailProvider] @adonisjs/mail not installed, skipping email send')
        return {
          success: false,
          messageId: null,
          provider: this.name,
          channel: this.channel,
          errorMessage: '@adonisjs/mail package is not installed',
        }
      }

      const recipients = Array.isArray(notification.to) ? notification.to : [notification.to]

      await mail.send((message: any) => {
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
      const mail = await this.getMailer()
      if (!mail) {
        return { healthy: false, message: '@adonisjs/mail is not installed' }
      }
      return { healthy: true, message: 'Email provider is configured' }
    } catch (error) {
      return { healthy: false, message: (error as Error).message }
    }
  }
}
