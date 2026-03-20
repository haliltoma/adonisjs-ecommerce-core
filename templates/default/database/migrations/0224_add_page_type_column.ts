import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pages'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add page_type column if not exists
      table.string('page_type').defaultTo('custom').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('page_type')
    })
  }
}
