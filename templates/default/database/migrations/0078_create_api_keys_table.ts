import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'api_keys'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('store_id').notNullable().references('id').inTable('stores').onDelete('CASCADE')
      table.string('title').notNullable()
      table.string('type', 20).notNullable().defaultTo('publishable') // publishable, secret
      table.string('token_hash').notNullable()
      table.string('last4', 4).notNullable()
      table.string('prefix', 10).notNullable() // pk_ for publishable, sk_ for secret
      table.uuid('created_by').nullable().references('id').inTable('users').onDelete('SET NULL')
      table.timestamp('revoked_at').nullable()
      table.timestamp('last_used_at').nullable()
      table.jsonb('metadata').notNullable().defaultTo('{}')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['store_id'])
      table.index(['token_hash'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
