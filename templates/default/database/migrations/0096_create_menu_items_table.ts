import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'menu_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('menu_id').references('id').inTable('menus').onDelete('CASCADE')
      table.uuid('parent_id').nullable().references('id').inTable('menu_items').onDelete('SET NULL')
      table.string('title').notNullable()
      table.string('url').nullable()
      table.enum('type', ['link', 'page', 'category', 'product', 'collection']).defaultTo('link')
      table.uuid('reference_id').nullable()
      table.enum('target', ['_self', '_blank']).defaultTo('_self')
      table.string('icon').nullable()
      table.integer('sort_order').defaultTo(0)
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['menu_id'])
      table.index(['parent_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
