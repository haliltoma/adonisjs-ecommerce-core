import { BaseCommand, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class CommerceDailyAnalytics extends BaseCommand {
  static commandName = 'commerce:daily-analytics'
  static description = 'Aggregate daily analytics metrics for all stores'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string({ description: 'Date to aggregate (YYYY-MM-DD format). Defaults to yesterday.' })
  declare date: string

  async run() {
    const { DateTime } = await import('luxon')
    const AnalyticsService = (await import('#services/analytics_service')).default
    const Store = (await import('#models/store')).default

    const targetDate = this.date
      ? DateTime.fromFormat(this.date, 'yyyy-MM-dd')
      : DateTime.now().minus({ days: 1 })

    if (!targetDate.isValid) {
      this.logger.error('Invalid date format. Use YYYY-MM-DD.')
      return
    }

    this.logger.info(`Aggregating analytics for ${targetDate.toFormat('yyyy-MM-dd')}...`)

    const stores = await Store.query().where('isActive', true)
    const analytics = new AnalyticsService()

    let processed = 0
    for (const store of stores) {
      try {
        await analytics.aggregateDailyAnalytics(store.id, targetDate)
        processed++
      } catch (error) {
        this.logger.error(`Failed for store "${store.name}": ${(error as Error).message}`)
      }
    }

    this.logger.success(`Daily analytics aggregated for ${processed}/${stores.length} stores`)
  }
}
