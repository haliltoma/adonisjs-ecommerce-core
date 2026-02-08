import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'categories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.uuid('parent_id').nullable().references('id').inTable('categories').onDelete('SET NULL')
      table.string('name').notNullable()
      table.string('slug').notNullable()
      table.text('description').nullable()
      table.string('image_url').nullable()
      table.integer('position').defaultTo(0)
      table.integer('depth').defaultTo(0)
      table.string('path').nullable()
      table.boolean('is_active').defaultTo(true)
      table.string('meta_title').nullable()
      table.text('meta_description').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['store_id', 'slug'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
