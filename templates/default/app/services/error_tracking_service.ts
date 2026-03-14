/**
 * Error Tracking Service
 *
 * Centralized error tracking and aggregation system.
 * Captures errors with full context, aggregates similar errors,
 * and provides reporting capabilities.
 */

import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import { sanitizeData } from '#start/logging'

/**
 * Error severity levels
 */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical'

/**
 * Error category types
 */
export type ErrorCategory =
  | 'database'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'external_api'
  | 'business_logic'
  | 'system'
  | 'network'

/**
 * Tracked error record
 */
interface TrackedError {
  id: string
  message: string
  stack: string
  category: ErrorCategory
  severity: ErrorSeverity
  userId?: string
  requestId?: string
  url?: string
  method?: string
  statusCode?: number
  ip?: string
  userAgent?: string
  additionalContext?: Record<string, any>
  count: number
  firstSeen: DateTime
  lastSeen: DateTime
  resolved: boolean
  resolvedAt?: DateTime
}

/**
 * Error aggregation key
 */
interface ErrorAggregationKey {
  message: string
  category: ErrorCategory
}

/**
 * Error statistics
 */
interface ErrorStats {
  total: number
  byCategory: Record<ErrorCategory, number>
  bySeverity: Record<ErrorSeverity, number>
  topErrors: Array<{
    error: TrackedError
    count: number
  }>
}

