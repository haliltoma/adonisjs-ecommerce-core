import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'refund_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('refund_id').references('id').inTable('refunds').onDelete('CASCADE')
      table.uuid('order_item_id').references('id').inTable('order_items').onDelete('CASCADE')
      table.integer('quantity').notNullable()
      table.decimal('amount', 12, 2).notNullable()
      table.boolean('restock').defaultTo(false)

      table.index(['refund_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
