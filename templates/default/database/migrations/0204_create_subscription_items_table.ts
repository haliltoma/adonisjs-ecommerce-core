import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'subscription_items'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('subscriptionId').references('id').inTable('subscriptions').onDelete('CASCADE')
      table.uuid('productId').references('id').inTable('products').onDelete('CASCADE')

      // Pricing
      table.decimal('amount', 10, 2).notNullable()
      table.integer('quantity').defaultTo(1)

      // Description
      table.string('description').nullable()

      // Metadata
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('createdAt', { useTz: true }).defaultTo(this.now())
      table.timestamp('updatedAt', { useTz: true }).defaultTo(this.now())

      // Indexes
      table.index(['subscriptionId'])
      table.index(['productId'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
