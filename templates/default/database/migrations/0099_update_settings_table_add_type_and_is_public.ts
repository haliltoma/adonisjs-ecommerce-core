import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'settings'

  async up() {
    // Add missing type column
    if (!await this.schema.hasColumn(this.tableName, 'type')) {
      this.schema.alterTable(this.tableName, (table) => {
        table.enum('type', ['string', 'number', 'boolean', 'json', 'array']).defaultTo('string')
      })
    }

    // Rename is_encrypted to is_public if it exists, or add it
    const hasIsEncrypted = await this.schema.hasColumn(this.tableName, 'is_encrypted')
    const hasIsPublic = await this.schema.hasColumn(this.tableName, 'is_public')

    if (hasIsEncrypted && !hasIsPublic) {
      // Rename is_encrypted to is_public
      this.schema.alterTable(this.tableName, (table) => {
        table.renameColumn('is_encrypted', 'is_public')
      })
    } else if (!hasIsPublic) {
      this.schema.alterTable(this.tableName, (table) => {
        table.boolean('is_public').defaultTo(false)
      })
    }
  }

  async down() {
    // Drop type column if it exists
    if (await this.schema.hasColumn(this.tableName, 'type')) {
      this.schema.alterTable(this.tableName, (table) => {
        table.dropColumn('type')
      })
    }

    // Drop is_public column if it exists
    if (await this.schema.hasColumn(this.tableName, 'is_public')) {
      this.schema.alterTable(this.tableName, (table) => {
        table.dropColumn('is_public')
      })
    }

    // Add back is_encrypted if needed
    if (!await this.schema.hasColumn(this.tableName, 'is_encrypted')) {
      this.schema.alterTable(this.tableName, (table) => {
        table.boolean('is_encrypted').defaultTo(false)
      })
    }
  }
}
