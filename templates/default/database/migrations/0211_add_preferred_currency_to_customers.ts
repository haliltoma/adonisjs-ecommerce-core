/**
 * Add preferred currency to customers
 */

import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'customers'

  public async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('preferred_currency_code', 3).nullable().references('code').inTable('currencies').onDelete('SET NULL')
    })
  }

  public async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('preferred_currency_code')
    })
  }
}
