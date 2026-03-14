import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'attributes'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('sort_order').defaultTo(0)
    })

    // Copy existing position values to sort_order
    this.defer(async (db) => {
      await db.rawQuery('UPDATE attributes SET sort_order = position WHERE position IS NOT NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('sort_order')
    })
  }
}
