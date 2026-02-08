import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'customers'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('email').notNullable()
      table.string('password_hash').nullable()
      table.string('first_name').notNullable()
      table.string('last_name').notNullable()
      table.string('phone').nullable()
      table.string('avatar_url').nullable()
      table.enum('status', ['active', 'disabled', 'banned']).defaultTo('active')
      table.boolean('accepts_marketing').defaultTo(false)
      table.integer('total_orders').defaultTo(0)
      table.decimal('total_spent', 12, 2).defaultTo(0)
      table.timestamp('last_order_at').nullable()
      table.jsonb('tags').defaultTo('[]')
      table.text('notes').nullable()
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('email_verified_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
      table.timestamp('deleted_at').nullable()

      table.unique(['store_id', 'email'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
