/**
 * Database Backup Service
 *
 * Handles PostgreSQL database backups using pg_dump.
 * Supports compression, encryption, and retention policies.
 */

import { spawn } from 'node:child_process'
import { createReadStream, createWriteStream, existsSync, mkdirSync, statSync, unlinkSync } from 'node:fs'
import { pipeline } from 'node:stream/promises'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import Database from '@adonisjs/lucid/database'
import backupConfig from '#config/backup'
import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import Backup from '#models/backup'
import { performanceMonitor } from './performance_monitor_service'

export type BackupType = 'database' | 'media' | 'full'

interface BackupOptions {
  name?: string
  description?: string
  createdBy?: string
  schedule?: boolean // Is this a scheduled backup
}

interface BackupResult {
  success: boolean
  backup?: Backup
  error?: string
  duration: number
  fileSize?: number
}

export default class DatabaseBackupService {
  private static instance: DatabaseBackupService

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DatabaseBackupService {
    if (!DatabaseBackupService.instance) {
      DatabaseBackupService.instance = new DatabaseBackupService()
    }
    return DatabaseBackupService.instance
  }

  /**
   * Create a database backup
   */
  async createBackup(options: BackupOptions = {}): Promise<BackupResult> {
    const startTime = Date.now()
    let backup: Backup | null = null

    try {
      logger.info('Starting database backup', options)

      // Create backup record
      backup = await Backup.create({
        type: 'database',
        name: options.name || this.generateBackupName(),
        description: options.description,
        status: 'pending',
        filePath: '',
        fileName: '',
        fileSize: 0,
        createdBy: options.createdBy,
        retryCount: 0,
      })

      // Mark as in progress
      await backup.markInProgress()

      // Generate backup file path
      const fileName = `${backup.name}.sql${backupConfig.database.compression.enabled ? '.gz' : ''}`
      const filePath = this.getBackupFilePath(fileName)

      // Ensure directory exists
      const backupDir = this.getBackupDirectory()
      if (!existsSync(backupDir)) {
        mkdirSync(backupDir, { recursive: true })
      }

      // Update backup with file info
      backup.filePath = filePath
      backup.fileName = fileName
      await backup.save()

      // Execute pg_dump
      const dumpResult = await this.executePgDump(filePath)

      if (!dumpResult.success) {
        await backup.markFailed(dumpResult.error || 'Unknown error')
        return {
          success: false,
          error: dumpResult.error,
          duration: (Date.now() - startTime) / 1000,
        }
      }

      // Calculate checksum
      const checksum = await this.calculateChecksum(filePath)

      // Get file size
      const stats = statSync(filePath)
      const fileSize = stats.size

      // Mark as completed
      const duration = (Date.now() - startTime) / 1000
      await backup.markCompleted({
        fileSize,
        duration,
        checksum,
        statistics: dumpResult.statistics,
      })

      // Log performance
      performanceMonitor.recordMetric({
        type: 'file_operation',
        name: 'database_backup',
        duration: duration * 1000,
        unit: 'ms',
        metadata: {
          backupId: backup.id,
          fileSize,
          compressed: backupConfig.database.compression.enabled,
        },
      })

      logger.info('Database backup completed successfully', {
        backupId: backup.id,
        fileName,
        fileSize,
        duration: `${duration.toFixed(2)}s`,
      })

      return {
        success: true,
        backup,
        fileSize,
        duration,
      }
    } catch (error) {
      const errorMessage = (error as Error).message

      if (backup) {
        await backup.markFailed(errorMessage)
      }

      logger.error({ err: error }, 'Database backup failed')

      return {
        success: false,
        error: errorMessage,
        duration: (Date.now() - startTime) / 1000,
      }
    }
  }

