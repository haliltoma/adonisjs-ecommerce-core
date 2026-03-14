import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'downloads'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('digitalProductId').references('id').inTable('digital_products').onDelete('CASCADE')
      table.uuid('orderId').references('id').inTable('orders').onDelete('CASCADE')
      table.uuid('customerId').references('id').inTable('customers').onDelete('CASCADE')

      // Download tracking
      table.integer('downloadCount').default(0)
      table.integer('maxDownloads').default(5)
      table.dateTime('expiresAt').nullable()
      table.timestamp('lastDownloadedAt', { useTz: true }).nullable()

      // IP and user agent tracking
      table.string('ipAddress').nullable()
      table.text('userAgent').nullable()

      // Status
      table.enum('status', ['active', 'expired', 'revoked']).default('active')

      table.timestamp('createdAt', { useTz: true }).defaultTo(this.now())
      table.timestamp('updatedAt', { useTz: true }).defaultTo(this.now())

      // Indexes
      table.index(['customerId', 'status'])
      table.index(['orderId'])
      table.index(['expiresAt'])
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
