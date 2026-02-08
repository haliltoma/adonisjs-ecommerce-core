import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'order_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE')
      table.uuid('product_id').references('id').inTable('products').onDelete('RESTRICT')
      table.uuid('variant_id').nullable().references('id').inTable('product_variants').onDelete('RESTRICT')
      table.string('sku').notNullable()
      table.string('title').notNullable()
      table.string('variant_title').nullable()
      table.integer('quantity').notNullable()
      table.decimal('unit_price', 12, 2).notNullable()
      table.decimal('total_price', 12, 2).notNullable()
      table.decimal('discount_amount', 12, 2).defaultTo(0)
      table.decimal('tax_amount', 12, 2).defaultTo(0)
      table.decimal('tax_rate', 5, 4).defaultTo(0)
      table.decimal('weight', 10, 2).nullable()
      table.integer('fulfilled_quantity').defaultTo(0)
      table.integer('returned_quantity').defaultTo(0)
      table.string('thumbnail_url').nullable()
      table.jsonb('properties').defaultTo('{}')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
