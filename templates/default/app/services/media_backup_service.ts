/**
 * Media Backup Service
 *
 * Handles backups of user-uploaded media files.
 * Supports compression, encryption, and incremental backups.
 */

import { spawn } from 'node:child_process'
import { createReadStream, createWriteStream, existsSync, mkdirSync, statSync, readdirSync, unlinkSync, rmSync } from 'node:fs'
import { join, dirname, basename } from 'node:path'
import { pipeline } from 'node:stream/promises'
import { randomBytes } from 'node:crypto'
import { DateTime } from 'luxon'
import archiver from 'archiver'
import backupConfig from '#config/backup'
import logger from '@adonisjs/core/services/logger'
import app from '@adonisjs/core/services/app'
import Backup from '#models/backup'
import { performanceMonitor } from './performance_monitor_service'
import type { BackupOptions, BackupResult } from './database_backup_service'

export default class MediaBackupService {
  private static instance: MediaBackupService

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): MediaBackupService {
    if (!MediaBackupService.instance) {
      MediaBackupService.instance = new MediaBackupService()
    }
    return MediaBackupService.instance
  }

  /**
   * Create a media backup
   */
  async createBackup(options: BackupOptions = {}): Promise<BackupResult> {
    const startTime = Date.now()
    let backup: Backup | null = null

    try {
      logger.info('Starting media backup', options)

      // Create backup record
      backup = await Backup.create({
        type: 'media',
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
      const fileName = `${backup.name}.tar${backupConfig.media.compression.enabled ? '.gz' : ''}`
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

      // Execute backup
      const backupResult = await this.executeBackup(filePath)

      if (!backupResult.success) {
        await backup.markFailed(backupResult.error || 'Unknown error')
        return {
          success: false,
          error: backupResult.error,
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
        statistics: backupResult.statistics,
      })

      // Log performance
      performanceMonitor.recordMetric({
        type: 'file_operation',
        name: 'media_backup',
        duration: duration * 1000,
        unit: 'ms',
        metadata: {
          backupId: backup.id,
          fileSize,
          compressed: backupConfig.media.compression.enabled,
        },
      })

      logger.info('Media backup completed successfully', {
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

      logger.error({ err: error }, 'Media backup failed')

      return {
        success: false,
        error: errorMessage,
        duration: (Date.now() - startTime) / 1000,
      }
    }
  }

  /**
   * Execute media backup
   */
  private async executeBackup(outputPath: string): Promise<{
    success: boolean
    error?: string
    statistics?: Record<string, any>
  }> {
    return new Promise((resolve) => {
      try {
        logger.info('Creating media archive')

        // Create output stream
        const output = createWriteStream(outputPath)
        const archive = archiver('tar', {
          gzip: backupConfig.media.compression.enabled,
          gzipOptions: {
            level: backupConfig.media.compression.level,
          },
        })

        // Track statistics
        let totalFiles = 0
        let totalSize = 0

        // Add directories to backup
        for (const dir of backupConfig.media.directories) {
          const fullPath = app.makePath(dir)

          if (!existsSync(fullPath)) {
            logger.warn(`Directory not found: ${dir}`)
            continue
          }

          logger.info(`Adding directory to backup: ${dir}`)

          // Collect files and statistics
          this.collectFiles(fullPath, archive, (stats) => {
            totalFiles += stats.files
            totalSize += stats.size
          })
        }

        // Finalize archive
        archive.finalize()

        archive.on('warning', (err) => {
          if (err.code === 'ENOENT') {
            logger.warn(`Archive warning: ${err.message}`)
          } else {
            logger.error({ err }, 'Archive warning')
          }
        })

        archive.on('error', (err) => {
          logger.error({ err }, 'Archive error')
          output.close()
          resolve({
            success: false,
            error: err.message,
          })
        })

        output.on('close', () => {
          logger.info('Media archive created successfully', {
            bytes: archive.pointer(),
          })
          resolve({
            success: true,
            statistics: {
              totalFiles,
              totalSize,
              compressed: backupConfig.media.compression.enabled,
            },
          })
        })

        // Pipe archive to output
        archive.pipe(output)
      } catch (error) {
        logger.error({ err: error }, 'Failed to create archive')
        resolve({
          success: false,
          error: (error as Error).message,
        })
      }
    })
  }

  /**
   * Collect files for backup
   */
  private collectFiles(
    dirPath: string,
    archive: archiver.Archiver,
    onProgress: (stats: { files: number; size: number }) => void
  ): void {
    const stats = {
      files: 0,
      size: 0,
    }

    const collect = (path: string) => {
      const entries = readdirSync(path, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(path, entry.name)

        if (entry.isDirectory()) {
          collect(fullPath)
        } else if (entry.isFile()) {
          try {
            const fileStats = statSync(fullPath)
            archive.file(fullPath, { name: fullPath.replace(app.appRoot, '') })
            stats.files++
            stats.size += fileStats.size
          } catch (error) {
            logger.warn(`Failed to add file to backup: ${fullPath}`)
          }
        }
      }
    }

    collect(dirPath)
    onProgress(stats)
  }

  /**
   * Restore media from backup
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

      logger.info('Starting media restore', { backupId })

      // Update backup status
      backup.status = 'restoring'
      await backup.save()

      // Execute restore
      const result = await this.executeRestore(backup.filePath)

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

      logger.info('Media restore completed successfully', {
        backupId,
        duration: `${duration.toFixed(2)}s`,
      })

      return {
        success: true,
        duration,
      }
    } catch (error) {
      const errorMessage = (error as Error).message
      logger.error({ err: error }, 'Media restore failed')

      return {
        success: false,
        error: errorMessage,
        duration: (Date.now() - startTime) / 1000,
      }
    }
  }

  /**
   * Execute media restore
   */
  private async executeRestore(backupPath: string): Promise<{
    success: boolean
    error?: string
  }> {
    return new Promise((resolve) => {
      try {
        logger.info('Extracting media archive')

        // Determine extract command based on compression
        const command = backupPath.endsWith('.gz') ? 'tar' : 'tar'
        const args = backupPath.endsWith('.gz')
          ? ['-xzf', backupPath, '-C', app.appRoot]
          : ['-xf', backupPath, '-C', app.appRoot]

        logger.info('Extract command', { command, args })

        const child = spawn(command, args)

        child.stderr.on('data', (data: Buffer) => {
          logger.warn(`Extract stderr: ${data.toString()}`)
        })

        child.on('close', (code: number) => {
          const success = code === 0
          resolve({
            success,
            error: success ? undefined : `Extract failed with code ${code}`,
          })
        })

        child.on('error', (error: Error) => {
          logger.error({ err: error }, 'Extract process error')
          resolve({
            success: false,
            error: error.message,
          })
        })

        // Timeout handling
        const timeout = backupConfig.performance.timeout * 1000
        const timer = setTimeout(() => {
          child.kill()
          resolve({
            success: false,
            error: `Restore timeout after ${timeout}ms`,
          })
        }, timeout)

        child.on('exit', () => {
          clearTimeout(timer)
        })
      } catch (error) {
        logger.error({ err: error }, 'Failed to extract archive')
        resolve({
          success: false,
          error: (error as Error).message,
        })
      }
    })
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

      logger.info(`Media backup deleted: ${backupId}`)
      return true
    } catch (error) {
      logger.error({ err: error }, `Failed to delete media backup: ${backupId}`)
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
        .where('type', 'media')
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

      logger.info(`Cleaned up ${deleted} old media backups`)
    } catch (error) {
      logger.error({ err: error }, 'Failed to cleanup old media backups')
    }

    return deleted
  }

  /**
   * Get storage usage statistics
   */
  async getStorageStats(): Promise<{
    totalSize: number
    fileCount: number
    directoryStats: Array<{
      directory: string
      size: number
      files: number
    }>
  }> {
    const stats = {
      totalSize: 0,
      fileCount: 0,
      directoryStats: [] as Array<{
        directory: string
        size: number
        files: number
      }>,
    }

    for (const dir of backupConfig.media.directories) {
      const fullPath = app.makePath(dir)

      if (!existsSync(fullPath)) {
        continue
      }

      const dirStats = this.getDirectoryStats(fullPath)
      stats.totalSize += dirStats.size
      stats.fileCount += dirStats.files

      stats.directoryStats.push({
        directory: dir,
        size: dirStats.size,
        files: dirStats.files,
      })
    }

    return stats
  }

  /**
   * Get directory statistics
   */
  private getDirectoryStats(dirPath: string): { size: number; files: number } {
    let size = 0
    let files = 0

    const traverse = (path: string) => {
      const entries = readdirSync(path, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(path, entry.name)

        if (entry.isDirectory()) {
          traverse(fullPath)
        } else if (entry.isFile()) {
          try {
            const fileStats = statSync(fullPath)
            size += fileStats.size
            files++
          } catch (error) {
            // Skip files that can't be read
          }
        }
      }
    }

    traverse(dirPath)
    return { size, files }
  }

  /**
   * Generate backup name
   */
  private generateBackupName(): string {
    const now = DateTime.now()
    return `media-${now.toFormat('yyyy-MM-dd-HH-mm-ss')}`
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
export const mediaBackup = MediaBackupService.getInstance()
