import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_attribute_values'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE')
      table.uuid('attribute_id').references('id').inTable('attributes').onDelete('CASCADE')
      table.text('text_value').nullable()
      table.decimal('number_value', 12, 4).nullable()
      table.boolean('boolean_value').nullable()
      table.date('date_value').nullable()
      table.uuid('option_id').nullable().references('id').inTable('attribute_options').onDelete('SET NULL')
      table.jsonb('json_value').nullable()
      table.string('locale').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['product_id', 'attribute_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
