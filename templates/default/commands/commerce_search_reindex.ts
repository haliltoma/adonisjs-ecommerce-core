import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class CommerceSearchReindex extends BaseCommand {
  static commandName = 'commerce:search-reindex'
  static description = 'Rebuild the search index for all products'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Starting search reindex...')

    try {
      const { SearchProvider } = await import('#contracts/search_provider')
      const Store = (await import('#models/store')).default
      const search = await this.app.container.make(SearchProvider)

      const stores = await Store.query().where('isActive', true)
      let processed = 0

      for (const store of stores) {
        await search.rebuildIndex(store.id)
        processed++
        this.logger.info(`  Reindexed store "${store.name}"`)
      }

      this.logger.success(`Search index rebuilt for ${processed} stores`)
    } catch (error) {
      this.logger.error(`Search reindex failed: ${(error as Error).message}`)
    }
  }
}
