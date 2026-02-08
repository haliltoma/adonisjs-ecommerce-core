import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'inventory_locations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('code').notNullable()
      table.jsonb('address').defaultTo('{}')
      table.boolean('is_active').defaultTo(true)
      table.boolean('is_fulfillment_center').defaultTo(true)
      table.integer('priority').defaultTo(0)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['store_id', 'code'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
