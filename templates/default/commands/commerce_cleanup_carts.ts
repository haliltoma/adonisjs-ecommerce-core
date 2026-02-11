import { BaseCommand, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class CommerceCleanupCarts extends BaseCommand {
  static commandName = 'commerce:cleanup-carts'
  static description = 'Remove expired and abandoned carts'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.number({ description: 'Days after which to consider a cart abandoned', default: 7 })
  declare days: number

  async run() {
    const days = this.days || 7
    this.logger.info(`Cleaning up carts older than ${days} days...`)

    const { DateTime } = await import('luxon')
    const Cart = (await import('#models/cart')).default

    const cutoff = DateTime.now().minus({ days })

    // Delete old carts that haven't been updated
    const deleted = await Cart.query()
      .where('updatedAt', '<', cutoff.toISO()!)
      .whereNull('completedAt')
      .delete()

    this.logger.success(`Deleted ${deleted[0] ?? 0} expired carts`)
  }
}