export default class ErrorTrackingService {
  private static instance: ErrorTrackingService
  private trackedErrors: Map<string, TrackedError> = new Map()
  private errorCounts: Map<string, number> = new Map()

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): ErrorTrackingService {
    if (!ErrorTrackingService.instance) {
      ErrorTrackingService.instance = new ErrorTrackingService()
    }
    return ErrorTrackingService.instance
  }

  /**
   * Track an error with full context
   */
  async trackError(error: Error, context: {
    category?: ErrorCategory
    severity?: ErrorSeverity
    ctx?: HttpContext
    userId?: string
    additionalContext?: Record<string, any>
  }): Promise<string> {
    const {
      category = this.categorizeError(error),
      severity = this.determineSeverity(error, context?.ctx),
      ctx,
      userId,
      additionalContext = {},
    } = context

    // Generate error ID
    const errorId = this.generateErrorId(error, category)

    // Get existing or create new tracked error
    let trackedError = this.trackedErrors.get(errorId)

    if (!trackedError) {
      trackedError = {
        id: errorId,
        message: error.message,
        stack: error.stack || '',
        category,
        severity,
        userId,
        requestId: ctx?.requestId(),
        url: ctx?.request.url(),
        method: ctx?.request.method(),
        statusCode: ctx?.response.getStatus(),
        ip: ctx?.request.ip(),
        userAgent: ctx?.request.header('user-agent'),
        additionalContext: sanitizeData(additionalContext),
        count: 1,
        firstSeen: DateTime.now(),
        lastSeen: DateTime.now(),
        resolved: false,
      }
      this.trackedErrors.set(errorId, trackedError)
    } else {
      // Update existing error
      trackedError.count++
      trackedError.lastSeen = DateTime.now()
      if (severity !== 'low') {
        trackedError.severity = severity
      }
    }

    // Log the error
    this.logError(error, trackedError)

    return errorId
  }

  /**
   * Get error by ID
   */
  getError(errorId: string): TrackedError | undefined {
    return this.trackedErrors.get(errorId)
  }

  /**
   * Get all errors
   */
  getAllErrors(options?: {
    category?: ErrorCategory
    severity?: ErrorSeverity
    resolved?: boolean
    limit?: number
  }): TrackedError[] {
    let errors = Array.from(this.trackedErrors.values())

    // Apply filters
    if (options?.category) {
      errors = errors.filter(e => e.category === options.category)
    }
    if (options?.severity) {
      errors = errors.filter(e => e.severity === options.severity)
    }
    if (options?.resolved !== undefined) {
      errors = errors.filter(e => e.resolved === options.resolved)
    }

    // Sort by last seen (most recent first)
    errors.sort((a, b) => b.lastSeen.toMillis() - a.lastSeen.toMillis())

    // Apply limit
    if (options?.limit) {
      errors = errors.slice(0, options.limit)
    }

    return errors
  }

  /**
   * Get error statistics
   */
  getErrorStats(): ErrorStats {
    const errors = Array.from(this.trackedErrors.values())

    const stats: ErrorStats = {
      total: errors.length,
      byCategory: {
        database: 0,
        validation: 0,
        authentication: 0,
        authorization: 0,
        external_api: 0,
        business_logic: 0,
        system: 0,
        network: 0,
      },
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      topErrors: [],
    }

    // Count by category and severity
    for (const error of errors) {
      stats.byCategory[error.category]++
      stats.bySeverity[error.severity]++
    }

    // Get top errors by count
    stats.topErrors = errors
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map(error => ({ error, count: error.count }))

    return stats
  }

  /**
   * Resolve an error
   */
  resolveError(errorId: string): boolean {
    const error = this.trackedErrors.get(errorId)
    if (error) {
      error.resolved = true
      error.resolvedAt = DateTime.now()
      logger.info({ errorId }, `Error marked as resolved: ${error.message}`)
      return true
    }
    return false
  }

  /**
   * Clear old errors (older than specified days)
   */
  clearOldErrors(days: number = 30): number {
    const cutoff = DateTime.now().minus({ days })
    let cleared = 0

    for (const [id, error] of this.trackedErrors.entries()) {
      if (error.lastSeen < cutoff && error.resolved) {
        this.trackedErrors.delete(id)
        cleared++
      }
    }

    logger.info({ cleared, days }, 'Cleared old errors')
    return cleared
  }

  /**
   * Generate error ID based on message and category
   */
  private generateErrorId(error: Error, category: ErrorCategory): string {
    const normalizedMessage = error.message
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .substring(0, 50)

    return `${category}-${normalizedMessage}-${error.name}`
  }

  /**
   * Categorize error based on message and type
   */
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase()
    const name = error.name.toLowerCase()

    // Database errors
    if (
      name.includes('database') ||
      name.includes('query') ||
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('duplicate') ||
      message.includes('constraint')
    ) {
      return 'database'
    }

    // Validation errors
    if (
      name.includes('validation') ||
      message.includes('validation') ||
      message.includes('invalid')
    ) {
      return 'validation'
    }

    // Authentication errors
    if (
      message.includes('unauthorized') ||
      message.includes('authentication') ||
      message.includes('login') ||
      message.includes('credentials')
    ) {
      return 'authentication'
    }

    // Authorization errors
    if (
      message.includes('forbidden') ||
      message.includes('permission') ||
      message.includes('authorized')
    ) {
      return 'authorization'
    }

    // External API errors
    if (
      message.includes('api') ||
      message.includes('stripe') ||
      message.includes('payment') ||
      message.includes('external')
    ) {
      return 'external_api'
    }

    // Network errors
    if (
      name.includes('network') ||
      message.includes('network') ||
      message.includes('econnrefused') ||
      message.includes('enotfound')
    ) {
      return 'network'
    }

    // System errors
    if (
      name.includes('system') ||
      name.includes('runtime') ||
      message.includes('system') ||
      message.includes('memory')
    ) {
      return 'system'
    }

    return 'business_logic'
  }

  /**
   * Determine error severity
   */
  private determineSeverity(error: Error, ctx?: HttpContext): ErrorSeverity {
    const message = error.message.toLowerCase()
    const statusCode = ctx?.response.getStatus()

    // Critical: system-wide failures
    if (
      message.includes('database connection') ||
      message.includes('redis connection') ||
      message.includes('out of memory') ||
      message.includes('disk space') ||
      statusCode === 500
    ) {
      return 'critical'
    }

    // High: significant failures
    if (
      message.includes('payment') ||
      message.includes('stripe') ||
      message.includes('security') ||
      statusCode === 500
    ) {
      return 'high'
    }

    // Medium: user-facing errors
    if (
      message.includes('validation') ||
      message.includes('not found') ||
      statusCode === 404 ||
      statusCode === 400
    ) {
      return 'medium'
    }

    return 'low'
  }

  /**
   * Log error with context
   */
  private logError(error: Error, trackedError: TrackedError): void {
    const logData = {
      errorId: trackedError.id,
      category: trackedError.category,
      severity: trackedError.severity,
      userId: trackedError.userId,
      requestId: trackedError.requestId,
      count: trackedError.count,
    }

    if (trackedError.severity === 'critical' || trackedError.severity === 'high') {
      logger.error({ err: error, ...logData }, 'Error tracked (high severity)')
    } else if (trackedError.severity === 'medium') {
      logger.warn(logData, `Error tracked: ${error.message}`)
    } else {
      logger.info(logData, `Error tracked: ${error.message}`)
    }
  }
}

/**
 * Export singleton instance
 */
export const errorTracking = ErrorTrackingService.getInstance()
