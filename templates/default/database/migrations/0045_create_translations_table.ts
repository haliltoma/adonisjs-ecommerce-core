import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'translations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.string('locale').notNullable()
      table.string('translatable_type').notNullable()
      table.uuid('translatable_id').notNullable()
      table.string('field').notNullable()
      table.text('value').notNullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['locale', 'translatable_type', 'translatable_id', 'field'])
      table.index(['translatable_type', 'translatable_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
