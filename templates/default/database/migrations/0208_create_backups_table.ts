import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'backups'

  public async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.db.rawQuery('gen_random_uuid()').knexQuery)

      // Backup type and metadata
      table.enum('type', ['database', 'media', 'full']).notNullable()
      table.string('name').notNullable()
      table.text('description').nullable()

      // File information
      table.string('file_path').notNullable()
      table.string('file_name').notNullable()
      table.bigInteger('file_size').unsigned().notNullable() // in bytes

      // Backup status
      table
        .enum('status', ['pending', 'in_progress', 'completed', 'failed', 'restoring'])
        .defaultTo('pending')
        .notNullable()

      // Backup metadata
      table.json('metadata').nullable() // Additional backup-specific data

      // Verification and integrity
      table.string('checksum').nullable() // MD5/SHA checksum for integrity verification
      table.boolean('verified').defaultTo(false)
      table.timestamp('verified_at').nullable()

      // Retention policy
      table.timestamp('expires_at').nullable()
      table.boolean('retained').defaultTo(false) // Pin important backups

      // Backup statistics
      table.integer('duration').unsigned().nullable() // Backup duration in seconds
      table.json('statistics').nullable() // Tables, rows, files, etc.

      // Error tracking
      table.text('error_message').nullable()
      table.integer('retry_count').unsigned().defaultTo(0)

      // Timestamps
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('completed_at', { useTz: true }).nullable()

      // Created by
      table.uuid('created_by').nullable()

      // Indexes
      table.index('type')
      table.index('status')
      table.index('created_at')
      table.index('expires_at')
    })
  }

  public async down() {
    this.schema.dropTable(this.tableName)
  }
}
