import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_sales_channels'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE')
      table.uuid('sales_channel_id').references('id').inTable('sales_channels').onDelete('CASCADE')
      table.timestamp('created_at').notNullable()

      table.unique(['product_id', 'sales_channel_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
