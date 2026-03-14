import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'licenses'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.string('licenseKey').notNullable().unique()

      // Associations
      table.uuid('digitalProductId').references('id').inTable('digital_products').onDelete('CASCADE')
      table.uuid('customerId').references('id').inTable('customers').onDelete('CASCADE')
      table.uuid('orderId').references('id').inTable('orders').onDelete('CASCADE')

      // License details
      table.string('licenseType').defaultTo('standard') // standard, enterprise, educational, etc.
      table.integer('maxActivations').defaultTo(3)
      table.integer('currentActivations').defaultTo(0)

      // Validity
      table.dateTime('validFrom').notNullable()
      table.dateTime('validUntil').nullable()

      // Status
      table.enum('status', ['active', 'suspended', 'revoked', 'expired']).defaultTo('active')

      // Activation tracking
      table.jsonb('activations').defaultTo('[]') // Array of activation records

      // Metadata
      table.jsonb('metadata').defaultTo('{}')
      table.timestamp('createdAt', { useTz: true }).defaultTo(this.now())
      table.timestamp('updatedAt', { useTz: true }).defaultTo(this.now())

      // Indexes
      table.index(['licenseKey'])
      table.index(['customerId'])
      table.index(['status'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
