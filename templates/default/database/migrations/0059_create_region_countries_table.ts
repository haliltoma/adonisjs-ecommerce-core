import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'region_countries'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('region_id').references('id').inTable('regions').onDelete('CASCADE')
      table.string('country_code', 2).notNullable()
      table.string('country_name').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['region_id', 'country_code'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
