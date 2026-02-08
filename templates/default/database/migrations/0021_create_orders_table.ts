import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('order_number').unique().notNullable()
      table.uuid('customer_id').nullable().references('id').inTable('customers').onDelete('SET NULL')
      table.string('email').notNullable()
      table.string('phone').nullable()
      table.enum('status', ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded']).defaultTo('pending')
      table.enum('payment_status', ['pending', 'authorized', 'paid', 'partially_refunded', 'refunded', 'failed', 'voided']).defaultTo('pending')
      table.enum('fulfillment_status', ['unfulfilled', 'partially_fulfilled', 'fulfilled', 'returned', 'partially_returned']).defaultTo('unfulfilled')
      table.string('currency_code').notNullable()
      table.decimal('subtotal', 12, 2).notNullable()
      table.decimal('discount_total', 12, 2).defaultTo(0)
      table.decimal('tax_total', 12, 2).defaultTo(0)
      table.decimal('shipping_total', 12, 2).defaultTo(0)
      table.decimal('grand_total', 12, 2).notNullable()
      table.decimal('total_paid', 12, 2).defaultTo(0)
      table.decimal('total_refunded', 12, 2).defaultTo(0)
      table.string('coupon_code').nullable()
      table.uuid('discount_id').nullable().references('id').inTable('discounts').onDelete('SET NULL')
      table.jsonb('billing_address').notNullable()
      table.jsonb('shipping_address').notNullable()
      table.string('shipping_method').nullable()
      table.string('shipping_method_title').nullable()
      table.string('payment_method').nullable()
      table.string('payment_method_title').nullable()
      table.text('notes').nullable()
      table.text('internal_notes').nullable()
      table.jsonb('metadata').defaultTo('{}')
      table.string('ip_address').nullable()
      table.string('user_agent').nullable()
      table.timestamp('cancelled_at').nullable()
      table.string('cancel_reason').nullable()
      table.timestamp('placed_at').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.timestamp('deleted_at').nullable()

      table.index(['store_id', 'status'])
      table.index(['store_id', 'customer_id'])
      table.index(['store_id', 'placed_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
