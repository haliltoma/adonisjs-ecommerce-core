/**
 * Create returns table for RMA (Return Merchandise Authorization)
 */

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'returns'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      // Order reference
      table.uuid('orderId').notNullable().references('id').inTable('orders').onDelete('CASCADE')
      table.string('orderNumber').notNullable()

      // Customer info
      table.uuid('customerId').notNullable().references('id').inTable('customers').onDelete('CASCADE')

      // Return details
      table.string('returnNumber').notNullable().unique()
      table.enum('status', ['requested', 'approved', 'received', 'inspected', 'processed', 'rejected', 'cancelled']).defaultTo('requested')
      table.enum('reason', ['damaged', 'defective', 'wrong_item', 'no_longer_needed', 'better_price_available', 'other']).notNullable()
      table.text('reasonDetails').nullable()

      // Resolution type
      table.enum('resolution', ['refund', 'exchange', 'store_credit']).nullable()

      // Refund details
      table.decimal('refundAmount', 10, 2).nullable()
      table.string('refundCurrency', 3).nullable()
      table.enum('refundMethod', ['original', 'store_credit', 'exchange']).nullable()
      table.uuid('refundId').nullable().references('id').inTable('refunds').onDelete('SET NULL')

      // Exchange details
      table.uuid('exchangeOrderId').nullable().references('id').inTable('orders').onDelete('SET NULL')

      // Shipping
      table.boolean('requiresReturnShipping').defaultTo(true)
      table.string('returnShippingMethod').nullable()
      table.decimal('returnShippingCost', 10, 2).nullable()
      table.string('returnShippingCarrier').nullable()
      table.string('returnTrackingNumber').nullable()

      // Timestamps
      table.timestamp('requestedAt', { useTz: true }).notNullable()
      table.timestamp('approvedAt', { useTz: true }).nullable()
      table.timestamp('receivedAt', { useTz: true }).nullable()
      table.timestamp('inspectedAt', { useTz: true }).nullable()
      table.timestamp('processedAt', { useTz: true }).nullable()
      table.timestamp('expectedReturnBy', { useTz: true }).nullable()

      // Approval
      table.uuid('approvedBy').nullable().references('id').inTable('admin_users').onDelete('SET NULL')
      table.text('adminNotes').nullable()
      table.text('customerNotes').nullable()

      // Metadata
      table.json('metadata').nullable()

      // Timestamps
      table.timestamp('createdAt', { useTz: true }).notNullable()
      table.timestamp('updatedAt', { useTz: true }).notNullable()

      // Indexes
      table.index('orderId')
      table.index('customerId')
      table.index('returnNumber')
      table.index('status')
      table.index('requestedAt')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
