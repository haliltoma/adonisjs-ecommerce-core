import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bundle_items'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('bundleProductId').references('id').inTable('bundle_products').onDelete('CASCADE')
      table.uuid('componentProductId').references('id').inTable('products').onDelete('CASCADE')

      // Quantity and configuration
      table.integer('quantity').defaultTo(1) // How many of this product in bundle
      table.boolean('required').defaultTo(true) // Is this item required in bundle
      table.integer('minQuantity').defaultTo(1) // Minimum quantity customer must select
      table.integer('maxQuantity').nullable() // Maximum quantity customer can select

      // Pricing override (optional)
      table.decimal('overridePrice', 10, 2).nullable() // Custom price for this item in bundle
      table.boolean('useOverridePrice').defaultTo(false) // Whether to use override price

      // Display order
      table.integer('position').defaultTo(0) // Order in bundle display

      // Variant selection (if product has variants)
      table.jsonb('variantSelection').nullable() // Pre-selected variant IDs

      // Metadata
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('createdAt', { useTz: true }).defaultTo(this.now())
      table.timestamp('updatedAt', { useTz: true }).defaultTo(this.now())

      // Indexes
      table.index(['bundleProductId'])
      table.index(['componentProductId'])
      table.index(['position'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
