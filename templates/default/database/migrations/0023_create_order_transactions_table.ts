import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE')
      table.enum('type', ['authorization', 'capture', 'refund', 'void']).notNullable()
      table.enum('status', ['pending', 'success', 'failed']).defaultTo('pending')
      table.decimal('amount', 12, 2).notNullable()
      table.string('currency_code').notNullable()
      table.string('payment_method').notNullable()
      table.string('gateway_transaction_id').nullable()
      table.jsonb('gateway_response').defaultTo('{}')
      table.string('error_message').nullable()
      table.timestamp('processed_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
