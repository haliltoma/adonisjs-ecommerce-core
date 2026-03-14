/**
 * Create inventory alerts table
 */

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'inventory_alerts'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      // Product reference
      table.uuid('productId').notNullable().references('id').inTable('products').onDelete('CASCADE')
      table.uuid('variantId').nullable().references('id').inTable('product_variants').onDelete('CASCADE')

      // Store reference
      table.uuid('storeId').notNullable().references('id').inTable('stores').onDelete('CASCADE')

      // Alert type
      table.enum('type', ['low_stock', 'out_of_stock', 'overstock', 'backorder_threshold']).notNullable()

      // Alert details
      table.integer('currentStock').unsigned().notNullable()
      table.integer('threshold').unsigned().notNullable()
      table.integer('backorderQuantity').unsigned().defaultTo(0)

      // Severity
      table.enum('severity', ['info', 'warning', 'critical']).notNullable()

      // Status
      table.enum('status', ['active', 'acknowledged', 'resolved', 'dismissed']).defaultTo('active')

      // Resolution
      table.text('resolutionNotes').nullable()
      table.timestamp('resolvedAt', { useTz: true }).nullable()
      table.uuid('resolvedBy').nullable()

      // Notifications sent
      table.json('notificationsSent').nullable() // {email: true, slack: false, etc}

      // Timestamps
      table.timestamp('triggeredAt', { useTz: true }).notNullable()
      table.timestamp('acknowledgedAt', { useTz: true }).nullable()
      table.timestamp('createdAt', { useTz: true }).notNullable()
      table.timestamp('updatedAt', { useTz: true }).notNullable()

      // Indexes
      table.index('productId')
      table.index('variantId')
      table.index('storeId')
      table.index('type')
      table.index('status')
      table.index('severity')
      table.index('triggeredAt')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
