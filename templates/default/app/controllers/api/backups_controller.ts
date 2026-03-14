/**
 * Backups Controller
 *
 * Admin API for managing database, media, and full system backups.
 */

import type { HttpContext } from '@adonisjs/core/http'
import { schema } from '@adonisjs/core/validator'
import Backup from '#models/backup'
import { databaseBackup } from '#services/database_backup_service'
import { mediaBackup } from '#services/media_backup_service'
import { disasterRecovery } from '#services/disaster_recovery_service'
import logger from '@adonisjs/core/services/logger'

export default class BackupsController {
  /**
   * List all backups with filtering and pagination
   * GET /admin/backups
   */
  async index({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const type = request.input('type') // 'database', 'media', 'full'
    const status = request.input('status') // 'pending', 'in_progress', 'completed', 'failed'

    const query = Backup.query().orderBy('created_at', 'desc')

    if (type) {
      query.where('type', type)
    }

    if (status) {
      query.where('status', status)
    }

    const backups = await query.paginate(page, limit)

    return response.ok({
      data: backups.toJSON().data,
      meta: backups.toJSON().meta,
    })
  }

  /**
   * Get backup details
   * GET /admin/backups/:id
   */
  async show({ params, response }: HttpContext) {
    const backup = await Backup.find(params.id)

    if (!backup) {
      return response.notFound({
        error: 'Backup not found',
      })
    }

    return response.ok({
      data: backup.serialize(),
    })
  }

  /**
   * Trigger manual database backup
   * POST /admin/backups/database
   */
  async createDatabaseBackup({ request, response }: HttpContext) {
    try {
      // createdBy field will be set to a placeholder since admin auth doesn't expose user ID
      const userId = request.input('userId') || null

      const payload = await request.validate({
        schema: schema.create({
          name: schema.string.optional(),
          description: schema.string.optional(),
        }),
      })

      const result = await databaseBackup.createBackup({
        name: payload.name,
        description: payload.description,
        createdBy: userId,
      })

      if (!result.success) {
        return response.badRequest({
          error: result.error,
        })
      }

      logger.info('Manual database backup created', {
        backupId: result.backup?.id,
        userId: user.id,
      })

      return response.created({
        data: result.backup?.serialize(),
        message: 'Database backup created successfully',
      })
    } catch (error) {
      logger.error({ err: error }, 'Failed to create database backup')
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Trigger manual media backup
   * POST /admin/backups/media
   */
  async createMediaBackup({ request, response }: HttpContext) {
    try {
      const payload = await request.validate({
        schema: schema.create({
          name: schema.string.optional(),
          description: schema.string.optional(),
        }),
      })

      const userId = request.input('userId') || null

      const result = await mediaBackup.createBackup({
        name: payload.name,
        description: payload.description,
        createdBy: userId,
      })

      if (!result.success) {
        return response.badRequest({
          error: result.error,
        })
      }

      logger.info('Manual media backup created', {
        backupId: result.backup?.id,
      })

      return response.created({
        data: result.backup?.serialize(),
        message: 'Media backup created successfully',
      })
    } catch (error) {
      logger.error({ err: error }, 'Failed to create media backup')
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Trigger full system backup (database + media)
   * POST /admin/backups/full
   */
  async createFullBackup({ request, response }: HttpContext) {
    try {
      const payload = await request.validate({
        schema: schema.create({
          name: schema.string.optional(),
          description: schema.string.optional(),
        }),
      })

      const userId = request.input('userId') || null

      const result = await disasterRecovery.createFullBackup({
        name: payload.name,
        description: payload.description,
        createdBy: userId,
      })

      if (!result.success) {
        return response.badRequest({
          error: result.error,
        })
      }

      logger.info('Manual full backup created', {
        databaseBackupId: result.databaseBackup?.id,
        mediaBackupId: result.mediaBackup?.id,
      })

      return response.created({
        data: {
          database: result.databaseBackup?.serialize(),
          media: result.mediaBackup?.serialize(),
        },
        message: 'Full backup created successfully',
      })
    } catch (error) {
      logger.error({ err: error }, 'Failed to create full backup')
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Restore from backup
   * POST /admin/backups/:id/restore
   */
  async restore({ params, response }: HttpContext) {
    try {
      const backup = await Backup.find(params.id)

      if (!backup) {
        return response.notFound({
          error: 'Backup not found',
        })
      }

      if (!backup.canRestore) {
        return response.badRequest({
          error: 'Backup cannot be restored',
          reason: backup.status === 'restoring' ? 'Restore already in progress' : 'Invalid backup status',
        })
      }

      // Trigger restore in background
      const restorePromise = backup.type === 'database'
        ? databaseBackup.restoreBackup(backup.id)
        : mediaBackup.restoreBackup(backup.id)

      // Don't wait for completion
      restorePromise.then((result) => {
        if (result.success) {
          logger.info(`Backup restored successfully: ${backup.id}`)
        } else {
          logger.error(`Backup restore failed: ${backup.id}`, { error: result.error })
        }
      })

      return response.ok({
        message: 'Restore operation started',
        backupId: backup.id,
      })
    } catch (error) {
      logger.error({ err: error }, 'Failed to start restore')
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Delete backup
   * DELETE /admin/backups/:id
   */
  async destroy({ params, response }: HttpContext) {
    try {
      const backup = await Backup.find(params.id)

      if (!backup) {
        return response.notFound({
          error: 'Backup not found',
        })
      }

      if (!backup.canDelete) {
        return response.badRequest({
          error: 'Backup cannot be deleted',
          reason: 'Backup is in progress or being restored',
        })
      }

      const success = backup.type === 'database'
        ? await databaseBackup.deleteBackup(backup.id)
        : await mediaBackup.deleteBackup(backup.id)

      if (!success) {
        return response.badRequest({
          error: 'Failed to delete backup',
        })
      }

      logger.info(`Backup deleted: ${params.id}`)

      return response.ok({
        message: 'Backup deleted successfully',
      })
    } catch (error) {
      logger.error({ err: error }, 'Failed to delete backup')
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Retain backup (prevent automatic deletion)
   * POST /admin/backups/:id/retain
   */
  async retain({ params, response }: HttpContext) {
    try {
      const backup = await Backup.find(params.id)

      if (!backup) {
        return response.notFound({
          error: 'Backup not found',
        })
      }

      await backup.retain()

      logger.info(`Backup retained: ${params.id}`)

      return response.ok({
        message: 'Backup retained successfully',
        data: backup.serialize(),
      })
    } catch (error) {
      logger.error({ err: error }, 'Failed to retain backup')
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Release backup (allow automatic deletion)
   * POST /admin/backups/:id/release
   */
  async release({ params, response }: HttpContext) {
    try {
      const backup = await Backup.find(params.id)

      if (!backup) {
        return response.notFound({
          error: 'Backup not found',
        })
      }

      await backup.release()

      logger.info(`Backup released: ${params.id}`)

      return response.ok({
        message: 'Backup released successfully',
        data: backup.serialize(),
      })
    } catch (error) {
      logger.error({ err: error }, 'Failed to release backup')
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Download backup file
   * GET /admin/backups/:id/download
   */
  async download({ params, response }: HttpContext) {
    try {
      const backup = await Backup.find(params.id)

      if (!backup) {
        return response.notFound({
          error: 'Backup not found',
        })
      }

      if (!backup.canRestore) {
        return response.badRequest({
          error: 'Backup cannot be downloaded',
        })
      }

      const fs = require('node:fs')
      if (!fs.existsSync(backup.filePath)) {
        return response.notFound({
          error: 'Backup file not found',
        })
      }

      return response.download(backup.filePath)
    } catch (error) {
      logger.error({ err: error }, 'Failed to download backup')
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Get backup statistics
   * GET /admin/backups/stats
   */
  async stats({ response }: HttpContext) {
    try {
      const stats = await disasterRecovery.getBackupStats()
      const recoveryStatus = await disasterRecovery.getRecoveryStatus()

      return response.ok({
        data: {
          backups: stats,
          recovery: recoveryStatus,
        },
      })
    } catch (error) {
      logger.error({ err: error }, 'Failed to get backup stats')
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Create and execute recovery plan
   * POST /admin/backups/recovery/plan
   */
  async createRecoveryPlan({ request, response }: HttpContext) {
    try {
      const payload = await request.validate({
        schema: schema.create({
          name: schema.string(),
          description: schema.string(),
          databaseBackupId: schema.string(),
          mediaBackupId: schema.string.optional(),
        }),
      })

      // Verify backups exist
      const dbBackup = await Backup.find(payload.databaseBackupId)
      if (!dbBackup || dbBackup.type !== 'database') {
        return response.badRequest({
          error: 'Invalid database backup',
        })
      }

      if (payload.mediaBackupId) {
        const mediaBackup = await Backup.find(payload.mediaBackupId)
        if (!mediaBackup || mediaBackup.type !== 'media') {
          return response.badRequest({
            error: 'Invalid media backup',
          })
        }
      }

      const plan = await disasterRecovery.createRecoveryPlan(payload)

      return response.ok({
        data: plan,
        message: 'Recovery plan created successfully',
      })
    } catch (error) {
      logger.error({ err: error }, 'Failed to create recovery plan')
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Execute recovery plan
   * POST /admin/backups/recovery/execute
   */
  async executeRecovery({ request, response }: HttpContext) {
    try {
      const payload = await request.validate({
        schema: schema.create({
          plan: schema.object.any(),
        }),
      })

      const result = await disasterRecovery.executeRecoveryPlan(payload.plan)

      if (!result.success) {
        return response.badRequest({
          error: result.error,
          steps: result.steps,
        })
      }

      return response.ok({
        message: 'Recovery completed successfully',
        steps: result.steps,
        duration: result.duration,
      })
    } catch (error) {
      logger.error({ err: error }, 'Failed to execute recovery')
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Get active recovery status
   * GET /admin/backups/recovery/status
   */
  async recoveryStatus({ response }: HttpContext) {
    const activeRecovery = disasterRecovery.getActiveRecovery()
    const recoveryStatus = await disasterRecovery.getRecoveryStatus()

    return response.ok({
      data: {
        active: activeRecovery,
        status: recoveryStatus,
      },
    })
  }

  /**
   * Cancel active recovery
   * POST /admin/backups/recovery/cancel
   */
  async cancelRecovery({ response }: HttpContext) {
    const cancelled = await disasterRecovery.cancelRecovery()

    if (!cancelled) {
      return response.badRequest({
        error: 'No active recovery to cancel',
      })
    }

    return response.ok({
      message: 'Recovery cancelled successfully',
    })
  }

  /**
   * Clean up old backups
   * POST /admin/backups/cleanup
   */
  async cleanup({ response }: HttpContext) {
    try {
      const dbDeleted = await databaseBackup.cleanupOldBackups()
      const mediaDeleted = await mediaBackup.cleanupOldBackups()

      logger.info(`Backup cleanup completed: ${dbDeleted + mediaDeleted} backups deleted`)

      return response.ok({
        message: 'Cleanup completed successfully',
        data: {
          database: dbDeleted,
          media: mediaDeleted,
          total: dbDeleted + mediaDeleted,
        },
      })
    } catch (error) {
      logger.error({ err: error }, 'Failed to cleanup backups')
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }
}
