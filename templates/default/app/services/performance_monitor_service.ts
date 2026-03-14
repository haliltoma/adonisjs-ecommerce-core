/**
 * Performance Monitoring Service
 *
 * Monitors application performance metrics including:
 * - Request/response times
 * - Database query performance
 * - External API call performance
 * - Memory usage
 * - Custom metrics
 */

import logger from '@adonisjs/core/services/logger'
import { DateTime } from 'luxon'
import type { HttpContext } from '@adonisjs/core/http'
import { logPerformance } from '#start/logging'

/**
 * Metric types
 */
export type MetricType =
  | 'http_request'
  | 'database_query'
  | 'external_api'
  | 'cache_operation'
  | 'file_operation'
  | 'custom'

/**
 * Performance metric record
 */
interface PerformanceMetric {
  id: string
  type: MetricType
  name: string
  duration: number
  unit: string
  timestamp: DateTime
  metadata?: Record<string, any>
  userId?: string
  requestId?: string
}

/**
 * Performance statistics
 */
interface PerformanceStats {
  totalMetrics: number
  averageResponseTime: number
  slowestRequests: Array<{
    url: string
    method: string
    duration: number
    timestamp: DateTime
  }>
  slowestQueries: Array<{
    query: string
    duration: number
    timestamp: DateTime
  }>
  metricsByType: Record<MetricType, number>
}

/**
 * Performance thresholds
 */
interface PerformanceThresholds {
  slowRequestMs: number
  slowQueryMs: number
  slowApiCallMs: number
  memoryWarningMb: number
  memoryCriticalMb: number
}

