import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'customer_groups'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.decimal('discount_percentage', 5, 2).defaultTo(0)
      table.boolean('is_default').defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('discount_percentage')
      table.dropColumn('is_default')
    })
  }
}
