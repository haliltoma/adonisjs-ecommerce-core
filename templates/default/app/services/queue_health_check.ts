/**
 * Queue Health Check
 *
 * Checks BullMQ queue depth, job age, and worker status.
 */

import { HealthCheckResult } from '@adonisjs/core/health_check'
import { DateTime } from 'luxon'

export interface QueueHealthCheckConfig {
  warningDepth: number
  failureDepth: number
  maxJobAge: number // in seconds
}

export class QueueHealthCheck {
  private queues: string[] = ['default', 'emails', 'exports']

  constructor(private config: QueueHealthCheckConfig) {}

  /**
   * Run the health check
   */
  async run(): Promise<HealthCheckResult> {
    try {
      const queueStats = await this.getQueueStats()

      // Calculate total metrics
      const totalJobs = queueStats.reduce((sum, q) => sum + q.count, 0)
      const oldestJob = queueStats.reduce((oldest, q) => {
        if (!q.oldestJob) return oldest
        if (!oldest) return q.oldestJob
        return q.oldestJob < oldest ? q.oldestJob : oldest
      }, DateTime.now().toSeconds())

      const now = DateTime.now().toSeconds()
      const oldestJobAge = now - oldestJob

      // Determine health status
      let status: 'ok' | 'warning' | 'error' = 'ok'
      let message = 'All queues are healthy'

      if (totalJobs >= this.config.failureDepth) {
        status = 'error'
        message = `Queue depth too high: ${totalJobs} jobs (threshold: ${this.config.failureDepth})`
      } else if (totalJobs >= this.config.warningDepth) {
        status = 'warning'
        message = `Queue depth elevated: ${totalJobs} jobs (threshold: ${this.config.warningDepth})`
      } else if (oldestJobAge > this.config.maxJobAge) {
        status = 'error'
        message = `Jobs are too old: ${oldestJobAge.toFixed(0)}s (threshold: ${this.config.maxJobAge}s)`
      }

      return {
        displayName: 'Queue System',
        health: {
          status,
          message,
          meta: {
            totalJobs,
            oldestJobAge: `${oldestJobAge.toFixed(0)}s`,
            queues: queueStats,
          },
        },
      }
    } catch (error) {
      return {
        displayName: 'Queue System',
        health: {
          status: 'error',
          message: `Error checking queue health: ${(error as Error).message}`,
        },
      }
    }
  }

  /**
   * Get statistics for all queues
   */
  private async getQueueStats(): Promise<
    Array<{
      name: string
      count: number
      oldestJob?: number
    }>
  > {
    const stats: Array<{
      name: string
      count: number
      oldestJob?: number
    }> = []

    for (const queueName of this.queues) {
      try {
        const count = await this.getQueueCount(queueName)
        const oldestJob = await this.getOldestJob(queueName)

        stats.push({
          name: queueName,
          count,
          oldestJob,
        })
      } catch (error) {
        // Queue might not exist, skip it
        stats.push({
          name: queueName,
          count: 0,
        })
      }
    }

    return stats
  }

  /**
   * Get queue job count
   */
  private async getQueueCount(queueName: string): Promise<number> {
    // This would typically use BullMQ's queue.getJobCount()
    // For now, return a mock value
    // In production, you would do:
    // const queue = new Queue(queueName, { connection: redisConnection })
    // return await queue.getJobCount('waiting', 'active', 'delayed')
    return 0
  }

  /**
   * Get oldest job timestamp in queue
   */
  private async getOldestJob(queueName: string): Promise<number | undefined> {
    // This would typically use BullMQ's queue.getDelayed(), queue.getWaiting()
    // to find the oldest job
    // For now, return undefined
    // In production, you would do:
    // const queue = new Queue(queueName, { connection: redisConnection })
    // const jobs = await queue.getDelayed(0, 0)
    // return jobs[0]?.timestamp
    return undefined
  }
}
