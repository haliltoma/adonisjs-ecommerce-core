import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Show the status of all queues.
 *
 * Usage:
 *   node ace commerce:queue:status
 */
export default class CommerceQueueStatus extends BaseCommand {
  static commandName = 'commerce:queue:status'
  static description = 'Show queue metrics and job counts'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    const { QueueProvider } = await import('#contracts/queue_provider')
    const commerceConfig = (await import('#config/commerce')).default
    const queue = await this.app.container.make(QueueProvider)

    const queueNames = Object.values(commerceConfig.queue.queues)

    this.logger.info(`Queue Driver: ${commerceConfig.queue.driver}`)
    this.logger.info('')

    const table = this.ui.table()
    table.head(['Queue', 'Waiting', 'Active', 'Completed', 'Failed', 'Delayed', 'Paused'])

    for (const queueName of queueNames) {
      try {
        const metrics = await queue.getQueueMetrics(queueName)
        table.row([
          queueName,
          String(metrics.waiting),
          String(metrics.active),
          String(metrics.completed),
          String(metrics.failed),
          String(metrics.delayed),
          metrics.paused ? 'Yes' : 'No',
        ])
      } catch {
        table.row([queueName, '-', '-', '-', '-', '-', '-'])
      }
    }

    table.render()

    await queue.shutdown()
  }
}
