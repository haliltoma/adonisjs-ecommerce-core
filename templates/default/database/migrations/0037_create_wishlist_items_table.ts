import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'wishlist_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('wishlist_id').references('id').inTable('wishlists').onDelete('CASCADE')
      table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE')
      table.uuid('variant_id').nullable().references('id').inTable('product_variants').onDelete('CASCADE')
      table.timestamp('added_at').notNullable()
      table.string('notes').nullable()

      table.unique(['wishlist_id', 'product_id', 'variant_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
