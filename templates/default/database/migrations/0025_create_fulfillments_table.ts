import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'fulfillments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE')
      table.string('tracking_number').nullable()
      table.string('tracking_url').nullable()
      table.string('carrier').nullable()
      table.string('carrier_name').nullable()
      table.enum('status', ['pending', 'shipped', 'in_transit', 'delivered', 'failed', 'returned']).defaultTo('pending')
      table.timestamp('shipped_at').nullable()
      table.timestamp('delivered_at').nullable()
      table.text('notes').nullable()
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