  /**
   * Execute pg_dump command
   */
  private async executePgDump(outputPath: string): Promise<{
    success: boolean
    error?: string
    statistics?: Record<string, any>
  }> {
    const connection = Database.connection()
    const config = connection.config

    // Build pg_dump command
    const args = this.buildPgDumpArgs(config)

    logger.info('Executing pg_dump', { args })

    return new Promise((resolve) => {
      try {
        let pgDump: any = spawn('pg_dump', args)

        // Optional: Compress output
        let outputStream = createWriteStream(outputPath)
        let input = pgDump.stdout

        if (backupConfig.database.compression.enabled) {
          const gzip = spawn('gzip', [`-${backupConfig.database.compression.level}`])
          pgDump.stdout.pipe(gzip.stdin)
          input = gzip.stdout
        }

        // Pipe to output file
        pipeline(input, outputStream)
          .then(() => {
            const success = pgDump.exitCode === 0

            if (success) {
              resolve({
                success: true,
                statistics: {
                  compressed: backupConfig.database.compression.enabled,
                  format: backupConfig.database.dump.format,
                },
              })
            } else {
              resolve({
                success: false,
                error: 'pg_dump exited with non-zero code',
              })
            }
          })
          .catch((error) => {
            logger.error({ err: error }, 'Failed to write backup file')
            resolve({
              success: false,
              error: error.message,
            })
          })

        pgDump.stderr.on('data', (data: Buffer) => {
          logger.warn(`pg_dump stderr: ${data.toString()}`)
        })

        pgDump.on('error', (error: Error) => {
          logger.error({ err: error }, 'pg_dump process error')
          resolve({
            success: false,
            error: error.message,
          })
        })

        // Timeout handling
        const timeout = backupConfig.performance.timeout * 1000
        const timer = setTimeout(() => {
          pgDump.kill()
          resolve({
            success: false,
            error: `Backup timeout after ${timeout}ms`,
          })
        }, timeout)

        pgDump.on('exit', () => {
          clearTimeout(timer)
        })
      } catch (error) {
        logger.error({ err: error }, 'Failed to spawn pg_dump')
        resolve({
          success: false,
          error: (error as Error).message,
        })
      }
    })
  }

  /**
   * Build pg_dump command arguments
   */
  private buildPgDumpArgs(config: any): string[] {
    const args: string[] = []

    // Connection options
    args.push('-h', config.host || 'localhost')
    args.push('-p', String(config.port || 5432))
    args.push('-U', config.user || 'postgres')
    args.push('-d', config.database || 'adoniscommerce')

    // Format
    if (backupConfig.database.dump.format === 'custom') {
      args.push('-Fc') // Custom format
    } else {
      args.push('-Fp') // Plain text SQL
    }

    // Create database statement
    if (backupConfig.database.dump.createDb) {
      args.push('-C')
    }

    // Clean schema before restore
    if (backupConfig.database.dump.clean) {
      args.push('-c')
    }

    // Extensions
    if (backupConfig.database.dump.extensions) {
      args.push('-E')
    }

    // Exclude tables
    for (const table of backupConfig.database.dump.excludeTables) {
      args.push('-T', table)
    }

    // Only specific tables
    if (backupConfig.database.dump.onlyTables.length > 0) {
      args.push('-t', backupConfig.database.dump.onlyTables.join('|'))
    }

    // Password via environment variable
    process.env.PGPASSWORD = config.password

    return args
  }

  /**
   * Restore database from backup
   */
  async restoreBackup(backupId: string): Promise<{
    success: boolean
    error?: string
    duration: number
  }> {
    const startTime = Date.now()

    try {
      const backup = await Backup.find(backupId)

      if (!backup) {
        return {
          success: false,
          error: 'Backup not found',
          duration: (Date.now() - startTime) / 1000,
        }
      }

      if (!backup.canRestore) {
        return {
          success: false,
          error: 'Backup cannot be restored',
          duration: (Date.now() - startTime) / 1000,
        }
      }

      logger.info('Starting database restore', { backupId })

      // Update backup status
      backup.status = 'restoring'
      await backup.save()

      // Execute pg_restore
      const result = await this.executePgRestore(backup.filePath)

      if (!result.success) {
        backup.status = 'completed'
        await backup.save()
        return {
          success: false,
          error: result.error,
          duration: (Date.now() - startTime) / 1000,
        }
      }

      // Reset backup status
      backup.status = 'completed'
      await backup.save()

      const duration = (Date.now() - startTime) / 1000

      logger.info('Database restore completed successfully', {
        backupId,
        duration: `${duration.toFixed(2)}s`,
      })

      return {
        success: true,
        duration,
      }
    } catch (error) {
      const errorMessage = (error as Error).message
      logger.error({ err: error }, 'Database restore failed')

      return {
        success: false,
        error: errorMessage,
        duration: (Date.now() - startTime) / 1000,
      }
    }
  }

