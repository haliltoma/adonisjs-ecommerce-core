import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notifications'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('type').notNullable()
      table.string('notifiable_type').notNullable()
      table.uuid('notifiable_id').notNullable()
      table.enum('channel', ['email', 'sms', 'push', 'database']).notNullable()
      table.string('subject').notNullable()
      table.text('body').notNullable()
      table.jsonb('data').defaultTo('{}')
      table.timestamp('read_at').nullable()
      table.timestamp('sent_at').nullable()
      table.timestamp('failed_at').nullable()
      table.text('error').nullable()
      table.timestamp('created_at').notNullable()

      table.index(['notifiable_type', 'notifiable_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
