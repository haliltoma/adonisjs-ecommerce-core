import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'refunds'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE')
      table.decimal('amount', 12, 2).notNullable()
      table.string('reason').nullable()
      table.text('notes').nullable()
      table.enum('status', ['pending', 'processed', 'failed']).defaultTo('pending')
      table.integer('refunded_by').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
