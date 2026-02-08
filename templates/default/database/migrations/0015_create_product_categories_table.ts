import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_categories'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE')
      table.uuid('category_id').references('id').inTable('categories').onDelete('CASCADE')
      table.integer('position').defaultTo(0)
      table.primary(['product_id', 'category_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
