import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'webhook_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('webhook_id').references('id').inTable('webhooks').onDelete('CASCADE')
      table.string('event').notNullable()
      table.jsonb('payload').notNullable()
      table.integer('response_status').nullable()
      table.text('response_body').nullable()
      table.integer('duration_ms').nullable()
      table.text('error').nullable()
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
