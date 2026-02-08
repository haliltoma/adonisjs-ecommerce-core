import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'tax_rates'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('tax_class_id').references('id').inTable('tax_classes').onDelete('CASCADE')
      table.string('name').notNullable()
      table.decimal('rate', 5, 4).notNullable()
      table.string('country_code').notNullable()
      table.string('state_code').nullable()
      table.string('postal_code').nullable()
      table.integer('priority').defaultTo(0)
      table.boolean('is_compound').defaultTo(false)
      table.boolean('is_active').defaultTo(true)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
