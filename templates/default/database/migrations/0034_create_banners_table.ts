import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'banners'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('title').notNullable()
      table.string('subtitle').nullable()
      table.string('image_url').notNullable()
      table.string('mobile_image_url').nullable()
      table.string('link_url').nullable()
      table.string('link_target').defaultTo('_self')
      table.string('position').defaultTo('home')
      table.integer('sort_order').defaultTo(0)
      table.boolean('is_active').defaultTo(true)
      table.timestamp('starts_at').nullable()
      table.timestamp('ends_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
