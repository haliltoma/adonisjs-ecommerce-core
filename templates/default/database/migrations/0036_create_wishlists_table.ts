import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'wishlists'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('customer_id').references('id').inTable('customers').onDelete('CASCADE')
      table.string('name').defaultTo('My Wishlist')
      table.boolean('is_default').defaultTo(true)
      table.boolean('is_public').defaultTo(false)
      table.string('share_token').nullable().unique()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
