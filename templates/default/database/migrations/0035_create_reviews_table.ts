import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'reviews'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE')
      table.uuid('customer_id').nullable().references('id').inTable('customers').onDelete('SET NULL')
      table.uuid('order_id').nullable().references('id').inTable('orders').onDelete('SET NULL')
      table.integer('rating').notNullable()
      table.string('title').nullable()
      table.text('body').notNullable()
      table.enum('status', ['pending', 'approved', 'rejected']).defaultTo('pending')
      table.boolean('is_verified_purchase').defaultTo(false)
      table.integer('helpful_count').defaultTo(0)
      table.text('admin_response').nullable()
      table.timestamp('admin_responded_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
