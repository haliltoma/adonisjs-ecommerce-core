import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'price_list_rules'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('price_list_id').references('id').inTable('price_lists').onDelete('CASCADE')
      table.string('attribute').notNullable() // e.g. 'customer_group', 'region', 'currency_code'
      table.string('operator').notNullable().defaultTo('in') // eq, ne, in, gt, gte, lt, lte
      table.jsonb('value').notNullable() // e.g. ["group-id-1", "group-id-2"] or "EUR"
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['price_list_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
