import { BaseCommand } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class CommerceCacheClear extends BaseCommand {
  static commandName = 'commerce:cache-clear'
  static description = 'Clear all commerce cache data'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    try {
      const { CacheProvider } = await import('#contracts/cache_provider')
      const cache = await this.app.container.make(CacheProvider)
      await cache.flush()
      this.logger.success('Commerce cache cleared successfully')
    } catch {
      // Fall back to Redis direct flush
      try {
        const redis = await import('@adonisjs/redis/services/main')
        await redis.default.flushdb()
        this.logger.success('Redis cache cleared successfully')
      } catch {
        this.logger.warning('No cache provider available. Skipping cache clear.')
      }
    }
  }
}
