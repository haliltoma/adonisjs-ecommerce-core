import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'daily_analytics'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.date('date').notNullable()
      table.integer('total_orders').defaultTo(0)
      table.decimal('total_revenue', 12, 2).defaultTo(0)
      table.integer('total_customers').defaultTo(0)
      table.integer('new_customers').defaultTo(0)
      table.decimal('average_order_value', 12, 2).defaultTo(0)
      table.integer('total_items_sold').defaultTo(0)
      table.decimal('total_refunds', 12, 2).defaultTo(0)
      table.jsonb('top_products').defaultTo('[]')
      table.decimal('conversion_rate', 5, 4).defaultTo(0)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['store_id', 'date'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
