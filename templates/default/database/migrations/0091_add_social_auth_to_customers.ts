import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'customers'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('oauth_provider').nullable()
      table.string('oauth_provider_id').nullable()
      table.string('oauth_avatar_url').nullable()

      table.index(['oauth_provider', 'oauth_provider_id'])
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropIndex(['oauth_provider', 'oauth_provider_id'])
      table.dropColumn('oauth_provider')
      table.dropColumn('oauth_provider_id')
      table.dropColumn('oauth_avatar_url')
    })
  }
}
