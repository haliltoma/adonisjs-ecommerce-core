/**
 * Create customer segments table
 */

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'customer_segments'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      // Basic info
      table.string('name').notNullable()
      table.string('slug').notNullable().unique()
      table.text('description').nullable()

      // Segment type
      table.enum('type', ['manual', 'dynamic', 'behavioral', 'demographic']).notNullable()

      // Segment rules (for dynamic/behavioral segments)
      table.json('rules').nullable() // {field, operator, value}[]

      // Conditions (advanced matching)
      table.json('conditions').nullable() // {minSpent, maxSpent, purchaseCount, categories, etc}

      // Targeting
      table.string('currencyCode', 3).nullable() // Special pricing for this segment

      // Priority (higher = checked first)
      table.integer('priority').defaultTo(0)

      // Status
      table.boolean('isActive').defaultTo(true)
      table.boolean('isPublic').defaultTo(false) // Public segments are visible to customers

      // Customer count cache
      table.integer('customerCount').unsigned().defaultTo(0)

      // Timestamps
      table.timestamp('createdAt', { useTz: true }).notNullable()
      table.timestamp('updatedAt', { useTz: true }).notNullable()
      table.timestamp('lastCalculatedAt', { useTz: true }).nullable()

      // Indexes
      table.index('type')
      table.index('isActive')
      table.index('isPublic')
      table.index('priority')
      table.index('lastCalculatedAt')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
