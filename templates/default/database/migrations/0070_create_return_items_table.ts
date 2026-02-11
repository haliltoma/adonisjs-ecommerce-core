import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'return_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('return_id').references('id').inTable('returns').onDelete('CASCADE')
      table.uuid('order_item_id').references('id').inTable('order_items').onDelete('CASCADE')
      table.uuid('return_reason_id').nullable().references('id').inTable('return_reasons').onDelete('SET NULL')
      table.integer('quantity').notNullable()
      table.integer('received_quantity').defaultTo(0)
      table.text('note').nullable()
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['return_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
