import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'

/**
 * Start queue workers to process background jobs.
 *
 * Usage:
 *   node ace commerce:queue:work
 *   node ace commerce:queue:work --queue=emails --queue=orders
 *   node ace commerce:queue:work --scheduled
 */
export default class CommerceQueueWork extends BaseCommand {
  static commandName = 'commerce:queue:work'
  static description = 'Start queue workers to process background jobs'

  static options: CommandOptions = {
    startApp: true,
    staysAlive: true,
  }

  @flags.array({ description: 'Specific queues to process (default: all)' })
  declare queue: string[]

  @flags.boolean({ description: 'Also register scheduled/cron jobs' })
  declare scheduled: boolean

  async run() {
    const { bootQueueWorkers, bootScheduledJobs } = await import('#start/queue')

    this.logger.info('Starting queue workers...')

    await bootQueueWorkers()

    if (this.scheduled !== false) {
      await bootScheduledJobs()
    }

    this.logger.success('Queue workers are running. Press Ctrl+C to stop.')

    // Keep process alive
    process.on('SIGINT', async () => {
      this.logger.info('Shutting down queue workers...')
      const { QueueProvider } = await import('#contracts/queue_provider')
      const queue = await this.app.container.make(QueueProvider)
      await queue.shutdown()
      this.logger.success('Queue workers stopped.')
      process.exit(0)
    })

    process.on('SIGTERM', async () => {
      this.logger.info('SIGTERM received, shutting down...')
      const { QueueProvider } = await import('#contracts/queue_provider')
      const queue = await this.app.container.make(QueueProvider)
      await queue.shutdown()
      process.exit(0)
    })
  }
}
