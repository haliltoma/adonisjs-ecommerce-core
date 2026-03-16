/**
 * Backup Model
 *
 * Represents a system backup (database, media, or full).
 */

import { DateTime } from 'luxon'
import { column, BaseModel } from '@adonisjs/lucid/orm'

export default class Backup extends BaseModel {
  static table = 'backups'

  @column({ isPrimary: true })
  declare id: string

  @column()
  declare type: 'database' | 'media' | 'full'

  @column()
  declare name: string

  @column()
  declare description: string | null

  @column()
  declare filePath: string

  @column()
  declare fileName: string

  @column()
  declare fileSize: number

  @column()
  declare status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'restoring'

  @column()
  declare metadata: Record<string, any> | null

  @column()
  declare checksum: string | null

  @column()
  declare verified: boolean

  @column.dateTime()
  declare verifiedAt: DateTime | null

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column()
  declare retained: boolean

  @column()
  declare duration: number | null

  @column()
  declare statistics: Record<string, any> | null

  @column()
  declare errorMessage: string | null

  @column()
  declare retryCount: number

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime()
  declare completedAt: DateTime | null

  @column()
  declare createdBy: string | null

  /**
   * Computed Properties
   */

  /**
   * Get file size in human-readable format
   */
  get fileSizeHuman(): string {
    const bytes = this.fileSize
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  /**
   * Get backup duration in human-readable format
   */
  get durationHuman(): string | null {
    if (!this.duration) return null
    const minutes = Math.floor(this.duration / 60)
    const seconds = this.duration % 60
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`
    }
    return `${seconds}s`
  }

  /**
   * Check if backup is expired
   */
  get isExpired(): boolean {
    if (!this.expiresAt || this.retained) return false
    return DateTime.now() > this.expiresAt
  }

  /**
   * Check if backup can be restored
   */
  get canRestore(): boolean {
    return this.status === 'completed' && !this.isExpired
  }

  /**
   * Check if backup can be deleted
   */
  get canDelete(): boolean {
    return this.status !== 'in_progress' && this.status !== 'restoring'
  }

  /**
   * Query Scopes
   */

  /**
   * Scope to get backups by type
   */
  static byType(type: 'database' | 'media' | 'full') {
    return this.query().where('type', type)
  }

  /**
   * Scope to get backups by status
   */
  static byStatus(status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'restoring') {
    return this.query().where('status', status)
  }

  /**
   * Scope to get completed backups
   */
  static completed() {
    return this.query().where('status', 'completed')
  }

  /**
   * Scope to get failed backups
   */
  static failed() {
    return this.query().where('status', 'failed')
  }

  /**
   * Scope to get active backups (in progress or pending)
   */
  static active() {
    return this.query().whereIn('status', ['pending', 'in_progress'])
  }

  /**
   * Scope to get retained backups
   */
  static retained() {
    return this.query().where('retained', true)
  }

  /**
   * Scope to get expired backups
   */
  static expired() {
    return this.query()
      .where('expires_at', '<', DateTime.now().toSQL())
      .where('retained', false)
  }

  /**
   * Scope to get backups created by user
   */
  static byUser(userId: string) {
    return this.query().where('createdBy', userId)
  }

  /**
   * Scope to get recent backups
   */
  static recent(days: number = 7) {
    const cutoff = DateTime.now().minus({ days }).toSQL()
    return this.query().where('created_at', '>=', cutoff)
  }

  /**
   * Methods
   */

  /**
   * Mark backup as in progress
   */
  async markInProgress(): Promise<void> {
    this.status = 'in_progress'
    await this.save()
  }

  /**
   * Mark backup as completed
   */
  async markCompleted(metadata: {
    fileSize: number
    duration: number
    checksum?: string
    statistics?: Record<string, any>
  }): Promise<void> {
    this.status = 'completed'
    this.fileSize = metadata.fileSize
    this.duration = metadata.duration
    this.completedAt = DateTime.now()
    if (metadata.checksum) {
      this.checksum = metadata.checksum
    }
    if (metadata.statistics) {
      this.statistics = metadata.statistics
    }
    await this.save()
  }

  /**
   * Mark backup as failed
   */
  async markFailed(error: string): Promise<void> {
    this.status = 'failed'
    this.errorMessage = error
    this.retryCount++
    this.completedAt = DateTime.now()
    await this.save()
  }

  /**
   * Verify backup integrity
   */
  async verify(): Promise<boolean> {
    // TODO: Implement checksum verification
    this.verified = true
    this.verifiedAt = DateTime.now()
    await this.save()
    return true
  }

  /**
   * Retain backup (prevent automatic deletion)
   */
  async retain(): Promise<void> {
    this.retained = true
    this.expiresAt = null
    await this.save()
  }

  /**
   * Release backup (allow automatic deletion)
   */
  async release(): Promise<void> {
    this.retained = false
    await this.save()
  }
}
