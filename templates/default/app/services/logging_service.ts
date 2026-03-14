/**
 * Logging Service
 *
 * Centralized logging service that provides structured logging
 * with correlation IDs, user context, and sensitive data filtering.
 */

import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'
import {
  sanitizeData,
  sanitizeRequestBody,
  extractUserContext,
  logSecurityEvent,
  logPaymentEvent,
  logDatabaseQuery,
  logPerformance,
  createChildLogger,
  generateRequestId,
} from '#start/logging'
import { errorTracking } from './error_tracking_service'
import { performanceMonitor } from './performance_monitor_service'
import type { ErrorSeverity, ErrorCategory } from './error_tracking_service'

/**
 * Log entry with full context
 */
interface LogEntry {
  message: string
  level?: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'
  context?: Record<string, any>
  userId?: string
  requestId?: string
  error?: Error
}

/**
 * Structured log data
 */
interface StructuredLogData {
  timestamp: string
  level: string
  message: string
  context?: Record<string, any>
  userId?: string
  requestId?: string
}

export default class LoggingService {
  private static instance: LoggingService

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService()
    }
    return LoggingService.instance
  }

  /**
   * Log info message
   */
  info(message: string, context?: Record<string, any>): void {
    logger.info(sanitizeData(context || {}), message)
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: Record<string, any>): void {
    logger.warn(sanitizeData(context || {}), message)
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    const logContext = {
      ...sanitizeData(context || {}),
      err: error,
    }
    logger.error(logContext, message)
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: Record<string, any>): void {
    logger.debug(sanitizeData(context || {}), message)
  }

  /**
   * Log trace message
   */
  trace(message: string, context?: Record<string, any>): void {
    logger.trace(sanitizeData(context || {}), message)
  }

  /**
   * Log fatal error
   */
  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    const logContext = {
      ...sanitizeData(context || {}),
      err: error,
    }
    logger.fatal(logContext, message)
  }

  /**
   * Log HTTP request
   */
  logRequest(
    ctx: HttpContext,
    duration: [number, number],
    statusCode: number
  ): void {
    const context = extractUserContext(ctx)
    const durationMs = (duration[0] * 1000 + duration[1] / 1e6).toFixed(2)

    logger.info(
      {
        ...context,
        statusCode,
        duration: `${durationMs}ms`,
      },
      `${ctx.request.method()} ${ctx.request.url()} ${statusCode}`
    )

    // Also track in performance monitor
    performanceMonitor.recordHttpRequest(ctx, parseFloat(durationMs))
  }

  /**
   * Log error with tracking
   */
  async logError(
    error: Error,
    context?: {
      category?: ErrorCategory
      severity?: ErrorSeverity
      ctx?: HttpContext
      userId?: string
      additionalContext?: Record<string, any>
    }
  ): Promise<string> {
    // Log to standard logger
    this.error(error.message, error, context?.additionalContext)

    // Track in error tracking service
    const errorId = await errorTracking.trackError(error, context || {})

    return errorId
  }

  /**
   * Log security event
   */
  logSecurityEvent(
    eventType: string,
    ctx: HttpContext | null,
    details: Record<string, any>
  ): void {
    logSecurityEvent(eventType, ctx, details)
  }

  /**
   * Log payment event (PCI-DSS compliant)
   */
  logPaymentEvent(
    eventType: 'payment_attempt' | 'payment_success' | 'payment_failure' | 'refund',
    details: {
      orderId?: string
      paymentMethod?: string
      amount?: number
      currency?: string
      errorMessage?: string
      [key: string]: any
    }
  ): void {
    logPaymentEvent(eventType, details)
  }

  /**
   * Log database query
   */
  logDatabaseQuery(
    query: string,
    bindings: any[],
    duration: number,
    connection: string = 'primary'
  ): void {
    logDatabaseQuery(query, bindings, duration, connection)
    performanceMonitor.recordDatabaseQuery(query, duration, bindings, connection)
  }

  /**
   * Log performance metric
   */
  logPerformance(
    metricType: string,
    value: number,
    unit: string = 'ms',
    context?: Record<string, any>
  ): void {
    logPerformance(metricType, value, unit, context)
  }

  /**
   * Create child logger with context
   */
  createChildLogger(parentContext: Record<string, any>) {
    return createChildLogger(parentContext)
  }

  /**
   * Create request-specific logger
   */
  createRequestLogger(ctx: HttpContext) {
    const context = extractUserContext(ctx)
    return this.createChildLogger(context)
  }

  /**
   * Sanitize data (remove sensitive fields)
   */
  sanitizeData<T extends Record<string, any>>(data: T): T {
    return sanitizeData(data) as T
  }

  /**
   * Get recent logs (for debugging/admin)
   */
  getRecentLogs(count: number = 100): StructuredLogData[] {
    // This would typically read from log files or a log aggregation service
    // For now, return empty array as logs are written to files
    return []
  }

  /**
   * Search logs by criteria
   */
  searchLogs(criteria: {
    level?: string
    userId?: string
    requestId?: string
    startTime?: Date
    endTime?: Date
    message?: string
  }): StructuredLogData[] {
    // This would typically query a log aggregation service like ELK
    // For now, return empty array
    return []
  }

  /**
   * Get logging statistics
   */
  getStats(): {
    totalLogs: number
    logsByLevel: Record<string, number>
    recentErrors: number
  } {
    // This would typically query log aggregation service
    // For now, return mock data
    return {
      totalLogs: 0,
      logsByLevel: {},
      recentErrors: 0,
    }
  }

  /**
   * Flush any buffered logs
   */
  async flush(): Promise<void> {
    // Pino logs are automatically flushed, but this can be used
    // for any custom buffering logic
    return Promise.resolve()
  }

  /**
   * Change log level at runtime
   */
  setLogLevel(level: 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'): void {
    logger.level = level
    this.info(`Log level changed to: ${level}`)
  }

  /**
   * Get current log level
   */
  getLogLevel(): string {
    return logger.level
  }
}

/**
 * Export singleton instance
 */
export const loggingService = LoggingService.getInstance()
