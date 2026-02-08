import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'settings'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('group').notNullable()
      table.string('key').notNullable()
      table.jsonb('value').defaultTo('null')
      table.boolean('is_encrypted').defaultTo(false)
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['store_id', 'group', 'key'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