  /**
   * Execute pg_restore command
   */
  private async executePgRestore(backupPath: string): Promise<{
    success: boolean
    error?: string
  }> {
    const connection = Database.connection()
    const config = connection.config

    return new Promise((resolve) => {
      try {
        const args = this.buildPgRestoreArgs(config, backupPath)

        logger.info('Executing pg_restore', { args })

        const pgRestore = spawn('pg_restore', args)

        pgRestore.stdout.on('data', (data: Buffer) => {
          logger.info(`pg_restore: ${data.toString()}`)
        })

        pgRestore.stderr.on('data', (data: Buffer) => {
          logger.warn(`pg_restore stderr: ${data.toString()}`)
        })

        pgRestore.on('close', (code: number) => {
          const success = code === 0
          resolve({
            success,
            error: success ? undefined : `pg_restore exited with code ${code}`,
          })
        })

        pgRestore.on('error', (error: Error) => {
          logger.error({ err: error }, 'pg_restore process error')
          resolve({
            success: false,
            error: error.message,
          })
        })

        // Timeout handling
        const timeout = backupConfig.performance.timeout * 1000
        const timer = setTimeout(() => {
          pgRestore.kill()
          resolve({
            success: false,
            error: `Restore timeout after ${timeout}ms`,
          })
        }, timeout)

        pgRestore.on('exit', () => {
          clearTimeout(timer)
        })
      } catch (error) {
        logger.error({ err: error }, 'Failed to spawn pg_restore')
        resolve({
          success: false,
          error: (error as Error).message,
        })
      }
    })
  }

  /**
   * Build pg_restore command arguments
   */
  private buildPgRestoreArgs(config: any, backupPath: string): string[] {
    const args: string[] = []

    // Connection options
    args.push('-h', config.host || 'localhost')
    args.push('-p', String(config.port || 5432))
    args.push('-U', config.user || 'postgres')
    args.push('-d', config.database || 'adoniscommerce')

    // Clean schema before restore
    if (backupConfig.database.dump.clean) {
      args.push('-c')
    }

    // Format
    if (backupConfig.database.dump.format === 'custom') {
      args.push('-Fc') // Custom format
    }

    // Backup file path
    args.push(backupPath)

    // Password via environment variable
    process.env.PGPASSWORD = config.password

    return args
  }

  /**
   * Delete backup file and record
   */
  async deleteBackup(backupId: string): Promise<boolean> {
    try {
      const backup = await Backup.find(backupId)

      if (!backup) {
        logger.warn(`Backup not found: ${backupId}`)
        return false
      }

      if (!backup.canDelete) {
        logger.warn(`Backup cannot be deleted: ${backupId}`)
        return false
      }

      // Delete file
      if (existsSync(backup.filePath)) {
        unlinkSync(backup.filePath)
      }

      // Delete record
      await backup.delete()

      logger.info(`Backup deleted: ${backupId}`)
      return true
    } catch (error) {
      logger.error({ err: error }, `Failed to delete backup: ${backupId}`)
      return false
    }
  }

  /**
   * Clean up old backups based on retention policy
   */
  async cleanupOldBackups(): Promise<number> {
    let deleted = 0

    try {
      const now = DateTime.now()

      // Get completed backups that are not retained
      const backups = await Backup.query()
        .where('status', 'completed')
        .where('retained', false)
        .whereNotNull('expires_at')
        .where('expires_at', '<', now.toSQL())
        .orderBy('created_at', 'desc')

      for (const backup of backups) {
        if (await this.deleteBackup(backup.id)) {
          deleted++
        }
      }

      logger.info(`Cleaned up ${deleted} old backups`)
    } catch (error) {
      logger.error({ err: error }, 'Failed to cleanup old backups')
    }

    return deleted
  }

  /**
   * Generate backup name
   */
  private generateBackupName(): string {
    const now = DateTime.now()
    return `db-${now.toFormat('yyyy-MM-dd-HH-mm-ss')}`
  }

  /**
   * Get backup file path
   */
  private getBackupFilePath(fileName: string): string {
    const dir = this.getBackupDirectory()
    return `${dir}/${fileName}`
  }

  /**
   * Get backup directory
   */
  private getBackupDirectory(): string {
    const backupPath = backupConfig.destinations.local.path
    return app.makePath(backupPath)
  }

  /**
   * Calculate file checksum (MD5)
   */
  private async calculateChecksum(filePath: string): Promise<string> {
    const crypto = require('node:crypto')
    const hash = crypto.createHash('md5')
    const stream = createReadStream(filePath)

    return new Promise((resolve, reject) => {
      stream.on('data', (chunk: Buffer) => hash.update(chunk))
      stream.on('end', () => resolve(hash.digest('hex')))
      stream.on('error', reject)
    })
  }
}

/**
 * Export singleton instance
 */
export const databaseBackup = DatabaseBackupService.getInstance()
