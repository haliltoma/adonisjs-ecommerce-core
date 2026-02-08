import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'carts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.uuid('customer_id').nullable().references('id').inTable('customers').onDelete('SET NULL')
      table.string('session_id').nullable()
      table.string('email').nullable()
      table.string('currency_code').defaultTo('TRY')
      table.decimal('subtotal', 12, 2).defaultTo(0)
      table.decimal('discount_total', 12, 2).defaultTo(0)
      table.decimal('tax_total', 12, 2).defaultTo(0)
      table.decimal('shipping_total', 12, 2).defaultTo(0)
      table.decimal('grand_total', 12, 2).defaultTo(0)
      table.integer('total_items').defaultTo(0)
      table.integer('total_quantity').defaultTo(0)
      table.string('coupon_code').nullable()
      table.uuid('discount_id').nullable().references('id').inTable('discounts').onDelete('SET NULL')
      table.uuid('billing_address_id').nullable().references('id').inTable('customer_addresses').onDelete('SET NULL')
      table.uuid('shipping_address_id').nullable().references('id').inTable('customer_addresses').onDelete('SET NULL')
      table.string('shipping_method').nullable()
      table.string('payment_method').nullable()
      table.text('notes').nullable()
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('completed_at').nullable()
      table.timestamp('expires_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['store_id', 'session_id'])
      table.index(['store_id', 'customer_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
