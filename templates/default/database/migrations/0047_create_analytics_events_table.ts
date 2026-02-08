import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'analytics_events'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('event_type').notNullable()
      table.string('session_id').notNullable()
      table.uuid('customer_id').nullable().references('id').inTable('customers').onDelete('SET NULL')
      table.jsonb('data').defaultTo('{}')
      table.string('ip_address').nullable()
      table.string('user_agent').nullable()
      table.string('referrer').nullable()
      table.timestamp('created_at').notNullable()

      table.index(['store_id', 'event_type'])
      table.index(['store_id', 'created_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
