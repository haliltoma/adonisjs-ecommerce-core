import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'claims'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE')
      table.enum('type', ['replace', 'refund']).notNullable()
      table.enum('status', ['pending', 'processing', 'completed', 'cancelled']).defaultTo('pending')
      table.decimal('refund_amount', 12, 2).nullable()
      table.text('note').nullable()
      table.text('internal_note').nullable()
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
