import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'stores'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('name').notNullable()
      table.string('slug').unique().notNullable()
      table.string('domain').nullable()
      table.string('logo_url').nullable()
      table.string('default_locale').defaultTo('tr')
      table.string('default_currency').defaultTo('TRY')
      table.string('timezone').defaultTo('Europe/Istanbul')
      table.boolean('is_active').defaultTo(true)
      table.jsonb('settings').defaultTo('{}')
      table.jsonb('meta').defaultTo('{}')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
