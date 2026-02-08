import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'discounts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('code').notNullable()
      table.enum('type', ['percentage', 'fixed_amount', 'free_shipping', 'buy_x_get_y']).notNullable()
      table.decimal('value', 12, 2).notNullable()
      table.enum('applies_to', ['all', 'specific_products', 'specific_categories']).defaultTo('all')
      table.jsonb('product_ids').nullable()
      table.jsonb('category_ids').nullable()
      table.jsonb('customer_ids').nullable()
      table.decimal('minimum_order_amount', 12, 2).nullable()
      table.decimal('maximum_order_amount', 12, 2).nullable()
      table.integer('minimum_quantity').nullable()
      table.decimal('maximum_discount_amount', 12, 2).nullable()
      table.integer('usage_limit').nullable()
      table.integer('usage_limit_per_customer').nullable()
      table.integer('usage_count').defaultTo(0)
      table.boolean('is_active').defaultTo(true)
      table.boolean('is_public').defaultTo(true)
      table.boolean('first_order_only').defaultTo(false)
      table.timestamp('starts_at').nullable()
      table.timestamp('ends_at').nullable()
      // Buy X Get Y specific fields
      table.integer('buy_quantity').nullable()
      table.integer('get_quantity').nullable()
      table.integer('get_discount_percentage').nullable()
      table.boolean('is_automatic').defaultTo(false)
      table.integer('priority').defaultTo(0)
      table.boolean('is_combinable').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['store_id', 'code'])
      table.index(['store_id', 'is_active'])
      table.index(['starts_at', 'ends_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
