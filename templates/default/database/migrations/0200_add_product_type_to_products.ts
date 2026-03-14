import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'products'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add product_type enum if not exists
      table.enum('type', ['simple', 'variable', 'digital', 'bundle', 'subscription']).default('simple').alter()

      // Digital product fields
      table.string('fileUrl').nullable().after('metaTitle')
      table.integer('downloadLimit').nullable().default(null).after('fileUrl')
      table.dateTime('downloadExpiry').nullable().default(null).after('downloadLimit')

      // Subscription fields
      table.enum('subscriptionInterval', ['daily', 'weekly', 'monthly', 'yearly']).nullable().default(null).after('downloadExpiry')
      table.integer('trialPeriodDays').nullable().default(null).after('subscriptionInterval')
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
