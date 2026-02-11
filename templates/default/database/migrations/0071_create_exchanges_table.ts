import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exchanges'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE')
      table.uuid('return_id').nullable().references('id').inTable('returns').onDelete('SET NULL')
      table.enum('status', ['pending', 'completed', 'cancelled']).defaultTo('pending')
      table.decimal('difference_amount', 12, 2).defaultTo(0)
      table.enum('payment_status', ['not_paid', 'paid', 'refunded']).defaultTo('not_paid')
      table.text('note').nullable()
      table.jsonb('new_items').defaultTo('[]')
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['store_id', 'order_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
