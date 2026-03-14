import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscriptions'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('subscriptionNumber').notNullable().unique()

      // Customer and Product
      table.uuid('customerId').references('id').inTable('customers').onDelete('CASCADE')
      table.uuid('productId').references('id').inTable('products').onDelete('CASCADE')
      table.uuid('orderId').nullable().references('id').inTable('orders').onDelete('SET NULL')

      // Status
      table.enum('status', ['active', 'paused', 'cancelled', 'expired', 'past_due', 'trialing']).defaultTo('active')

      // Billing
      table.enum('billingInterval', ['daily', 'weekly', 'monthly', 'yearly']).notNullable()
      table.integer('intervalCount').defaultTo(1)
      table.decimal('amount', 10, 2).notNullable()
      table.string('currencyCode', 3).defaultTo('USD')

      // Trial
      table.integer('trialPeriodDays').nullable()
      table.dateTime('trialEndsAt').nullable()

      // Dates
      table.dateTime('startsAt').notNullable()
      table.dateTime('currentPeriodStartsAt').nullable()
      table.dateTime('currentPeriodEndsAt').nullable()
      table.dateTime('cancelledAt').nullable()
      table.dateTime('expiresAt').nullable()

      // Payment provider
      table.string('providerSubscriptionId').nullable()
      table.string('providerCustomerId').nullable()
      table.string('providerPlanId').nullable()

      // Metadata
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('createdAt', { useTz: true }).defaultTo(this.now())
      table.timestamp('updatedAt', { useTz: true }).defaultTo(this.now())

      // Indexes
      table.index(['customerId'])
      table.index(['status'])
      table.index(['providerSubscriptionId'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
