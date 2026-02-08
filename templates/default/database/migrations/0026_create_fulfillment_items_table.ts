import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fulfillment_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('fulfillment_id').references('id').inTable('fulfillments').onDelete('CASCADE')
      table.uuid('order_item_id').references('id').inTable('order_items').onDelete('CASCADE')
      table.integer('quantity').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
