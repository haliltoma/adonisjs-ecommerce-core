import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'inventory_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('variant_id').references('id').inTable('product_variants').onDelete('CASCADE')
      table.uuid('location_id').references('id').inTable('inventory_locations').onDelete('CASCADE')
      table.integer('quantity').defaultTo(0)
      table.integer('reserved_quantity').defaultTo(0)
      table.integer('available_quantity').defaultTo(0)
      table.integer('reorder_point').nullable()
      table.integer('reorder_quantity').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['variant_id', 'location_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
