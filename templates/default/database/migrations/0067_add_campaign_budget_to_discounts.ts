import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'discounts'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('campaign_name').nullable()
      table.enum('budget_type', ['spend', 'usage']).nullable()
      table.decimal('budget_limit', 12, 2).nullable()
      table.decimal('budget_used', 12, 2).defaultTo(0)
      table.jsonb('customer_group_ids').nullable()
      table.jsonb('region_ids').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('campaign_name')
      table.dropColumn('budget_type')
      table.dropColumn('budget_limit')
      table.dropColumn('budget_used')
      table.dropColumn('customer_group_ids')
      table.dropColumn('region_ids')
    })
  }
}
