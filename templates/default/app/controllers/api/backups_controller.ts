/**
 * Backups Controller
 *
 * Admin API for managing database, media, and full system backups.
 */

import type { HttpContext } from '@adonisjs/core/http'
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

    const query = Backup.query().orderBy('createdAt', 'desc')

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
      const userId = request.input('userId') || null
      const name = request.input('name')
      const description = request.input('description')

      const result = await databaseBackup.createBackup({
        name,
        description,
        createdBy: userId,
      })

      if (!result.success) {
        return response.badRequest({
          error: result.error,
        })
      }

      logger.info('Manual database backup created', {
        backupId: result.backup?.id,
        userId,
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
      const userId = request.input('userId') || null
      const name = request.input('name')
      const description = request.input('description')

      const result = await mediaBackup.createBackup({
        name,
        description,
        createdBy: userId,
      })

      if (!result.success) {
        return response.badRequest({
          error: result.error,
        })
      }

      logger.info('Manual media backup created', {
        backupId: result.backup?.id,
        userId,
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
   * Trigger full system backup
   * POST /admin/backups/full
   */
  async createFullBackup({ request, response }: HttpContext) {
    try {
      const userId = request.input('userId') || null
      const name = request.input('name')
      const description = request.input('description')

      const result = await disasterRecovery.createFullBackup({
        name,
        description,
        createdBy: userId,
      })

      if (!result.success) {
        return response.badRequest({
          error: result.error,
        })
      }

      logger.info('Full system backup created', {
        backupId: result.backup?.id,
        userId,
      })

      return response.created({
        data: result.backup?.serialize(),
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
   * Delete a backup
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
          error: 'Cannot delete backup that is in progress or being restored',
        })
      }

      await disasterRecovery.deleteBackup(backup.id)

      logger.info('Backup deleted', { backupId: backup.id })

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
   * Restore a backup
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
        })
      }

      const result = await disasterRecovery.restoreBackup(backup.id)

      if (!result.success) {
        return response.badRequest({
          error: result.error,
        })
      }

      logger.info('Backup restored', { backupId: backup.id })

      return response.ok({
        message: 'Backup restored successfully',
      })
    } catch (error) {
      logger.error({ err: error }, 'Failed to restore backup')
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Verify backup integrity
   * POST /admin/backups/:id/verify
   */
  async verify({ params, response }: HttpContext) {
    try {
      const backup = await Backup.find(params.id)

      if (!backup) {
        return response.notFound({
          error: 'Backup not found',
        })
      }

      await backup.verify()

      return response.ok({
        message: 'Backup verified successfully',
        data: {
          verified: backup.verified,
          verifiedAt: backup.verifiedAt,
        },
      })
    } catch (error) {
      logger.error({ err: error }, 'Failed to verify backup')
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Retain backup (prevent auto-deletion)
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

      return response.ok({
        message: 'Backup retained',
        data: backup.serialize(),
      })
    } catch (error) {
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Release backup (allow auto-deletion)
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

      return response.ok({
        message: 'Backup released',
        data: backup.serialize(),
      })
    } catch (error) {
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
      const total = await Backup.query().count('* as total').first()
      const completed = await Backup.query().where('status', 'completed').count('* as total').first()
      const failed = await Backup.query().where('status', 'failed').count('* as total').first()
      const retained = await Backup.query().where('retained', true).count('* as total').first()

      return response.ok({
        data: {
          total: total?.$extras.total || 0,
          completed: completed?.$extras.total || 0,
          failed: failed?.$extras.total || 0,
          retained: retained?.$extras.total || 0,
        },
      })
    } catch (error) {
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Execute disaster recovery
   * POST /admin/backups/recovery/execute
   */
  async executeRecovery({ request, response }: HttpContext) {
    try {
      const planId = request.input('planId')

      if (!planId) {
        return response.badRequest({
          error: 'Plan ID is required',
        })
      }

      const result = await disasterRecovery.executeRecoveryPlanById(planId)

      if (!result.success) {
        return response.badRequest({
          error: result.error,
        })
      }

      return response.ok({
        message: 'Recovery executed successfully',
        data: result,
      })
    } catch (error) {
      logger.error({ err: error }, 'Failed to execute recovery')
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Get recovery status
   * GET /admin/backups/recovery/status
   */
  async recoveryStatus({ response }: HttpContext) {
    try {
      const status = await disasterRecovery.getRecoveryStatus()

      return response.ok({
        data: status,
      })
    } catch (error) {
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Cancel ongoing recovery
   * POST /admin/backups/recovery/cancel
   */
  async cancelRecovery({ response }: HttpContext) {
    try {
      const result = await disasterRecovery.cancelRecovery()

      return response.ok({
        message: result ? 'Recovery cancelled' : 'No active recovery to cancel',
        data: { cancelled: result },
      })
    } catch (error) {
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

      if (!backup.filePath) {
        return response.badRequest({
          error: 'Backup file not available',
        })
      }

      // Redirect to the file URL or stream it
      return response.redirect(String(backup.filePath))
    } catch (error) {
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Cleanup old backups
   * POST /admin/backups/cleanup
   */
  async cleanup({ request, response }: HttpContext) {
    try {
      const olderThanDays = request.input('olderThanDays', 30)
      const dryRun = request.input('dryRun', false)

      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

      // Find old backups
      const oldBackups = await Backup.query()
        .where('createdAt', '<', cutoffDate)
        .where('retained', false)
        .where('status', 'completed')

      if (dryRun) {
        return response.ok({
          message: 'Dry run - no backups deleted',
          count: oldBackups.length,
          backups: oldBackups.map(b => ({ id: b.id, name: b.name, createdAt: b.createdAt })),
        })
      }

      // Delete old backups
      const deleted = await disasterRecovery.cleanupOldBackups(olderThanDays)

      return response.ok({
        message: `Deleted ${deleted} old backups`,
        count: deleted,
      })
    } catch (error) {
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Create recovery plan
   * POST /admin/backups/recovery/plan
   */
  async createRecoveryPlan({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'name',
        'description',
        'databaseBackupId',
        'mediaBackupId',
      ])

      const result = await disasterRecovery.createRecoveryPlan(data)

      return response.created({
        message: 'Recovery plan created',
        data: result,
      })
    } catch (error) {
      return response.badRequest({
        error: (error as Error).message,
      })
    }
  }
}
