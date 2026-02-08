import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_variants'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE')
      table.string('title').notNullable()
      table.string('sku').unique().notNullable()
      table.string('barcode').nullable()
      table.decimal('price', 12, 2).notNullable()
      table.decimal('compare_at_price', 12, 2).nullable()
      table.decimal('cost_price', 12, 2).nullable()
      table.decimal('weight', 10, 2).nullable()
      table.string('option_1').nullable()
      table.string('option_2').nullable()
      table.string('option_3').nullable()
      table.uuid('image_id').nullable().references('id').inTable('product_images').onDelete('SET NULL')
      table.integer('position').defaultTo(0)
      table.boolean('is_active').defaultTo(true)
      table.integer('inventory_quantity').defaultTo(0)
      table.integer('stock_quantity').defaultTo(0)
      table.boolean('track_inventory').defaultTo(false)
      table.boolean('allow_backorder').defaultTo(false)
      table.boolean('requires_shipping').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.timestamp('deleted_at').nullable()

      table.index(['product_id', 'is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
