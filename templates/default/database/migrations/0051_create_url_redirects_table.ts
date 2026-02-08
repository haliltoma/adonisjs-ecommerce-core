import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'url_redirects'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('source_path').notNullable()
      table.string('target_path').notNullable()
      table.enum('type', ['permanent', 'temporary']).defaultTo('permanent')
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['store_id', 'source_path'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
