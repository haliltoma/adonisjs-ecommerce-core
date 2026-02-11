import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_edits'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE')
      table.integer('created_by').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
      table.enum('status', ['created', 'requested', 'confirmed', 'declined', 'cancelled']).defaultTo('created')
      table.text('internal_note').nullable()
      table.decimal('difference_amount', 12, 2).defaultTo(0)
      table.jsonb('changes').defaultTo('[]')
      table.timestamp('requested_at').nullable()
      table.timestamp('confirmed_at').nullable()
      table.timestamp('declined_at').nullable()
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['store_id', 'order_id'])
      table.index(['status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
