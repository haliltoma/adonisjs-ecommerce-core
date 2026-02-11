import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'gift_card_transactions'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('gift_card_id').notNullable().references('id').inTable('gift_cards').onDelete('CASCADE')
      table.uuid('order_id').nullable().references('id').inTable('orders').onDelete('SET NULL')
      table.decimal('amount', 12, 2).notNullable()
      table.string('type', 20).notNullable().defaultTo('usage') // usage, refund, adjustment
      table.text('note').nullable()
      table.timestamp('created_at').notNullable()

      table.index(['gift_card_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
