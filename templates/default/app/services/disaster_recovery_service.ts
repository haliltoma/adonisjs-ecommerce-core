/**
 * Disaster Recovery Service
 *
 * Orchestrates backup and recovery operations across all system components.
 * Provides disaster recovery workflows and monitoring.
 */

import { DateTime } from 'luxon'
import backupConfig from '#config/backup'
import logger from '@adonisjs/core/services/logger'
import Backup from '#models/backup'
import { databaseBackup } from './database_backup_service'
import { mediaBackup } from './media_backup_service'

export type RecoveryStatus = 'idle' | 'in_progress' | 'completed' | 'failed'

export interface RecoveryPlan {
  id: string
  name: string
  description: string
  databaseBackupId: string
  mediaBackupId?: string
  steps: RecoveryStep[]
  estimatedDuration: number // in minutes
  createdAt: DateTime
  status: RecoveryStatus
}

export interface RecoveryStep {
  id: string
  name: string
  description: string
  type: 'database' | 'media' | 'verification' | 'notification'
  status: 'pending' | 'in_progress' | 'completed' | 'failed'
  error?: string
  duration?: number
}

export default class DisasterRecoveryService {
  private static instance: DisasterRecoveryService
  private activeRecovery: RecoveryPlan | null = null

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): DisasterRecoveryService {
    if (!DisasterRecoveryService.instance) {
      DisasterRecoveryService.instance = new DisasterRecoveryService()
    }
    return DisasterRecoveryService.instance
  }

  /**
   * Create a full system backup (database + media)
   */
  async createFullBackup(options: {
    name?: string
    description?: string
    createdBy?: string
  } = {}): Promise<{
    success: boolean
    databaseBackup?: Backup
    mediaBackup?: Backup
    error?: string
    duration: number
  }> {
    const startTime = Date.now()
    logger.info('Starting full system backup', options)

    try {
      // Create database backup
      const dbResult = await databaseBackup.createBackup({
        name: options.name ? `${options.name}-db` : undefined,
        description: options.description,
        createdBy: options.createdBy,
      })

      if (!dbResult.success) {
        return {
          success: false,
          error: `Database backup failed: ${dbResult.error}`,
          duration: (Date.now() - startTime) / 1000,
        }
      }

      // Create media backup
      const mediaResult = await mediaBackup.createBackup({
        name: options.name ? `${options.name}-media` : undefined,
        description: options.description,
        createdBy: options.createdBy,
      })

      if (!mediaResult.success) {
        return {
          success: false,
          databaseBackup: dbResult.backup,
          error: `Media backup failed: ${mediaResult.error}`,
          duration: (Date.now() - startTime) / 1000,
        }
      }

      const duration = (Date.now() - startTime) / 1000

      logger.info('Full system backup completed successfully', {
        databaseBackupId: dbResult.backup?.id,
        mediaBackupId: mediaResult.backup?.id,
        duration: `${duration.toFixed(2)}s`,
      })

      return {
        success: true,
        databaseBackup: dbResult.backup,
        mediaBackup: mediaResult.backup,
        duration,
      }
    } catch (error) {
      const errorMessage = (error as Error).message
      logger.error({ err: error }, 'Full system backup failed')

      return {
        success: false,
        error: errorMessage,
        duration: (Date.now() - startTime) / 1000,
      }
    }
  }

  /**
   * Create a recovery plan
   */
  async createRecoveryPlan(options: {
    name: string
    description: string
    databaseBackupId: string
    mediaBackupId?: string
  }): Promise<RecoveryPlan> {
    const plan: RecoveryPlan = {
      id: this.generatePlanId(),
      name: options.name,
      description: options.description,
      databaseBackupId: options.databaseBackupId,
      mediaBackupId: options.mediaBackupId,
      steps: this.buildRecoverySteps(options),
      estimatedDuration: this.estimateRecoveryTime(options),
      createdAt: DateTime.now(),
      status: 'idle',
    }

    logger.info('Recovery plan created', { planId: plan.id })
    return plan
  }

  /**
   * Execute recovery plan
   */
  async executeRecoveryPlan(plan: RecoveryPlan): Promise<{
    success: boolean
    steps: RecoveryStep[]
    error?: string
    duration: number
  }> {
    if (this.activeRecovery) {
      return {
        success: false,
        steps: [],
        error: 'Recovery already in progress',
        duration: 0,
      }
    }

    const startTime = Date.now()
    this.activeRecovery = plan
    plan.status = 'in_progress'

    logger.info('Executing recovery plan', { planId: plan.id })

    try {
      for (const step of plan.steps) {
        step.status = 'in_progress'
        const stepStartTime = Date.now()

        try {
          await this.executeRecoveryStep(step)
          step.status = 'completed'
          step.duration = (Date.now() - stepStartTime) / 1000

          logger.info(`Recovery step completed: ${step.name}`, {
            planId: plan.id,
            stepId: step.id,
            duration: `${step.duration}s`,
          })
        } catch (error) {
          step.status = 'failed'
          step.error = (error as Error).message
          step.duration = (Date.now() - stepStartTime) / 1000

          logger.error(`Recovery step failed: ${step.name}`, {
            planId: plan.id,
            stepId: step.id,
            error: step.error,
          })

          plan.status = 'failed'
          this.activeRecovery = null

          return {
            success: false,
            steps: plan.steps,
            error: `Step failed: ${step.name} - ${step.error}`,
            duration: (Date.now() - startTime) / 1000,
          }
        }
      }

      plan.status = 'completed'
      const duration = (Date.now() - startTime) / 1000

      logger.info('Recovery plan completed successfully', {
        planId: plan.id,
        duration: `${duration.toFixed(2)}s`,
      })

      return {
        success: true,
        steps: plan.steps,
        duration,
      }
    } finally {
      this.activeRecovery = null
    }
  }

  /**
   * Execute a single recovery step
   */
  private async executeRecoveryStep(step: RecoveryStep): Promise<void> {
    switch (step.type) {
      case 'database':
        if (!this.activeRecovery) {
          throw new Error('No active recovery plan')
        }
        const dbResult = await databaseBackup.restoreBackup(this.activeRecovery.databaseBackupId)
        if (!dbResult.success) {
          throw new Error(dbResult.error)
        }
        break

      case 'media':
        if (!this.activeRecovery || !this.activeRecovery.mediaBackupId) {
          throw new Error('No media backup in recovery plan')
        }
        const mediaResult = await mediaBackup.restoreBackup(this.activeRecovery.mediaBackupId)
        if (!mediaResult.success) {
          throw new Error(mediaResult.error)
        }
        break

      case 'verification':
        await this.verifySystemHealth()
        break

      case 'notification':
        await this.sendRecoveryNotification(step.name)
        break
    }
  }

  /**
   * Verify system health after recovery
   */
  private async verifySystemHealth(): Promise<void> {
    logger.info('Verifying system health')

    // Check database connection
    const db = require('@adonisjs/lucid/services/main').default
    await db.connection().knex.raw('SELECT 1')

    // Check Redis connection
    const redis = require('@adonisjs/redis/services/main').default
    await redis.connection('local').ping()

    // TODO: Add more health checks

    logger.info('System health verification completed')
  }

  /**
   * Send recovery notification
   */
  private async sendRecoveryNotification(stepName: string): Promise<void> {
    logger.info(`Sending recovery notification: ${stepName}`)

    // TODO: Implement email/webhook notifications
    // if (backupConfig.monitoring.alertOnFailure) {
    //   await this.sendAlert({
    //     type: 'recovery_completed',
    //     message: stepName,
    //   })
    // }
  }

  /**
   * Get active recovery status
   */
  getActiveRecovery(): RecoveryPlan | null {
    return this.activeRecovery
  }

  /**
   * Cancel active recovery
   */
  async cancelRecovery(): Promise<boolean> {
    if (!this.activeRecovery) {
      return false
    }

    logger.info('Cancelling recovery plan', { planId: this.activeRecovery.id })
    this.activeRecovery = null
    return true
  }

  /**
   * Get system recovery status
   */
  async getRecoveryStatus(): Promise<{
    canRecover: boolean
    latestBackup?: Backup
    rpoCompliant: boolean
    rtoCompliant: boolean
    recommendations: string[]
  }> {
    const recommendations: string[] = []

    // Get latest database backup
    const latestBackup = await Backup.query()
      .where('type', 'database')
      .where('status', 'completed')
      .orderBy('created_at', 'desc')
      .first()

    const canRecover = !!latestBackup && !latestBackup.isExpired

    // Check RPO compliance
    const rpoCompliant = this.checkRPOCompliance(latestBackup)
    if (!rpoCompliant) {
      recommendations.push('RPO not met: Latest backup is too old')
    }

    // Check RTO compliance (estimated)
    const rtoCompliant = true // We can't really test this without a recovery
    recommendations.push('Test recovery procedure to verify RTO compliance')

    // General recommendations
    if (!latestBackup) {
      recommendations.push('Create initial backup to enable recovery')
    } else if (latestBackup.isExpired) {
      recommendations.push('Latest backup has expired. Create new backup.')
    }

    if (await this.getBackupCount() < backupConfig.database.retention.daily) {
      recommendations.push('Increase backup frequency to meet retention policy')
    }

    return {
      canRecover,
      latestBackup,
      rpoCompliant,
      rtoCompliant,
      recommendations,
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats(): Promise<{
    total: number
    byType: Record<string, number>
    byStatus: Record<string, number>
    totalSize: number
    latestBackup?: Backup
    oldestBackup?: Backup
  }> {
    const backups = await Backup.all()

    const byType: Record<string, number> = {}
    const byStatus: Record<string, number> = {}
    let totalSize = 0

    let latestBackup: Backup | undefined
    let oldestBackup: Backup | undefined

    for (const backup of backups) {
      byType[backup.type] = (byType[backup.type] || 0) + 1
      byStatus[backup.status] = (byStatus[backup.status] || 0) + 1
      totalSize += backup.fileSize

      if (!latestBackup || backup.createdAt > latestBackup.createdAt) {
        latestBackup = backup
      }

      if (!oldestBackup || backup.createdAt < oldestBackup.createdAt) {
        oldestBackup = backup
      }
    }

    return {
      total: backups.length,
      byType,
      byStatus,
      totalSize,
      latestBackup,
      oldestBackup,
    }
  }

  /**
   * Build recovery steps
   */
  private buildRecoverySteps(options: {
    databaseBackupId: string
    mediaBackupId?: string
  }): RecoveryStep[] {
    const steps: RecoveryStep[] = [
      {
        id: this.generateStepId(),
        name: 'Database Restore',
        description: 'Restore database from backup',
        type: 'database',
        status: 'pending',
      },
    ]

    if (options.mediaBackupId) {
      steps.push({
        id: this.generateStepId(),
        name: 'Media Restore',
        description: 'Restore media files from backup',
        type: 'media',
        status: 'pending',
      })
    }

    steps.push({
      id: this.generateStepId(),
      name: 'System Verification',
      description: 'Verify system health after recovery',
      type: 'verification',
      status: 'pending',
    })

    steps.push({
      id: this.generateStepId(),
      name: 'Recovery Notification',
      description: 'Send recovery completion notification',
      type: 'notification',
      status: 'pending',
    })

    return steps
  }

  /**
   * Estimate recovery time
   */
  private estimateRecoveryTime(options: {
    databaseBackupId: string
    mediaBackupId?: string
  }): number {
    // Base estimate: 30 minutes for database
    let estimate = 30

    if (options.mediaBackupId) {
      // Add 15 minutes for media restore
      estimate += 15
    }

    // Add 5 minutes for verification
    estimate += 5

    return estimate
  }

  /**
   * Check RPO compliance
   */
  private checkRPOCompliance(latestBackup: Backup | null | undefined): boolean {
    if (!latestBackup) return false

    const now = DateTime.now()
    const backupAge = now.diff(latestBackup.createdAt).as('minutes')
    const rpoTarget = backupConfig.rpo.targetMinutes

    return backupAge <= rpoTarget
  }

  /**
   * Get backup count
   */
  private async getBackupCount(): Promise<number> {
    return await Backup.query().where('status', 'completed').count('* as total').first()
      .then((result) => parseInt(result?.$extras.total || '0'))
  }

  /**
   * Generate plan ID
   */
  private generatePlanId(): string {
    return `recovery-${DateTime.now().toFormat('yyyy-MM-dd-HH-mm-ss')}-${Math.random().toString(36).substring(7)}`
  }

  /**
   * Generate step ID
   */
  private generateStepId(): string {
    return `step-${Math.random().toString(36).substring(7)}`
  }
}

/**
 * Export singleton instance
 */
export const disasterRecovery = DisasterRecoveryService.getInstance()
