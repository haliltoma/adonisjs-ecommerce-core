/**
 * Health Checks Registration
 *
 * Simple health check system without external dependencies.
 */

import logger from '@adonisjs/core/services/logger'

/**
 * Simple health check class
 */
class HealthChecks {
  private checks: Map<string, () => Promise<{ status: 'ok' | 'error'; message?: string }>> = new Map()

  /**
   * Register a health check
   */
  register(name: string, checkFn: () => Promise<{ status: 'ok' | 'error'; message?: string }>) {
    this.checks.set(name, checkFn)
    return this
  }

  /**
   * Run all health checks
   */
  async run(): Promise<{
    isHealthy: boolean
    status: 'ok' | 'warning' | 'error'
    checks: Array<{
      name: string
      status: 'ok' | 'error'
      message?: string
    }>
  }> {
    const results: Array<{
      name: string
      status: 'ok' | 'error'
      message?: string
    }> = []

    for (const [name, checkFn] of this.checks.entries()) {
      try {
        const result = await checkFn()
        results.push({
          name,
          status: result.status,
          message: result.message,
        })
      } catch (error) {
        results.push({
          name,
          status: 'error',
          message: (error as Error).message,
        })
      }
    }

    const hasErrors = results.some(r => r.status === 'error')
    const isHealthy = !hasErrors

    return {
      isHealthy,
      status: isHealthy ? 'ok' : 'error',
      checks: results,
    }
  }
}

/**
 * Health checks instance
 */
export const healthChecks = new HealthChecks()

/**
 * Register basic health checks
 */

// Database health check
try {
  const db = require('@adonisjs/lucid/services/main').default
  healthChecks.register('database', async () => {
    try {
      await db.connection().knex.raw('SELECT 1')
      return { status: 'ok', message: 'Database connection healthy' }
    } catch (error) {
      return { status: 'error', message: `Database error: ${(error as Error).message}` }
    }
  })
} catch {
  // Database not configured
}

// Redis health check
try {
  const redis = require('@adonisjs/redis/services/main').default
  healthChecks.register('redis', async () => {
    try {
      await redis.connection('local').ping()
      return { status: 'ok', message: 'Redis connection healthy' }
    } catch (error) {
      return { status: 'error', message: `Redis error: ${(error as Error).message}` }
    }
  })
} catch {
  // Redis not configured
}

// File system health check
healthChecks.register('filesystem', async () => {
  const fs = require('node:fs/promises')
  const path = require('node:path')
  const app = require('@adonisjs/core/services/app').default

  try {
    const testPath = path.join(app.appRoot, 'tmp')
    await fs.access(testPath, fs.constants.W_OK)
    return { status: 'ok', message: 'File system accessible' }
  } catch (error) {
    return { status: 'error', message: `File system error: ${(error as Error).message}` }
  }
})

logger.info('Health checks registered successfully')
