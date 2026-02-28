import {
  QueueProvider,
  type DispatchJobParams,
  type JobStatus,
  type JobHandler,
  type QueueMetrics,
} from '#contracts/queue_provider'
import { Queue, Worker, QueueEvents, type ConnectionOptions } from 'bullmq'
import logger from '@adonisjs/core/services/logger'

/**
 * BullMQ Queue Provider
 *
 * Production-grade queue provider backed by Redis.
 * Supports delayed jobs, retries with backoff, cron scheduling,
 * priority, concurrency, and graceful shutdown.
 */
export class BullMQQueueProvider extends QueueProvider {
  private queues = new Map<string, Queue>()
  private workers = new Map<string, Worker>()
  private queueEvents = new Map<string, QueueEvents>()
  private connection: ConnectionOptions

  constructor(connection?: ConnectionOptions) {
    super()
    this.connection = connection ?? {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: Number(process.env.REDIS_QUEUE_DB) || 1,
    }
  }

  /**
   * Get or create a BullMQ Queue instance for the given queue name
   */
  private getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection: this.connection,
        defaultJobOptions: {
          removeOnComplete: { count: 1000 },
          removeOnFail: { count: 5000 },
        },
      })
      queue.on('error', (err) => {
        logger.error(`[Queue:${name}] Error: ${(err as Error).message}`)
      })
      this.queues.set(name, queue)
    }
    return this.queues.get(name)!
  }

  async dispatch<T = unknown>(job: DispatchJobParams<T>): Promise<string> {
    const queueName = job.queue || 'default'
    const queue = this.getQueue(queueName)

    const added = await queue.add(job.name, job.data, {
      priority: job.priority,
      attempts: job.attempts || 3,
      backoff: job.backoff
        ? { type: job.backoff.type, delay: job.backoff.delay }
        : { type: 'exponential', delay: 1000 },
    })

    logger.debug(`[Queue:${queueName}] Dispatched job "${job.name}" → ${added.id}`)
    return added.id!
  }

  async dispatchLater<T = unknown>(job: DispatchJobParams<T>, delayMs: number): Promise<string> {
    const queueName = job.queue || 'default'
    const queue = this.getQueue(queueName)

    const added = await queue.add(job.name, job.data, {
      delay: delayMs,
      priority: job.priority,
      attempts: job.attempts || 3,
      backoff: job.backoff
        ? { type: job.backoff.type, delay: job.backoff.delay }
        : { type: 'exponential', delay: 1000 },
    })

    logger.debug(`[Queue:${queueName}] Dispatched delayed job "${job.name}" → ${added.id} (${delayMs}ms)`)
    return added.id!
  }

  async dispatchBatch<T = unknown>(jobs: DispatchJobParams<T>[]): Promise<string[]> {
    const ids: string[] = []
    // Group jobs by queue for efficiency
    const grouped = new Map<string, DispatchJobParams<T>[]>()
    for (const job of jobs) {
      const queueName = job.queue || 'default'
      if (!grouped.has(queueName)) grouped.set(queueName, [])
      grouped.get(queueName)!.push(job)
    }

    for (const [queueName, queueJobs] of grouped) {
      const queue = this.getQueue(queueName)
      const bulkData = queueJobs.map((j) => ({
        name: j.name,
        data: j.data as object,
        opts: {
          priority: j.priority,
          attempts: j.attempts || 3,
          backoff: j.backoff
            ? { type: j.backoff.type as 'fixed' | 'exponential', delay: j.backoff.delay }
            : ({ type: 'exponential' as const, delay: 1000 }),
        },
      }))
      const added = await queue.addBulk(bulkData)
      ids.push(...added.map((j) => j.id!))
    }

    return ids
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    // Search across all known queues
    for (const [queueName, queue] of this.queues) {
      const job = await queue.getJob(jobId)
      if (job) {
        const state = await job.getState()
        return {
          id: job.id!,
          name: job.name,
          queue: queueName,
          status: state as JobStatus['status'],
          progress: typeof job.progress === 'number' ? job.progress : 0,
          data: job.data,
          result: job.returnvalue,
          failedReason: job.failedReason,
          attemptsMade: job.attemptsMade,
          createdAt: new Date(job.timestamp),
          processedAt: job.processedOn ? new Date(job.processedOn) : undefined,
          completedAt: job.finishedOn ? new Date(job.finishedOn) : undefined,
        }
      }
    }

    throw new Error(`Job not found: ${jobId}`)
  }

  async cancelJob(jobId: string): Promise<boolean> {
    for (const [, queue] of this.queues) {
      const job = await queue.getJob(jobId)
      if (job) {
        const state = await job.getState()
        if (state === 'active') return false
        await job.remove()
        return true
      }
    }
    return false
  }

  process(queueName: string, handler: JobHandler): void {
    if (this.workers.has(queueName)) {
      logger.warn(`[Queue:${queueName}] Worker already registered, closing previous`)
      this.workers.get(queueName)!.close()
    }

    const worker = new Worker(
      queueName,
      async (bullJob) => {
        await handler({
          id: bullJob.id!,
          name: bullJob.name,
          data: bullJob.data,
          attemptsMade: bullJob.attemptsMade,
          async updateProgress(progress: number) {
            await bullJob.updateProgress(progress)
          },
        })
      },
      {
        connection: this.connection,
        concurrency: Number(process.env.QUEUE_CONCURRENCY) || 5,
      }
    )

    worker.on('completed', (job) => {
      logger.debug(`[Queue:${queueName}] Job "${job.name}" (${job.id}) completed`)
    })

    worker.on('failed', (job, err) => {
      logger.error(`[Queue:${queueName}] Job "${job?.name}" (${job?.id}) failed: ${(err as Error).message}`)
    })

    worker.on('error', (err) => {
      logger.error(`[Worker:${queueName}] Error: ${(err as Error).message}`)
    })

    this.workers.set(queueName, worker)
    logger.info(`[Queue:${queueName}] Worker started`)
  }

  async getQueueMetrics(queueName: string): Promise<QueueMetrics> {
    const queue = this.getQueue(queueName)
    const [waiting, active, completed, failed, delayed, paused] = await Promise.all([
      queue.getWaitingCount(),
      queue.getActiveCount(),
      queue.getCompletedCount(),
      queue.getFailedCount(),
      queue.getDelayedCount(),
      queue.isPaused().then((p) => (p ? 1 : 0)),
    ])

    return { waiting, active, completed, failed, delayed, paused }
  }

  async pauseQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName)
    await queue.pause()
    logger.info(`[Queue:${queueName}] Paused`)
  }

  async resumeQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName)
    await queue.resume()
    logger.info(`[Queue:${queueName}] Resumed`)
  }

  async clearQueue(queueName: string): Promise<void> {
    const queue = this.getQueue(queueName)
    await queue.obliterate({ force: true })
    logger.info(`[Queue:${queueName}] Cleared`)
  }

  /**
   * Schedule a repeatable (cron) job
   */
  async schedule(
    schedulerId: string,
    queueName: string,
    jobName: string,
    data: unknown,
    pattern: string
  ): Promise<void> {
    const queue = this.getQueue(queueName)
    await queue.upsertJobScheduler(
      schedulerId,
      { pattern },
      { name: jobName, data: data as object }
    )
    logger.info(`[Queue:${queueName}] Scheduled "${jobName}" with cron "${pattern}"`)
  }

  /**
   * Schedule a repeating job at a fixed interval
   */
  async scheduleEvery(
    schedulerId: string,
    queueName: string,
    jobName: string,
    data: unknown,
    everyMs: number
  ): Promise<void> {
    const queue = this.getQueue(queueName)
    await queue.upsertJobScheduler(
      schedulerId,
      { every: everyMs },
      { name: jobName, data: data as object }
    )
    logger.info(`[Queue:${queueName}] Scheduled "${jobName}" every ${everyMs}ms`)
  }

  async shutdown(): Promise<void> {
    logger.info('[Queue] Shutting down all workers and queues...')

    // Close workers first
    const workerClosePromises = Array.from(this.workers.entries()).map(async ([name, worker]) => {
      try {
        await worker.close()
        logger.debug(`[Worker:${name}] Closed`)
      } catch (err: unknown) {
        logger.error(`[Worker:${name}] Error closing: ${(err as Error).message}`)
      }
    })
    await Promise.all(workerClosePromises)

    // Close queue events
    const eventsClosePromises = Array.from(this.queueEvents.entries()).map(
      async ([name, events]) => {
        try {
          await events.close()
          logger.debug(`[QueueEvents:${name}] Closed`)
        } catch (err: unknown) {
          logger.error(`[QueueEvents:${name}] Error closing: ${(err as Error).message}`)
        }
      }
    )
    await Promise.all(eventsClosePromises)

    // Close queues
    const queueClosePromises = Array.from(this.queues.entries()).map(async ([name, queue]) => {
      try {
        await queue.close()
        logger.debug(`[Queue:${name}] Closed`)
      } catch (err: unknown) {
        logger.error(`[Queue:${name}] Error closing: ${(err as Error).message}`)
      }
    })
    await Promise.all(queueClosePromises)

    this.workers.clear()
    this.queueEvents.clear()
    this.queues.clear()

    logger.info('[Queue] All workers and queues shut down')
  }
}
