import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'

export default class HealthController {
  async check({ response }: HttpContext) {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: 'ok',
        memory: 'ok',
      },
    }

    try {
      // Check database connection
      await db.rawQuery('SELECT 1')
    } catch (error) {
      health.status = 'error'
      health.checks.database = 'error'
    }

    // Check memory usage
    const memoryUsage = process.memoryUsage()
    const memoryThreshold = 1024 * 1024 * 1024 // 1GB

    if (memoryUsage.heapUsed > memoryThreshold) {
      health.status = 'warning'
      health.checks.memory = 'warning'
    }

    const statusCode = health.status === 'ok' ? 200 : health.status === 'warning' ? 200 : 503

    return response.status(statusCode).json(health)
  }
}
