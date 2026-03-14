/**
 * Create coupons table
 */

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'coupons'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      // Coupon code and relation to discount
      table.string('code').notNullable().unique()
      table.uuid('discountId').notNullable().references('id').inTable('discounts').onDelete('CASCADE')

      // Customer assignment (null = public coupon)
      table.uuid('customerId').nullable().references('id').inTable('customers').onDelete('CASCADE')

      // Usage tracking
      table.integer('usageCount').unsigned().defaultTo(0)
      table.dateTime('firstUsedAt', { useTz: true }).nullable()
      table.dateTime('lastUsedAt', { useTz: true }).nullable()

      // Status
      table.enum('status', ['active', 'disabled', 'expired', 'fully_redeemed']).defaultTo('active')
      table.boolean('isEnabled').defaultTo(true)

      // Expiry
      table.dateTime('expiresAt', { useTz: true }).nullable()

      // Recipient info (for gift/personalized coupons)
      table.string('recipientEmail').nullable()
      table.string('recipientName').nullable()
      table.text('message').nullable()

      // Metadata
      table.json('metadata').nullable()

      // Timestamps
      table.timestamp('createdAt', { useTz: true }).notNullable()
      table.timestamp('updatedAt', { useTz: true }).notNullable()

      // Indexes
      table.index('code')
      table.index('discountId')
      table.index('customerId')
      table.index('status')
      table.index('expiresAt')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
