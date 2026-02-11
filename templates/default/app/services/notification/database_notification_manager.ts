import {
  NotificationManager,
  NotificationProvider,
  type NotificationChannel,
  type SendNotificationParams,
  type NotificationResult,
} from '#contracts/notification_provider'
import Notification from '#models/notification'
import { randomUUID } from 'node:crypto'
import logger from '@adonisjs/core/services/logger'

/**
 * Database Notification Manager
 *
 * Default notification manager that stores notifications in the database.
 * Can be extended with email/SMS/push providers.
 */
export class DatabaseNotificationManager extends NotificationManager {
  private providers = new Map<NotificationChannel, NotificationProvider>()

  registerProvider(provider: NotificationProvider): void {
    this.providers.set(provider.channel, provider)
  }

  async send(
    channel: NotificationChannel,
    notification: SendNotificationParams
  ): Promise<NotificationResult> {
    // Always store in database
    if (channel === 'database') {
      return this.storeInDatabase(notification)
    }

    // Check if we have a provider for this channel
    const provider = this.providers.get(channel)
    if (provider) {
      return provider.send(notification)
    }

    // Fallback to database storage
    logger.warn(`No provider registered for channel "${channel}", falling back to database`)
    return this.storeInDatabase(notification)
  }

  async sendMultiChannel(
    channels: NotificationChannel[],
    notification: SendNotificationParams
  ): Promise<NotificationResult[]> {
    const results = await Promise.allSettled(
      channels.map((channel) => this.send(channel, notification))
    )

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      }
      return {
        success: false,
        messageId: null,
        provider: 'unknown',
        channel: channels[index],
        errorMessage: result.reason?.message || 'Unknown error',
      }
    })
  }

  getProvider(channel: NotificationChannel): NotificationProvider | null {
    return this.providers.get(channel) || null
  }

  private async storeInDatabase(notification: SendNotificationParams): Promise<NotificationResult> {
    try {
      const id = randomUUID()
      await Notification.create({
        id,
        userId: null,
        type: notification.template || 'general',
        title: notification.subject || 'Notification',
        message: notification.body,
        data: notification.metadata || {},
        channel: 'database',
        isRead: false,
      })

      return {
        success: true,
        messageId: id,
        provider: 'database',
        channel: 'database',
      }
    } catch (error) {
      return {
        success: false,
        messageId: null,
        provider: 'database',
        channel: 'database',
        errorMessage: error instanceof Error ? error.message : 'Failed to store notification',
      }
    }
  }
}
