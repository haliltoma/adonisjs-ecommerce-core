import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('user_id').nullable().references('id').inTable('users').onDelete('CASCADE')
      table.string('title').nullable()
      table.text('message').nullable()
      table.boolean('is_read').defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('user_id')
      table.dropColumn('title')
      table.dropColumn('message')
      table.dropColumn('is_read')
    })
  }
}
