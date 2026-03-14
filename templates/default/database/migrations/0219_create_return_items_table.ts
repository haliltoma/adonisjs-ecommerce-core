/**
 * Create return_items table for individual line item returns
 */

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'return_items'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      // Return reference
      table.uuid('returnId').notNullable().references('id').inTable('returns').onDelete('CASCADE')

      // Order item reference
      table.uuid('orderItemId').notNullable().references('id').inTable('order_items').onDelete('CASCADE')

      // Product info snapshot
      table.uuid('productId').notNullable()
      table.uuid('variantId').nullable()
      table.string('productName').notNullable()
      table.string('productSku').nullable()
      table.json('productAttributes').nullable() // Snapshot of variant attributes

      // Return quantity
      table.integer('quantity').unsigned().notNullable()
      table.integer('receivedQuantity').unsigned().defaultTo(0)

      // Condition
      table.enum('condition', ['new', 'opened', 'used', 'damaged', 'defective']).notNullable()
      table.text('conditionNotes').nullable()

      // Resolution for this item
      table.enum('resolution', ['refund', 'exchange', 'repair', 'dispose']).nullable()

      // Exchange details
      table.uuid('exchangeForVariantId').nullable()
      table.string('exchangeForVariantName').nullable()

      // Refund amount
      table.decimal('refundAmount', 10, 2).nullable()

      // Inspection results
      table.boolean('passInspection').nullable()
      table.text('inspectionNotes').nullable()
      table.json('inspectionPhotos').nullable() // Array of photo URLs

      // Timestamps
      table.timestamp('createdAt', { useTz: true }).notNullable()
      table.timestamp('updatedAt', { useTz: true }).notNullable()

      // Indexes
      table.index('returnId')
      table.index('orderItemId')
      table.index('productId')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
