import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'price_lists'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('name').notNullable()
      table.text('description').nullable()
      table.enum('type', ['sale', 'override']).notNullable().defaultTo('sale')
      table.enum('status', ['active', 'draft', 'expired']).notNullable().defaultTo('draft')
      table.timestamp('starts_at').nullable()
      table.timestamp('ends_at').nullable()
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['store_id', 'status'])
      table.index(['starts_at', 'ends_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
