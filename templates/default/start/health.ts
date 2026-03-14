/**
 * Health Checks Registration
 *
 * Register all health checks for monitoring application health.
 */

import { HealthChecks, DiskSpaceCheck, MemoryHeapCheck, MemoryRSSCheck } from '@adonisjs/core/health'
import { DbCheck, DbConnectionCountCheck } from '@adonisjs/lucid/health_checks'
import { RedisCheck, RedisMemoryUsageCheck } from '@adonisjs/redis/health_checks'
import redis from '@adonisjs/redis/services/main'
import db from '@adonisjs/lucid/services/db'
import app from '@adonisjs/core/services/app'
import env from '#start/env'
import healthChecksConfig from '#config/health_checks'
import logger from '@adonisjs/core/services/logger'
import fs from 'node:fs/promises'
import path from 'node:path'
import { QueueHealthCheck } from '#services/queue_health_check'
import { ExternalAPIHealthCheck } from '#services/external_api_health_check'
import { FileSystemHealthCheck } from '#services/filesystem_health_check'

/**
 * Health checks instance
 */
export const healthChecks = new HealthChecks({
  /**
   * Secret header value for protecting health endpoints
   */
  secret: healthChecksConfig.secretHeaderValue,

  /**
   * Cache duration in seconds
   */
  cacheDuration: healthChecksConfig.healthChecks.cacheDuration,
})

/**
 * Register built-in health checks
 */

// Disk space check
healthChecks.register([
  new DiskSpaceCheck(healthChecksConfig.diskSpace.path)
    .warnWhenExceeds(healthChecksConfig.diskSpace.warningThreshold)
    .failWhenExceeds(healthChecksConfig.diskSpace.failureThreshold),
])

// Memory heap check
healthChecks.register([
  new MemoryHeapCheck()
    .warnWhenExceeds(healthChecksConfig.memoryHeap.warningThreshold)
    .failWhenExceeds(healthChecksConfig.memoryHeap.failureThreshold),
])

// Memory RSS check
healthChecks.register([
  new MemoryRSSCheck()
    .warnWhenExceeds(healthChecksConfig.memoryRSS.warningThreshold)
    .failWhenExceeds(healthChecksConfig.memoryRSS.failureThreshold),
])

/**
 * Register database health checks
 */
if (healthChecksConfig.database.enabled) {
  const dbConnection = db.connection(healthChecksConfig.database.connectionName)

  // Database connection check
  healthChecks.register([
    new DbCheck(dbConnection),
  ])

  // Database connection count check
  if (healthChecksConfig.database.connectionCount.enabled) {
    healthChecks.register([
      new DbConnectionCountCheck(dbConnection)
        .warnWhenExceeds(healthChecksConfig.database.connectionCount.warningThreshold)
        .failWhenExceeds(healthChecksConfig.database.connectionCount.failureThreshold),
    ])
  }
}

/**
 * Register Redis health checks
 */
if (healthChecksConfig.redis.enabled) {
  const redisConnection = redis.connection(healthChecksConfig.redis.connectionName)

  // Redis connection check
  healthChecks.register([
    new RedisCheck(redisConnection),
  ])

  // Redis memory usage check
  if (healthChecksConfig.redis.memoryUsage.enabled) {
    healthChecks.register([
      new RedisMemoryUsageCheck(redisConnection)
        .warnWhenExceeds(healthChecksConfig.redis.memoryUsage.warningThreshold)
        .failWhenExceeds(healthChecksConfig.redis.memoryUsage.failureThreshold),
    ])
  }
}

/**
 * Register file system health checks
 */
if (healthChecksConfig.fileSystem.enabled) {
  for (const checkPath of healthChecksConfig.fileSystem.paths) {
    const fullPath = path.join(app.appRoot, checkPath)
    healthChecks.register([
      new FileSystemHealthCheck(fullPath, checkPath),
    ])
  }
}

/**
 * Register queue health checks
 */
if (healthChecksConfig.queue.enabled) {
  healthChecks.register([
    new QueueHealthCheck(healthChecksConfig.queue),
  ])
}

/**
 * Register external API health checks
 */
if (healthChecksConfig.externalAPIs.enabled) {
  for (const [apiName, apiConfig] of Object.entries(healthChecksConfig.externalAPIs.apis)) {
    if (apiConfig.enabled) {
      healthChecks.register([
        new ExternalAPIHealthCheck(apiName, apiConfig.url, apiConfig.timeout),
      ])
    }
  }
}

/**
 * Register custom health checks
 */
for (const customCheck of healthChecksConfig.custom.checks) {
  healthChecks.register([customCheck])
}

/**
 * Log health checks registration
 */
logger.info('Health checks registered successfully')
