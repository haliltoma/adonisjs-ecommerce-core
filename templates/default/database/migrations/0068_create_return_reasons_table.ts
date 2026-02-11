import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'return_reasons'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.uuid('parent_id').nullable().references('id').inTable('return_reasons').onDelete('SET NULL')
      table.string('value').notNullable()
      table.string('label').notNullable()
      table.text('description').nullable()
      table.integer('sort_order').defaultTo(0)
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['store_id', 'value'])
      table.index(['store_id', 'parent_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
