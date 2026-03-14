/**
 * Logging utilities and helpers for AdonisCommerce
 *
 * This module provides centralized logging utilities with correlation IDs,
 * sensitive data filtering, and structured logging support.
 */

import logger from '@adonisjs/core/services/logger'
import type { HttpContext } from '@adonisjs/core/http'
import { randomBytes } from 'node:crypto'

/**
 * Sensitive data patterns to filter from logs
 */
const SENSITIVE_PATTERNS = [
  /password/i,
  /token/i,
  /secret/i,
  /api[_-]?key/i,
  /authorization/i,
  /cookie/i,
  /session/i,
  /credit[_-]?card/i,
  /cvv/i,
  /ssn/i,
  /pin/i,
]

/**
 * Generate a unique request ID for distributed tracing
 */
export function generateRequestId(): string {
  return randomBytes(16).toString('hex')
}

/**
 * Sanitize data by removing sensitive fields
 */
export function sanitizeData(data: Record<string, any>): Record<string, any> {
  const sanitized: Record<string, any> = {}

  for (const [key, value] of Object.entries(data)) {
    // Check if key matches any sensitive pattern
    const isSensitive = SENSITIVE_PATTERNS.some(pattern => pattern.test(key))

    if (isSensitive) {
      sanitized[key] = '[REDACTED]'
    } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeData(value)
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map(item =>
        typeof item === 'object' && item !== null ? sanitizeData(item) : item
      )
    } else {
      sanitized[key] = value
    }
  }

  return sanitized
}

/**
 * Sanitize request body by removing sensitive fields
 */
export function sanitizeRequestBody(body: any): any {
  if (!body || typeof body !== 'object') {
    return body
  }

  return sanitizeData(body)
}

/**
 * Extract user context from HTTP request
 */
export function extractUserContext(ctx: HttpContext): Record<string, any> {
  const user = ctx.auth?.user
  const context: Record<string, any> = {
    requestId: ctx.requestId(),
    method: ctx.request.method(),
    url: ctx.request.url(),
    ip: ctx.request.ip(),
    userAgent: ctx.request.header('user-agent'),
  }

  if (user) {
    context.userId = user.id
    context.userRole = user.role
  }

  return context
}

/**
 * Log request with timing
 */
export function logRequest(
  ctx: HttpContext,
  duration: number,
  statusCode: number
): void {
  const context = extractUserContext(ctx)
  const durationMs = (duration[0] * 1000 + duration[1] / 1e6).toFixed(2)

  logger.info(context, `${ctx.request.method()} ${ctx.request.url()} ${statusCode} (${durationMs}ms)`)
}

/**
 * Log error with full context
 */
export function logError(
  ctx: HttpContext | null,
  error: Error,
  additionalContext?: Record<string, any>
): void {
  const context: Record<string, any> = {
    err: error,
    ...additionalContext,
  }

  if (ctx) {
    Object.assign(context, extractUserContext(ctx))
  }

  logger.error(context, error.message)
}

/**
 * Log security event
 */
export function logSecurityEvent(
  eventType: string,
  ctx: HttpContext | null,
  details: Record<string, any>
): void {
  const context: Record<string, any> = {
    eventType,
    ...sanitizeData(details),
  }

  if (ctx) {
    Object.assign(context, {
      requestId: ctx.requestId(),
      method: ctx.request.method(),
      url: ctx.request.url(),
      ip: ctx.request.ip(),
      userAgent: ctx.request.header('user-agent'),
    })
  }

  logger.security(context, `Security event: ${eventType}`)
}

/**
 * Log performance metric
 */
export function logPerformance(
  metricType: string,
  value: number,
  unit: string = 'ms',
  context?: Record<string, any>
): void {
  const logContext = {
    metricType,
    value,
    unit,
    ...sanitizeData(context || {}),
  }

  logger.performance(logContext, `Performance: ${metricType} = ${value}${unit}`)
}

/**
 * Log database query
 */
export function logDatabaseQuery(
  query: string,
  bindings: any[],
  duration: number,
  connection: string = 'primary'
): void {
  const context = {
    query: query.substring(0, 500), // Truncate long queries
    bindings: sanitizeData(bindings),
    duration: `${duration.toFixed(2)}ms`,
    connection,
  }

  logger.database(context, 'Database query executed')
}

/**
 * Log payment event (PCI-DSS compliant)
 */
export function logPaymentEvent(
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
  // Never log full payment details - only metadata
  const sanitizedDetails = {
    eventType,
    ...sanitizeData(details),
  }

  logger.payments(sanitizedDetails, `Payment event: ${eventType}`)
}

/**
 * Create a child logger with additional context
 */
export function createChildLogger(parentContext: Record<string, any>) {
  return {
    info: (message: string, additionalContext?: Record<string, any>) => {
      logger.info({ ...parentContext, ...sanitizeData(additionalContext || {}) }, message)
    },
    warn: (message: string, additionalContext?: Record<string, any>) => {
      logger.warn({ ...parentContext, ...sanitizeData(additionalContext || {}) }, message)
    },
    error: (message: string, error?: Error, additionalContext?: Record<string, any>) => {
      logger.error(
        { ...parentContext, err: error, ...sanitizeData(additionalContext || {}) },
        message
      )
    },
    debug: (message: string, additionalContext?: Record<string, any>) => {
      logger.debug({ ...parentContext, ...sanitizeData(additionalContext || {}) }, message)
    },
  }
}

/**
 * Check if a request should be logged (skip health checks, metrics, etc.)
 */
export function shouldLogRequest(url: string): boolean {
  const skipPaths = ['/health', '/metrics', '/favicon.ico', '/robots.txt']
  return !skipPaths.some(path => url.startsWith(path))
}

/**
 * Format duration in human-readable format
 */
export function formatDuration(duration: [number, number]): string {
  const ms = duration[0] * 1000 + duration[1] / 1e6
  if (ms < 1000) {
    return `${ms.toFixed(2)}ms`
  }
  return `${(ms / 1000).toFixed(2)}s`
}

/**
 * Get log level based on HTTP status code
 */
export function getLogLevelForStatus(statusCode: number): 'info' | 'warn' | 'error' {
  if (statusCode >= 500) {
    return 'error'
  }
  if (statusCode >= 400) {
    return 'warn'
  }
  return 'info'
}
