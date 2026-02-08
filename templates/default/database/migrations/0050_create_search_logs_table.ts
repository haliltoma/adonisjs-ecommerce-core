import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'search_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('query').notNullable()
      table.integer('results_count').defaultTo(0)
      table.uuid('customer_id').nullable().references('id').inTable('customers').onDelete('SET NULL')
      table.timestamp('created_at').notNullable()

      table.index(['store_id', 'query'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
