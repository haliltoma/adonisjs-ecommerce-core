/**
 * Logging Middleware
 *
 * Logs all incoming requests and outgoing responses with timing information.
 * Includes request method, URL, status code, duration, and user context.
 */

import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import string from '@adonisjs/core/helpers/string'
import { shouldLogRequest, formatDuration, sanitizeRequestBody, getLogLevelForStatus } from '#start/logging'

export default class LoggingMiddleware {
  /**
   * Handle request by logging with timing
   */
  async handle(ctx: HttpContext, next: NextFn) {
    // Skip logging for certain paths
    if (!shouldLogRequest(ctx.request.url())) {
      return next()
    }

    // Capture start time
    const startTime = process.hrtime()

    // Log incoming request
    this.logIncomingRequest(ctx)

    // Process request
    await next()

    // Capture end time and calculate duration
    const endTime = process.hrtime(startTime)
    const responseStatus = ctx.response.getStatus()

    // Log outgoing response
    this.logOutgoingResponse(ctx, endTime, responseStatus)
  }

  /**
   * Log incoming request details
   */
  private logIncomingRequest(ctx: HttpContext): void {
    const { request } = ctx
    const logData: Record<string, any> = {
      method: request.method(),
      url: request.url(),
      ip: request.ip(),
      userAgent: request.header('user-agent'),
      requestId: ctx.requestId(),
    }

    // Add user context if authenticated
    if (ctx.auth?.user) {
      logData.userId = ctx.auth.user.id
      logData.userRole = ctx.auth.user.role
    }

    // Add request ID for distributed tracing
    logData.requestId = ctx.requestId()

    ctx.logger.info(logData, 'Incoming request')
  }

  /**
   * Log outgoing response details
   */
  private logOutgoingResponse(
    ctx: HttpContext,
    duration: [number, number],
    statusCode: number
  ): void {
    const { request, response } = ctx
    const logData: Record<string, any> = {
      method: request.method(),
      url: request.url(),
      status: statusCode,
      duration: formatDuration(duration),
      durationMs: (duration[0] * 1000 + duration[1] / 1e6).toFixed(2),
      requestId: ctx.requestId(),
    }

    // Add content length if available
    const contentLength = response.header('content-length')
    if (contentLength) {
      logData.contentLength = contentLength
    }

    // Determine log level based on status code
    const logLevel = getLogLevelForStatus(statusCode)

    // Log with appropriate level
    if (logLevel === 'error') {
      ctx.logger.error(logData, 'Request completed with error')
    } else if (logLevel === 'warn') {
      ctx.logger.warn(logData, 'Request completed with warning')
    } else {
      ctx.logger.info(logData, 'Request completed')
    }
  }
}
