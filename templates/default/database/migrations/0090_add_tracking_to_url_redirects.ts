import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'url_redirects'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('hit_count').defaultTo(0)
      table.timestamp('last_hit_at').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('hit_count')
      table.dropColumn('last_hit_at')
    })
  }
}
