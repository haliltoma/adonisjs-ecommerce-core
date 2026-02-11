import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'gift_cards'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('store_id').notNullable().references('id').inTable('stores').onDelete('CASCADE')
      table.string('code', 50).notNullable().unique()
      table.decimal('value', 12, 2).notNullable()
      table.decimal('balance', 12, 2).notNullable()
      table.string('currency_code', 3).notNullable().defaultTo('USD')
      table.boolean('is_disabled').notNullable().defaultTo(false)
      table.uuid('region_id').nullable().references('id').inTable('regions').onDelete('SET NULL')
      table.uuid('order_id').nullable().references('id').inTable('orders').onDelete('SET NULL')
      table.timestamp('ends_at').nullable()
      table.jsonb('metadata').notNullable().defaultTo('{}')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['store_id'])
      table.index(['code'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
