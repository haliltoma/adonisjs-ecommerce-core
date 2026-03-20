import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'carts'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      // Add completed_at if not exists
      table.timestamp('completed_at').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      // Drop completed_at
      table.dropColumn('completed_at')
    })
  }
}
