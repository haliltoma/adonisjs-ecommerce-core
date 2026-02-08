import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'notification_templates'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('store_id').references('id').inTable('stores').onDelete('CASCADE')
      table.string('event').notNullable()
      table.enum('channel', ['email', 'sms']).notNullable()
      table.string('subject').notNullable()
      table.text('body').notNullable()
      table.boolean('is_active').defaultTo(true)
      table.string('locale').defaultTo('tr')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['store_id', 'event', 'channel', 'locale'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
