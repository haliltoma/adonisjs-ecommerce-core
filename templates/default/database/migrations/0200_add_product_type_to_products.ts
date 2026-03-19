import { BaseSchema } from '@adonisjs/lucid/schema'
import { Knex } from 'knex'

export default class extends BaseSchema {
  protected tableName = 'products'

  public async up() {
    // Check if type column already exists
    const hasTypeColumn = await this.schema.hasColumn(this.tableName, 'type')

    if (!hasTypeColumn) {
      // Add type column as enum if it doesn't exist
      this.schema.alterTable(this.tableName, (table) => {
        table.enum('type', ['simple', 'variable', 'digital', 'bundle', 'subscription']).defaultTo('simple')
      })
    }

    // Always add these columns
    this.schema.alterTable(this.tableName, (table) => {
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
