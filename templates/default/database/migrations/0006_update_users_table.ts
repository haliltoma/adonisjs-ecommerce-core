import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.uuid('role_id').nullable().references('id').inTable('roles').onDelete('SET NULL')
      table.string('first_name').nullable()
      table.string('last_name').nullable()
      table.string('avatar_url').nullable()
      table.boolean('is_active').defaultTo(true)
      table.timestamp('last_login_at').nullable()
      table.string('two_factor_secret').nullable()
      table.boolean('two_factor_enabled').defaultTo(false)
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('role_id')
      table.dropColumn('first_name')
      table.dropColumn('last_name')
      table.dropColumn('avatar_url')
      table.dropColumn('is_active')
      table.dropColumn('last_login_at')
      table.dropColumn('two_factor_secret')
      table.dropColumn('two_factor_enabled')
    })
  }
}
