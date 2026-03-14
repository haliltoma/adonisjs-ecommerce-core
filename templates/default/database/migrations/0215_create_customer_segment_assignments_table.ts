/**
 * Create customer segment assignments pivot table
 */

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'customer_segment_assignments'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('customerId').notNullable().references('id').inTable('customers').onDelete('CASCADE')
      table.uuid('segmentId').notNullable().references('id').inTable('customer_segments').onDelete('CASCADE')

      // Assignment metadata
      table.json('metadata').nullable() // Why/how they were assigned

      // Timestamps
      table.timestamp('assignedAt', { useTz: true }).notNullable()

      // Composite primary key
      table.primary(['customerId', 'segmentId'])

      // Indexes
      table.index('customerId')
      table.index('segmentId')
      table.index('assignedAt')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
