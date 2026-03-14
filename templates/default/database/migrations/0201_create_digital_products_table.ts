import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'digital_products'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary()
      table.uuid('productId').references('id').inTable('products').onDelete('CASCADE')
      table.string('fileName').notNullable()
      table.string('filePath').notNullable()
      table.string('fileMimeType').notNullable()
      table.integer('fileSize').notNullable()
      table.string('fileHash').nullable()

      // License management
      table.boolean('requiresLicense').default(false)
      table.integer('licenseDurationDays').nullable()

      // Version tracking
      table.string('version').nullable()
      table.text('releaseNotes').nullable()

      table.timestamp('createdAt', { useTz: true }).defaultTo(this.now())
      table.timestamp('updatedAt', { useTz: true }).defaultTo(this.now())
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
