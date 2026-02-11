import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'orders'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('region_id').nullable().references('id').inTable('regions').onDelete('SET NULL')
      table.uuid('sales_channel_id').nullable().references('id').inTable('sales_channels').onDelete('SET NULL')
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('region_id')
      table.dropColumn('sales_channel_id')
    })
  }
}
