import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'regions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('currency_code', 3).notNullable()
      table.decimal('tax_rate', 5, 2).defaultTo(0)
      table.string('tax_code').nullable()
      table.boolean('includes_tax').defaultTo(false)
      table.jsonb('payment_providers').defaultTo('[]')
      table.jsonb('fulfillment_providers').defaultTo('[]')
      table.boolean('is_active').defaultTo(true)
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['store_id', 'is_active'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
