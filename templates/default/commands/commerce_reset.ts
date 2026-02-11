import { BaseCommand, flags } from '@adonisjs/core/ace'
import { CommandOptions } from '@adonisjs/core/types/ace'

export default class CommerceReset extends BaseCommand {
  static commandName = 'commerce:reset'
  static description = 'Reset all commerce data (development only)'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.boolean({ description: 'Skip confirmation prompt', alias: ['y'] })
  declare force: boolean

  async run() {
    const app = this.app

    if (app.inProduction) {
      this.logger.error('This command cannot be run in production!')
      return
    }

    if (!this.force) {
      const confirm = await this.prompt.confirm(
        'This will DELETE ALL commerce data. Are you sure?',
        { default: false }
      )
      if (!confirm) {
        this.logger.info('Operation cancelled')
        return
      }
    }

    this.logger.info('Resetting database...')

    await this.kernel.exec('migration:rollback', ['--batch=0'])
    this.logger.info('Migrations rolled back')

    await this.kernel.exec('migration:run', [])
    this.logger.info('Migrations re-run')

    const seedData = await this.prompt.confirm('Seed demo data?', { default: true })
    if (seedData) {
      await this.kernel.exec('db:seed', [])
      this.logger.info('Demo data seeded')
    }

    this.logger.success('Commerce data reset complete')
  }
}
