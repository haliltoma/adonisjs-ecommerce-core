/**
 * Create inventory reservations table
 */

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'inventory_reservations'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      // Product reference
      table.uuid('productId').notNullable().references('id').inTable('products').onDelete('CASCADE')
      table.uuid('variantId').nullable().references('id').inTable('product_variants').onDelete('CASCADE')

      // Store reference
      table.uuid('storeId').notNullable().references('id').inTable('stores').onDelete('CASCADE')

      // Reservation details
      table.integer('quantity').unsigned().notNullable()

      // Associated entity (cart, order, etc)
      table.enum('reservationType', ['cart', 'order', 'backorder', 'transfer']).notNullable()
      table.uuid('entityId').notNullable() // cartId, orderId, etc

      // Status
      table.enum('status', ['active', 'expired', 'consumed', 'released', 'cancelled']).defaultTo('active')

      // Expiration
      table.timestamp('expiresAt', { useTz: true }).notNullable()

      // Metadata
      table.json('metadata').nullable()

      // Timestamps
      table.timestamp('createdAt', { useTz: true }).notNullable()
      table.timestamp('updatedAt', { useTz: true }).notNullable()
      table.timestamp('consumedAt', { useTz: true }).nullable()
      table.timestamp('releasedAt', { useTz: true }).nullable()

      // Indexes
      table.index('productId')
      table.index('variantId')
      table.index('storeId')
      table.index('reservationType')
      table.index('status')
      table.index('expiresAt')
      table.index(['productId', 'variantId', 'status'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
