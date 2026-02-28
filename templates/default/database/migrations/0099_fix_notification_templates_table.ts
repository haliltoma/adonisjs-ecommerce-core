import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notification_templates'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('name').nullable()
      table.string('slug').nullable()
      table.jsonb('variables').nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('name')
      table.dropColumn('slug')
      table.dropColumn('variables')
    })
  }
}
