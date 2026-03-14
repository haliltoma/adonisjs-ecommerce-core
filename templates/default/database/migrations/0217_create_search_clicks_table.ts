/**
 * Create search clicks table for analytics
 */

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'search_clicks'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      // Search query
      table.string('searchQuery').notNullable()

      // Product clicked
      table.uuid('productId').notNullable().references('id').inTable('products').onDelete('CASCADE')

      // Position in search results (1-based)
      table.integer('position').unsigned().notNullable()

      // Timestamp
      table.timestamp('createdAt', { useTz: true }).notNullable()

      // Indexes
      table.index('searchQuery')
      table.index('productId')
      table.index('createdAt')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
