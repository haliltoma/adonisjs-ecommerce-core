import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'draft_orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('display_id').notNullable()
      table.enum('status', ['open', 'completed', 'cancelled']).defaultTo('open')
      table.uuid('customer_id').nullable().references('id').inTable('customers').onDelete('SET NULL')
      table.string('email').nullable()
      table.uuid('region_id').nullable().references('id').inTable('regions').onDelete('SET NULL')
      table.string('currency_code', 3).notNullable().defaultTo('USD')
      table.jsonb('items').defaultTo('[]')
      table.jsonb('shipping_address').nullable()
      table.jsonb('billing_address').nullable()
      table.string('shipping_method').nullable()
      table.decimal('shipping_total', 12, 2).defaultTo(0)
      table.decimal('discount_total', 12, 2).defaultTo(0)
      table.decimal('tax_total', 12, 2).defaultTo(0)
      table.decimal('subtotal', 12, 2).defaultTo(0)
      table.decimal('grand_total', 12, 2).defaultTo(0)
      table.text('note').nullable()
      table.uuid('order_id').nullable().references('id').inTable('orders').onDelete('SET NULL')
      table.uuid('created_by').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('completed_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['store_id', 'display_id'])
      table.index(['store_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
