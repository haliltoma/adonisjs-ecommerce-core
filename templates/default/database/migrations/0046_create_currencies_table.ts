import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'currencies'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('code').notNullable()
      table.string('name').notNullable()
      table.string('symbol').notNullable()
      table.enum('symbol_position', ['before', 'after']).defaultTo('before')
      table.string('decimal_separator').defaultTo(',')
      table.string('thousands_separator').defaultTo('.')
      table.integer('decimal_places').defaultTo(2)
      table.decimal('exchange_rate', 10, 6).defaultTo(1)
      table.boolean('is_default').defaultTo(false)
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['store_id', 'code'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
