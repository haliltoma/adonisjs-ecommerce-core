import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('title').notNullable()
      table.string('slug').notNullable()
      table.text('description').nullable()
      table.text('short_description').nullable()
      table.enum('status', ['draft', 'active', 'archived']).defaultTo('draft')
      table.enum('type', ['simple', 'variable', 'digital', 'bundle', 'subscription']).defaultTo('simple')
      table.string('vendor').nullable()
      table.string('sku').nullable()
      table.string('barcode').nullable()
      table.decimal('price', 12, 2).nullable()
      table.decimal('compare_at_price', 12, 2).nullable()
      table.decimal('cost_price', 12, 2).nullable()
      table.boolean('is_taxable').defaultTo(true)
      table.uuid('tax_class_id').nullable().references('id').inTable('tax_classes').onDelete('SET NULL')
      table.decimal('weight', 10, 2).nullable()
      table.enum('weight_unit', ['g', 'kg', 'lb', 'oz']).defaultTo('g')
      table.boolean('requires_shipping').defaultTo(true)
      table.boolean('track_inventory').defaultTo(false)
      table.integer('stock_quantity').defaultTo(0)
      table.boolean('has_variants').defaultTo(false)
      table.boolean('is_featured').defaultTo(false)
      table.integer('sort_order').defaultTo(0)
      table.string('meta_title').nullable()
      table.text('meta_description').nullable()
      table.string('meta_keywords').nullable()
      table.jsonb('custom_fields').defaultTo('{}')
      table.timestamp('published_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.timestamp('deleted_at').nullable()

      table.unique(['store_id', 'slug'])
      table.index(['store_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
