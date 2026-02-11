import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'price_list_prices'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('price_list_id').references('id').inTable('price_lists').onDelete('CASCADE')
      table.uuid('variant_id').references('id').inTable('product_variants').onDelete('CASCADE')
      table.decimal('amount', 12, 2).notNullable()
      table.string('currency_code', 3).notNullable()
      table.integer('min_quantity').nullable()
      table.integer('max_quantity').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['price_list_id', 'variant_id', 'currency_code', 'min_quantity'])
      table.index(['variant_id', 'currency_code'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
