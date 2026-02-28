import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'email_campaigns'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('name').notNullable()
      table.string('subject').notNullable()
      table.text('body').notNullable().defaultTo('')
      table.string('status').notNullable().defaultTo('draft')
      table.integer('recipient_count').notNullable().defaultTo(0)
      table.decimal('open_rate', 5, 2).nullable()
      table.decimal('click_rate', 5, 2).nullable()
      table.timestamp('scheduled_at').nullable()
      table.timestamp('sent_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['store_id', 'status'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
