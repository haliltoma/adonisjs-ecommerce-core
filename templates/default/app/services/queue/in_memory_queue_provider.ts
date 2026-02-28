import {
  QueueProvider,
  type DispatchJobParams,
  type JobStatus,
  type JobHandler,
  type QueueMetrics,
} from '#contracts/queue_provider'
import { randomUUID } from 'node:crypto'
import logger from '@adonisjs/core/services/logger'

interface InMemoryJob {
  id: string
  name: string
  queue: string
  data: unknown
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed'
  progress: number
  result?: unknown
  failedReason?: string
  attemptsMade: number
  maxAttempts: number
  createdAt: Date
  processedAt?: Date
  completedAt?: Date
}

/**
 * In-Memory Queue Provider
 *
 * Default queue provider for development and simple setups.
 * Jobs are processed immediately (synchronously).
 * For production, use BullMQ provider.
 */
export class InMemoryQueueProvider extends QueueProvider {
  private jobs = new Map<string, InMemoryJob>()
  private handlers = new Map<string, JobHandler>()
  private paused = new Set<string>()

  async dispatch<T = unknown>(job: DispatchJobParams<T>): Promise<string> {
    const id = randomUUID()
    const queueName = job.queue || 'default'

    const inMemoryJob: InMemoryJob = {
      id,
      name: job.name,
      queue: queueName,
      data: job.data,
      status: 'waiting',
      progress: 0,
      attemptsMade: 0,
      maxAttempts: job.attempts || 3,
      createdAt: new Date(),
    }

    this.jobs.set(id, inMemoryJob)

    // Process immediately if handler exists and queue is not paused
    if (!this.paused.has(queueName)) {
      this.processJob(id).catch((err) => {
        logger.error(`[Queue] Job ${id} failed: ${(err as Error).message}`)
      })
    }

    return id
  }

  async dispatchLater<T = unknown>(job: DispatchJobParams<T>, delayMs: number): Promise<string> {
    const id = randomUUID()
    const queueName = job.queue || 'default'

    const inMemoryJob: InMemoryJob = {
      id,
      name: job.name,
      queue: queueName,
      data: job.data,
      status: 'delayed',
      progress: 0,
      attemptsMade: 0,
      maxAttempts: job.attempts || 3,
      createdAt: new Date(),
    }

    this.jobs.set(id, inMemoryJob)

    setTimeout(() => {
      inMemoryJob.status = 'waiting'
      if (!this.paused.has(queueName)) {
        this.processJob(id).catch((err) => {
          logger.error(`[Queue] Delayed job ${id} failed: ${(err as Error).message}`)
        })
      }
    }, delayMs)

    return id
  }

  async dispatchBatch<T = unknown>(jobs: DispatchJobParams<T>[]): Promise<string[]> {
    const ids: string[] = []
    for (const job of jobs) {
      const id = await this.dispatch(job)
      ids.push(id)
    }
    return ids
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    const job = this.jobs.get(jobId)
    if (!job) {
      throw new Error(`Job not found: ${jobId}`)
    }

    return {
      id: job.id,
      name: job.name,
      queue: job.queue,
      status: job.status,
      progress: job.progress,
      data: job.data,
      result: job.result,
      failedReason: job.failedReason,
      attemptsMade: job.attemptsMade,
      createdAt: job.createdAt,
      processedAt: job.processedAt,
      completedAt: job.completedAt,
    }
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId)
    if (!job || job.status === 'active') return false
    this.jobs.delete(jobId)
    return true
  }

  process(queueName: string, handler: JobHandler): void {
    this.handlers.set(queueName, handler)
  }

  async getQueueMetrics(queueName: string): Promise<QueueMetrics> {
    let waiting = 0
    let active = 0
    let completed = 0
    let failed = 0
    let delayed = 0

    for (const job of this.jobs.values()) {
      if (job.queue !== queueName) continue
      switch (job.status) {
        case 'waiting':
          waiting++
          break
        case 'active':
          active++
          break
        case 'completed':
          completed++
          break
        case 'failed':
          failed++
          break
        case 'delayed':
          delayed++
          break
      }
    }

    return { waiting, active, completed, failed, delayed, paused: this.paused.has(queueName) ? 1 : 0 }
  }

  async pauseQueue(queueName: string): Promise<void> {
    this.paused.add(queueName)
  }

  async resumeQueue(queueName: string): Promise<void> {
    this.paused.delete(queueName)
  }

  async clearQueue(queueName: string): Promise<void> {
    for (const [id, job] of this.jobs) {
      if (job.queue === queueName) {
        this.jobs.delete(id)
      }
    }
  }

  async shutdown(): Promise<void> {
    this.jobs.clear()
    this.handlers.clear()
    this.paused.clear()
  }

  private async processJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId)
    if (!job) return

    const handler = this.handlers.get(job.queue)
    if (!handler) {
      // No handler registered, leave as waiting
      return
    }

    job.status = 'active'
    job.processedAt = new Date()
    job.attemptsMade++

    try {
      await handler({
        id: job.id,
        name: job.name,
        data: job.data,
        attemptsMade: job.attemptsMade,
        async updateProgress(progress: number) {
          job.progress = progress
        },
      })

      job.status = 'completed'
      job.completedAt = new Date()
      job.progress = 100
    } catch (error: unknown) {
      job.failedReason = error instanceof Error ? (error as Error).message : 'Unknown error'
      if (job.attemptsMade < job.maxAttempts) {
        job.status = 'waiting'
        // Retry with backoff
        setTimeout(() => {
          this.processJob(jobId).catch(() => {})
        }, 1000 * job.attemptsMade)
      } else {
        job.status = 'failed'
      }
    }
  }
}
