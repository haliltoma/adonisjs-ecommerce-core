import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'collection_products'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('collection_id').references('id').inTable('collections').onDelete('CASCADE')
      table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE')
      table.integer('position').defaultTo(0)
      table.primary(['collection_id', 'product_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
