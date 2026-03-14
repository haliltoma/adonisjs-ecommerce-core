/**
 * Create search events table for analytics
 */

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'search_events'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      // Search query
      table.string('query').notNullable()

      // Results
      table.integer('resultsCount').unsigned().defaultTo(0)

      // Filters used
      table.json('filters').nullable()

      // User tracking
      table.uuid('userId').nullable().references('id').inTable('customers').onDelete('SET NULL')
      table.string('sessionId').nullable()
      table.string('ipAddress').nullable()

      // User agent
      table.text('userAgent').nullable()

      // Timestamp
      table.timestamp('createdAt', { useTz: true }).notNullable()

      // Indexes
      table.index('query')
      table.index('userId')
      table.index('sessionId')
      table.index('createdAt')
    })

    // Add index for analytics queries
    this.schema.alterTable(this.tableName, (table) => {
      table.index(['query', 'createdAt'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
