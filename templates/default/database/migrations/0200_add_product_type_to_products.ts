import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add product_type enum if not exists
      table.enum('type', ['simple', 'variable', 'digital', 'bundle', 'subscription']).defaultTo('simple').alter()

      // Digital product fields
      table.string('fileUrl').nullable().after('metaTitle')
      table.integer('downloadLimit').nullable().defaultTo(null).after('fileUrl')
      table.dateTime('downloadExpiry').nullable().defaultTo(null).after('downloadLimit')

      // Subscription fields
      table.enum('subscriptionInterval', ['daily', 'weekly', 'monthly', 'yearly']).nullable().defaultTo(null).after('downloadExpiry')
      table.integer('trialPeriodDays').nullable().defaultTo(null).after('subscriptionInterval')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('fileUrl')
      table.dropColumn('downloadLimit')
      table.dropColumn('downloadExpiry')
      table.dropColumn('subscriptionInterval')
      table.dropColumn('trialPeriodDays')
    })
  }
}
