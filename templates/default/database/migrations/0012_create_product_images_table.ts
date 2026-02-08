import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_images'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE')
      table.string('url').notNullable()
      table.string('alt_text').nullable()
      table.integer('position').defaultTo(0)
      table.integer('width').nullable()
      table.integer('height').nullable()
      table.integer('file_size').nullable()
      table.string('mime_type').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
