import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'currencies'

  async up() {
    const hasExchangeRate = await this.schema.hasColumn(this.tableName, 'exchange_rate')
    if (!hasExchangeRate) {
      this.schema.alterTable(this.tableName, (table) => {
        table.decimal('exchange_rate', 16, 8).nullable()
        table.string('base_currency', 3).nullable().defaultTo('USD')
        table.timestamp('rate_updated_at').nullable()
      })
    }
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('exchange_rate')
      table.dropColumn('base_currency')
      table.dropColumn('rate_updated_at')
    })
  }
}