export default class PerformanceMonitorService {
  private static instance: PerformanceMonitorService
  private metrics: PerformanceMetric[] = []
  private maxMetrics: number = 10000
  private thresholds: PerformanceThresholds = {
    slowRequestMs: 1000,
    slowQueryMs: 100,
    slowApiCallMs: 2000,
    memoryWarningMb: 512,
    memoryCriticalMb: 1024,
  }

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): PerformanceMonitorService {
    if (!PerformanceMonitorService.instance) {
      PerformanceMonitorService.instance = new PerformanceMonitorService()
    }
    return PerformanceMonitorService.instance
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      id: this.generateMetricId(),
      timestamp: DateTime.now(),
    }

    this.metrics.push(fullMetric)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log slow performance
    this.checkThresholds(fullMetric)
  }

  /**
   * Record HTTP request timing
   */
  recordHttpRequest(
    ctx: HttpContext,
    duration: number
  ): void {
    this.recordMetric({
      type: 'http_request',
      name: `${ctx.request.method()} ${ctx.request.url()}`,
      duration,
      unit: 'ms',
      metadata: {
        url: ctx.request.url(),
        method: ctx.request.method(),
        statusCode: ctx.response.getStatus(),
        ip: ctx.request.ip(),
      },
      userId: ctx.auth?.user?.id,
      requestId: ctx.requestId(),
    })
  }

  /**
   * Record database query timing
   */
  recordDatabaseQuery(
    query: string,
    duration: number,
    bindings?: any[],
    connection?: string
  ): void {
    this.recordMetric({
      type: 'database_query',
      name: query.substring(0, 100),
      duration,
      unit: 'ms',
      metadata: {
        query: query.substring(0, 500),
        bindings,
        connection,
      },
    })
  }

  /**
   * Record external API call timing
   */
  recordExternalApiCall(
    apiName: string,
    endpoint: string,
    duration: number,
    statusCode?: number
  ): void {
    this.recordMetric({
      type: 'external_api',
      name: `${apiName} ${endpoint}`,
      duration,
      unit: 'ms',
      metadata: {
        apiName,
        endpoint,
        statusCode,
      },
    })
  }

  /**
   * Record cache operation timing
   */
  recordCacheOperation(
    operation: 'get' | 'set' | 'delete' | 'clear',
    key: string,
    duration: number,
    hit?: boolean
  ): void {
    this.recordMetric({
      type: 'cache_operation',
      name: `cache ${operation}`,
      duration,
      unit: 'ms',
      metadata: {
        operation,
        key: key.substring(0, 100),
        hit,
      },
    })
  }

  /**
   * Get performance statistics
   */
  getStats(timeRange?: { from: DateTime; to: DateTime }): PerformanceStats {
    let metrics = this.metrics

    // Filter by time range if provided
    if (timeRange) {
      metrics = metrics.filter(
        m => m.timestamp >= timeRange.from && m.timestamp <= timeRange.to
      )
    }

    // Calculate stats
    const httpMetrics = metrics.filter(m => m.type === 'http_request')
    const avgResponseTime =
      httpMetrics.length > 0
        ? httpMetrics.reduce((sum, m) => sum + m.duration, 0) / httpMetrics.length
        : 0

    const slowestRequests = httpMetrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(m => ({
        url: m.metadata?.url || 'unknown',
        method: m.metadata?.method || 'unknown',
        duration: m.duration,
        timestamp: m.timestamp,
      }))

    const dbMetrics = metrics.filter(m => m.type === 'database_query')
    const slowestQueries = dbMetrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10)
      .map(m => ({
        query: m.metadata?.query || 'unknown',
        duration: m.duration,
        timestamp: m.timestamp,
      }))

    const metricsByType: Record<MetricType, number> = {
      http_request: 0,
      database_query: 0,
      external_api: 0,
      cache_operation: 0,
      file_operation: 0,
      custom: 0,
    }

    for (const metric of metrics) {
      metricsByType[metric.type]++
    }

    return {
      totalMetrics: metrics.length,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      slowestRequests,
      slowestQueries,
      metricsByType,
    }
  }

  /**
   * Get current memory usage
   */
  getMemoryUsage(): {
    used: number
    total: number
    percentage: number
    status: 'ok' | 'warning' | 'critical'
  } {
    const usage = process.memoryUsage()
    const used = usage.heapUsed / 1024 / 1024 // Convert to MB
    const total = usage.heapTotal / 1024 / 1024
    const percentage = (used / total) * 100

    let status: 'ok' | 'warning' | 'critical' = 'ok'
    if (used >= this.thresholds.memoryCriticalMb) {
      status = 'critical'
    } else if (used >= this.thresholds.memoryWarningMb) {
      status = 'warning'
    }

    return {
      used: Math.round(used * 100) / 100,
      total: Math.round(total * 100) / 100,
      percentage: Math.round(percentage * 100) / 100,
      status,
    }
  }

  /**
   * Check performance thresholds and log warnings
   */
  private checkThresholds(metric: PerformanceMetric): void {
    if (metric.type === 'http_request' && metric.duration > this.thresholds.slowRequestMs) {
      logger.warn(
        {
          type: 'slow_request',
          name: metric.name,
          duration: metric.duration,
          requestId: metric.requestId,
        },
        `Slow request detected: ${metric.name} took ${metric.duration}ms`
      )
    }

    if (metric.type === 'database_query' && metric.duration > this.thresholds.slowQueryMs) {
      logger.warn(
        {
          type: 'slow_query',
          query: metric.metadata?.query,
          duration: metric.duration,
        },
        `Slow query detected: took ${metric.duration}ms`
      )
    }

    if (metric.type === 'external_api' && metric.duration > this.thresholds.slowApiCallMs) {
      logger.warn(
        {
          type: 'slow_api_call',
          apiName: metric.name,
          duration: metric.duration,
        },
        `Slow external API call: ${metric.name} took ${metric.duration}ms`
      )
    }
  }

  /**
   * Check memory usage and log warnings
   */
  checkMemoryUsage(): void {
    const memory = this.getMemoryUsage()

    if (memory.status === 'critical') {
      logger.error(
        {
          used: memory.used,
          total: memory.total,
          percentage: memory.percentage,
        },
        'Critical memory usage detected'
      )
    } else if (memory.status === 'warning') {
      logger.warn(
        {
          used: memory.used,
          total: memory.total,
          percentage: memory.percentage,
        },
        'High memory usage detected'
      )
    }
  }

  /**
   * Clear old metrics (older than specified hours)
   */
  clearOldMetrics(hours: number = 24): number {
    const cutoff = DateTime.now().minus({ hours })
    const before = this.metrics.length

    this.metrics = this.metrics.filter(m => m.timestamp >= cutoff)

    const cleared = before - this.metrics.length
    if (cleared > 0) {
      logger.info({ cleared, hours }, 'Cleared old performance metrics')
    }

    return cleared
  }

  /**
   * Generate metric ID
   */
  private generateMetricId(): string {
    return `metric-${Date.now()}-${Math.random().toString(36).substring(7)}`
  }

  /**
   * Update performance thresholds
   */
  updateThresholds(thresholds: Partial<PerformanceThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds }
    logger.info({ thresholds: this.thresholds }, 'Performance thresholds updated')
  }
}

/**
 * Export singleton instance
 */
export const performanceMonitor = PerformanceMonitorService.getInstance()
