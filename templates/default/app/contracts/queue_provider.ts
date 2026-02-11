/**
 * Queue Provider Contract
 *
 * Abstract class for background job queue implementations.
 * Providers: BullMQ (Redis), Database, etc.
 */
export abstract class QueueProvider {
  /**
   * Dispatch a job to a queue
   */
  abstract dispatch<T = unknown>(job: DispatchJobParams<T>): Promise<string>

  /**
   * Dispatch a job with delay
   */
  abstract dispatchLater<T = unknown>(
    job: DispatchJobParams<T>,
    delayMs: number
  ): Promise<string>

  /**
   * Dispatch multiple jobs as a batch
   */
  abstract dispatchBatch<T = unknown>(jobs: DispatchJobParams<T>[]): Promise<string[]>

  /**
   * Get job status by ID
   */
  abstract getJobStatus(jobId: string): Promise<JobStatus>

  /**
   * Cancel a pending/delayed job
   */
  abstract cancelJob(jobId: string): Promise<boolean>

  /**
   * Start processing jobs on a queue
   */
  abstract process(queueName: string, handler: JobHandler): void

  /**
   * Get queue metrics
   */
  abstract getQueueMetrics(queueName: string): Promise<QueueMetrics>

  /**
   * Pause a queue
   */
  abstract pauseQueue(queueName: string): Promise<void>

  /**
   * Resume a paused queue
   */
  abstract resumeQueue(queueName: string): Promise<void>

  /**
   * Clear all jobs in a queue
   */
  abstract clearQueue(queueName: string): Promise<void>

  /**
   * Gracefully shutdown all workers
   */
  abstract shutdown(): Promise<void>

  /**
   * Schedule a repeatable job with a cron pattern.
   * Optional — only BullMQ provider supports this.
   */
  async schedule(
    _schedulerId: string,
    _queueName: string,
    _jobName: string,
    _data: unknown,
    _pattern: string
  ): Promise<void> {
    // No-op for providers that don't support scheduling
  }

  /**
   * Schedule a repeating job at a fixed interval.
   * Optional — only BullMQ provider supports this.
   */
  async scheduleEvery(
    _schedulerId: string,
    _queueName: string,
    _jobName: string,
    _data: unknown,
    _everyMs: number
  ): Promise<void> {
    // No-op for providers that don't support scheduling
  }
}

export interface DispatchJobParams<T = unknown> {
  name: string
  queue?: string
  data: T
  priority?: number
  attempts?: number
  backoff?: {
    type: 'fixed' | 'exponential'
    delay: number
  }
}

export interface JobStatus {
  id: string
  name: string
  queue: string
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused'
  progress: number
  data: unknown
  result?: unknown
  failedReason?: string
  attemptsMade: number
  createdAt: Date
  processedAt?: Date
  completedAt?: Date
}

export type JobHandler = (job: JobContext) => Promise<void>

export interface JobContext {
  id: string
  name: string
  data: unknown
  attemptsMade: number
  updateProgress(progress: number): Promise<void>
}

export interface QueueMetrics {
  waiting: number
  active: number
  completed: number
  failed: number
  delayed: number
  paused: number
}
