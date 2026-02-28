import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'menus'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('handle', 'slug')
      table.dropColumn('items')
      table.string('location').nullable()
      table.boolean('is_active').defaultTo(true)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.renameColumn('slug', 'handle')
      table.dropColumn('location')
      table.dropColumn('is_active')
      table.jsonb('items').defaultTo('{"items": []}')
    })
  }
}
