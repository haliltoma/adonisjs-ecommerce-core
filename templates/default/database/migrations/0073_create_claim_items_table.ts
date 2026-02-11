import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'claim_items'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)
      table.uuid('claim_id').references('id').inTable('claims').onDelete('CASCADE')
      table.uuid('order_item_id').references('id').inTable('order_items').onDelete('CASCADE')
      table.integer('quantity').notNullable()
      table.enum('reason', ['missing_item', 'wrong_item', 'production_failure', 'damaged', 'other']).notNullable()
      table.text('note').nullable()
      table.jsonb('images').defaultTo('[]')
      table.jsonb('tags').defaultTo('[]')
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.index(['claim_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
