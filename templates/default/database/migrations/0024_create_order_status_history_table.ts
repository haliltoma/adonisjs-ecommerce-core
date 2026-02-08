import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_status_history'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE')
      table.string('status').notNullable()
      table.string('previous_status').nullable()
      table.enum('type', ['status_change', 'note', 'payment', 'fulfillment', 'refund', 'system']).defaultTo('status_change')
      table.string('title').notNullable()
      table.text('description').nullable()
      table.integer('user_id').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.boolean('is_customer_notified').defaultTo(false)
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
