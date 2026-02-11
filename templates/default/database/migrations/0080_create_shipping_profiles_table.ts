import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'shipping_profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('store_id').notNullable().references('id').inTable('stores').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('type', 30).notNullable().defaultTo('default') // default, gift_card, custom
      table.jsonb('metadata').notNullable().defaultTo('{}')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['store_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
