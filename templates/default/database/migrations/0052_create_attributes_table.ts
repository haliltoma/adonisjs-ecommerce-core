import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'attributes'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('code').notNullable()
      table.string('name').notNullable()
      table.enum('type', ['text', 'textarea', 'number', 'boolean', 'select', 'multiselect', 'date', 'file']).notNullable()
      table.boolean('is_required').defaultTo(false)
      table.boolean('is_filterable').defaultTo(false)
      table.boolean('is_visible_on_front').defaultTo(true)
      table.boolean('is_searchable').defaultTo(false)
      table.boolean('is_comparable').defaultTo(false)
      table.jsonb('validation_rules').defaultTo('{}')
      table.integer('position').defaultTo(0)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['store_id', 'code'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
