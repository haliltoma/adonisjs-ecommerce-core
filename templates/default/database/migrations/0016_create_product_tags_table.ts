import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'product_tags'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('product_id').references('id').inTable('products').onDelete('CASCADE')
      table.uuid('tag_id').references('id').inTable('tags').onDelete('CASCADE')
      table.primary(['product_id', 'tag_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
