import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'inventory_movements'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('inventory_item_id').references('id').inTable('inventory_items').onDelete('CASCADE')
      table.enum('type', ['received', 'sold', 'returned', 'adjusted', 'transferred', 'reserved', 'released']).notNullable()
      table.integer('quantity').notNullable()
      table.string('reference_type').nullable()
      table.uuid('reference_id').nullable()
      table.string('reason').nullable()
      table.integer('user_id').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
