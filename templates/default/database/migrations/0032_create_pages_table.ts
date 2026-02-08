import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'pages'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('title').notNullable()
      table.string('slug').notNullable()
      table.jsonb('content').defaultTo('{"blocks": []}')
      table.string('template').defaultTo('default')
      table.enum('status', ['draft', 'published']).defaultTo('draft')
      table.boolean('is_system').defaultTo(false)
      table.string('meta_title').nullable()
      table.text('meta_description').nullable()
      table.timestamp('published_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['store_id', 'slug'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
