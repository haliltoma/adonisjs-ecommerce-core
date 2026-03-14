import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'bundle_products'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('productId').references('id').inTable('products').onDelete('CASCADE')

      // Bundle configuration
      table.enum('pricingType', ['fixed', 'discount_percentage', 'discount_fixed']).default('fixed')
      table.decimal('fixedPrice', 10, 2).nullable() // For fixed pricing type
      table.decimal('discountPercentage', 5, 2).nullable() // For discount_percentage type
      table.decimal('discountFixed', 10, 2).nullable() // For discount_fixed type

      // Inventory management
      table.boolean('trackInventory').default(true) // Track bundle inventory separately
      table.integer('stockQuantity').default(0) // Bundle stock if tracked separately

      // Visibility
      table.boolean('isVisible').default(true) // Show component products to customers

      // Metadata
      table.jsonb('metadata').default('{}')
      table.timestamp('createdAt', { useTz: true }).defaultTo(this.now())
      table.timestamp('updatedAt', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
