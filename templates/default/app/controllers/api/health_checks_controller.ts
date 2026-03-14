/**
 * Health Checks Controller
 *
 * Handles health check endpoints for monitoring and diagnostics.
 */

import type { HttpContext } from '@adonisjs/core/http'
import { healthChecks } from '#start/health'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'
import app from '@adonisjs/core/services/app'
import healthChecksConfig from '#config/health_checks'
import { performanceMonitor } from '#services/performance_monitor_service'

export default class HealthChecksController {
  /**
   * Liveness probe - checks if the process is running
   * GET /health/live
   */
  async live({ response }: HttpContext) {
    return response.ok({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    })
  }

  /**
   * Readiness probe - checks if the application and dependencies are healthy
   * GET /health/ready
   */
  async ready({ request, response }: HttpContext) {
    // Check monitoring secret if configured
    if (healthChecksConfig.endpoint.secretHeaderValue) {
      const secret = request.header('x-monitoring-secret')
      if (secret !== healthChecksConfig.endpoint.secretHeaderValue) {
        return response.unauthorized({
          error: 'Unauthorized access',
          message: 'Valid monitoring secret required',
        })
      }
    }

    try {
      const report = await healthChecks.run()

      if (report.isHealthy) {
        return response.ok(report)
      }

      return response.serviceUnavailable(report)
    } catch (error) {
      logger.error({ err: error }, 'Health check failed')

      return response.status(503).send({
        status: 'error',
        message: 'Health check failed',
        error: (error as Error).message,
      })
    }
  }

  /**
   * Detailed health report with all checks
   * GET /health/detailed
   */
  async detailed({ request, response }: HttpContext) {
    // Check monitoring secret if configured
    if (healthChecksConfig.endpoint.secretHeaderValue) {
      const secret = request.header('x-monitoring-secret')
      if (secret !== healthChecksConfig.endpoint.secretHeaderValue) {
        return response.unauthorized({
          error: 'Unauthorized access',
          message: 'Valid monitoring secret required',
        })
      }
    }

    try {
      // Force refresh (bypass cache) if ?refresh=true
      const forceRefresh = request.qs().refresh === 'true'

      if (forceRefresh) {
        // Clear cache not available, skip
      }

      const report = await healthChecks.run()

      // Add additional diagnostics
      const diagnostics = {
        memory: performanceMonitor.getMemoryUsage(),
        environment: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          env: app.nodeEnvironment,
        },
        app: {
          name: env.get('APP_NAME'),
          version: env.get('APP_VERSION', '1.0.0'),
          timezone: process.env.TZ || 'UTC',
        },
      }

      return response.ok({
        ...report,
        diagnostics,
      })
    } catch (error) {
      logger.error({ err: error }, 'Detailed health check failed')

      return response.status(503).send({
        status: 'error',
        message: 'Detailed health check failed',
        error: (error as Error).message,
      })
    }
  }

  /**
   * Get application version information
   * GET /diagnostics/version
   */
  async version({ response }: HttpContext) {
    return response.ok({
      appName: env.get('APP_NAME'),
      appVersion: env.get('APP_VERSION', '1.0.0'),
      adonisVersion: require('@adonisjs/core/package.json').version,
      nodeVersion: process.version,
      buildDate: env.get('BUILD_DATE', new Date().toISOString()),
      gitCommit: env.get('GIT_COMMIT', 'unknown'),
    })
  }

  /**
   * Get safe configuration values (no secrets)
   * GET /diagnostics/config
   */
  async config({ response }: HttpContext) {
    const safeConfig = {
      app: {
        name: env.get('APP_NAME'),
        env: app.nodeEnv,
        debug: app.inDev,
        timezone: env.get('TZ', 'UTC'),
      },
      logging: {
        level: logger.level,
      },
      healthChecks: {
        cacheDuration: healthChecksConfig.healthChecks.cacheDuration,
      },
      features: {
        database: healthChecksConfig.database.enabled,
        redis: healthChecksConfig.redis.enabled,
        queue: healthChecksConfig.queue.enabled,
      },
    }

    return response.ok(safeConfig)
  }

  /**
   * Get runtime metrics
   * GET /diagnostics/metrics
   */
  async metrics({ response }: HttpContext) {
    const perfStats = performanceMonitor.getStats()
    const memory = performanceMonitor.getMemoryUsage()

    return response.ok({
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory,
      performance: perfStats,
      process: {
        pid: process.pid,
        ppid: process.ppid,
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
      },
    })
  }

  /**
   * Get all registered routes
   * GET /diagnostics/routes
   */
  async routes({ response }: HttpContext) {
    const router = require('@adonisjs/core/services/router').default
    const routes = router.lookup()

    const formattedRoutes = routes.map((route: any) => ({
      method: route.methods,
      pattern: route.pattern,
      handler: route.handler,
      middleware: route.middleware,
      name: route.name,
    }))

    return response.ok({
      total: formattedRoutes.length,
      routes: formattedRoutes,
    })
  }

  /**
   * Get cache statistics
   * GET /diagnostics/cache
   */
  async cache({ response }: HttpContext) {
    try {
      const redis = require('@adonisjs/redis/services/main').default

      // Try to get Redis info
      const info = await redis.connection('local').info()

      return response.ok({
        driver: 'redis',
        connected: true,
        info: this.parseRedisInfo(info),
      })
    } catch (error) {
      return response.ok({
        driver: 'redis',
        connected: false,
        error: (error as Error).message,
      })
    }
  }

  /**
   * Parse Redis INFO command output
   */
  private parseRedisInfo(info: string): Record<string, any> {
    const lines = info.split('\r\n')
    const parsed: Record<string, any> = {}

    for (const line of lines) {
      if (line.startsWith('#') || !line.includes(':')) {
        continue
      }

      const [key, value] = line.split(':')
      parsed[key] = value
    }

    return parsed
  }
}
