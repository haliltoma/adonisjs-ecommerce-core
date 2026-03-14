/**
 * Create discount rules table for bulk/tiered discounts
 */

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'discount_rules'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      // Relation to discount
      table.uuid('discountId').notNullable().references('id').inTable('discounts').onDelete('CASCADE')

      // Rule type
      table.enum('type', ['quantity_tier', 'spend_tier', 'customer_group', 'product_combination']).notNullable()

      // Quantity tier rules
      table.json('quantityTiers').nullable() // [{minQty, maxQty, discountValue}]

      // Spend tier rules
      table.json('spendTiers').nullable() // [{minAmount, maxAmount, discountValue}]

      // Product combination rules
      table.json('productCombinations').nullable() // [{productIds, requiredQty, discountValue}]

      // Customer group eligibility
      table.json('customerGroupIds').nullable() // UUID array

      // Conditions
      table.json('conditions').nullable() // Additional conditions as JSON

      // Priority (higher = applied first)
      table.integer('priority').defaultTo(0)

      // Active status
      table.boolean('isActive').defaultTo(true)

      // Timestamps
      table.timestamp('createdAt', { useTz: true }).notNullable()
      table.timestamp('updatedAt', { useTz: true }).notNullable()

      // Indexes
      table.index('discountId')
      table.index('type')
      table.index('isActive')
      table.index('priority')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
