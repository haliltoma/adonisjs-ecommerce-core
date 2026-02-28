import type { JobContext } from '#contracts/queue_provider'
import logger from '@adonisjs/core/services/logger'

export interface ProcessOrderData {
  orderId: string
  action: 'confirm' | 'fulfill' | 'cancel' | 'refund' | 'send_invoice'
  metadata?: Record<string, unknown>
}

/**
 * Process Order Job
 *
 * Handles order-related background tasks.
 * Queue: orders
 */
export async function handleProcessOrder(job: JobContext): Promise<void> {
  const payload = job.data as ProcessOrderData

  logger.debug(`[ProcessOrderJob] Processing order ${payload.orderId}: ${payload.action}`)

  try {
    await job.updateProgress(10)

    const Order = (await import('#models/order')).default

    switch (payload.action) {
      case 'confirm': {
        const order = await Order.findOrFail(payload.orderId)
        // Send order confirmation email
        const { QueueProvider: QP } = await import('#contracts/queue_provider')
        const app = (await import('@adonisjs/core/services/app')).default
        const queue = await app.container.make(QP)
        await queue.dispatch({
          name: 'send-email',
          queue: 'emails',
          data: {
            to: order.email,
            subject: `Order Confirmed - #${order.orderNumber}`,
            template: 'order-confirmation',
            data: { order: order.serialize() },
          },
        })
        await job.updateProgress(80)
        break
      }

      case 'fulfill': {
        const order = await Order.findOrFail(payload.orderId)
        if (order.fulfillmentStatus !== 'fulfilled') {
          order.fulfillmentStatus = 'fulfilled'
          await order.save()
        }
        await job.updateProgress(80)
        break
      }

      case 'cancel': {
        const order = await Order.findOrFail(payload.orderId)
        // Restore inventory
        await order.load('items')
        for (const item of order.items) {
          if (item.variantId) {
            const Variant = (await import('#models/product_variant')).default
            const variant = await Variant.find(item.variantId)
            if (variant) {
              variant.stockQuantity += item.quantity
              await variant.save()
            }
          }
        }
        await job.updateProgress(80)
        break
      }

      case 'send_invoice': {
        const order = await Order.findOrFail(payload.orderId)
        await order.load('items')
        const { QueueProvider: QP } = await import('#contracts/queue_provider')
        const app = (await import('@adonisjs/core/services/app')).default
        const queue = await app.container.make(QP)
        await queue.dispatch({
          name: 'send-email',
          queue: 'emails',
          data: {
            to: order.email,
            subject: `Invoice - Order #${order.orderNumber}`,
            template: 'order-invoice',
            data: { order: order.serialize() },
          },
        })
        await job.updateProgress(80)
        break
      }

      default:
        logger.warn(`[ProcessOrderJob] Unknown action: ${payload.action}`)
    }

    await job.updateProgress(100)
    logger.info(`[ProcessOrderJob] Order ${payload.orderId} ${payload.action} completed`)
  } catch (error: unknown) {
    logger.error(
      `[ProcessOrderJob] Failed to process order ${payload.orderId}: ${(error as Error).message}`
    )
    throw error
  }
}
