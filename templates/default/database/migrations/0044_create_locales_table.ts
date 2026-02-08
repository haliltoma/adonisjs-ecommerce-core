import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'locales'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('code').notNullable()
      table.string('name').notNullable()
      table.boolean('is_default').defaultTo(false)
      table.boolean('is_active').defaultTo(true)
      table.enum('direction', ['ltr', 'rtl']).defaultTo('ltr')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['store_id', 'code'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
