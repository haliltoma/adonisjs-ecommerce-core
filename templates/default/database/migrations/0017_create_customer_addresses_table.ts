import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'customer_addresses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('customer_id').references('id').inTable('customers').onDelete('CASCADE')
      table.enum('type', ['billing', 'shipping', 'both']).defaultTo('both')
      table.boolean('is_default').defaultTo(false)
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('company').nullable()
      table.string('address_line_1').notNullable()
      table.string('address_line_2').nullable()
      table.string('city').notNullable()
      table.string('state').nullable()
      table.string('postal_code').notNullable()
      table.string('country_code').notNullable()
      table.string('phone').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
