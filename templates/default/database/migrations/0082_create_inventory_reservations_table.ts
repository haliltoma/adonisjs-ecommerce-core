import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'inventory_reservations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('store_id').notNullable().references('id').inTable('stores').onDelete('CASCADE')
      table.uuid('variant_id').notNullable().references('id').inTable('product_variants').onDelete('CASCADE')
      table.uuid('location_id').nullable().references('id').inTable('inventory_locations').onDelete('SET NULL')
      table.uuid('line_item_id').nullable() // cart item or order item ID
      table.string('type', 20).notNullable().defaultTo('order') // order, cart, transfer
      table.integer('quantity').notNullable()
      table.text('description').nullable()
      table.uuid('created_by').nullable()
      table.timestamp('expires_at').nullable()
      table.jsonb('metadata').notNullable().defaultTo('{}')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['store_id'])
      table.index(['variant_id'])
      table.index(['line_item_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
