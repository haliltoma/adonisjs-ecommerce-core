import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'api_key_sales_channels'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('api_key_id').notNullable().references('id').inTable('api_keys').onDelete('CASCADE')
      table.uuid('sales_channel_id').notNullable().references('id').inTable('sales_channels').onDelete('CASCADE')
      table.timestamp('created_at').notNullable()

      table.unique(['api_key_id', 'sales_channel_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
