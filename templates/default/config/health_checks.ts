/**
 * Health Checks Configuration
 *
 * Configure health checks for monitoring application health and dependencies.
 */

import env from '#start/env'

export default {
  /**
   * Health check endpoint configuration
   */
  endpoint: {
    /**
     * Secret header for protecting health endpoints
     * Set via HEALTH_CHECK_SECRET environment variable
     */
    secretHeaderName: 'x-monitoring-secret',
    secretHeaderValue: env.get('HEALTH_CHECK_SECRET'),
  },

  /**
   * Health check configuration
   */
  healthChecks: {
    /**
     * Enable/disable health checks
     */
    enabled: true,

    /**
     * Cache duration in seconds (default: 30s)
     * Prevents health checks from being called too frequently
     */
    cacheDuration: 30,
  },

  /**
   * Disk space check configuration
   */
  diskSpace: {
    /**
     * Warning threshold in percentage (default: 75%)
     */
    warningThreshold: 75,

    /**
     * Failure threshold in percentage (default: 80%)
     */
    failureThreshold: 80,

    /**
     * Path to check disk space for (default: current working directory)
     */
    path: process.cwd(),
  },

  /**
   * Memory heap check configuration
   */
  memoryHeap: {
    /**
     * Warning threshold (default: 250MB)
     */
    warningThreshold: '250 mb',

    /**
     * Failure threshold (default: 300MB)
     */
    failureThreshold: '300 mb',
  },

  /**
   * Memory RSS check configuration
   */
  memoryRSS: {
    /**
     * Warning threshold (default: 320MB)
     */
    warningThreshold: '320 mb',

    /**
     * Failure threshold (default: 350MB)
     */
    failureThreshold: '350 mb',
  },

  /**
   * Database connection check configuration
   */
  database: {
    /**
     * Enable database connection check
     */
    enabled: true,

    /**
     * Connection name to check (default: 'primary')
     */
    connectionName: 'primary',

    /**
     * Query timeout in milliseconds (default: 1000ms)
     */
    timeout: 1000,

    /**
     * Connection count check configuration
     */
    connectionCount: {
      /**
       * Enable connection count monitoring
       */
      enabled: true,

      /**
       * Warning threshold (default: 10 connections)
       */
      warningThreshold: 10,

      /**
       * Failure threshold (default: 15 connections)
       */
      failureThreshold: 15,
    },
  },

  /**
   * Redis connection check configuration
   */
  redis: {
    /**
     * Enable Redis connection check
     */
    enabled: true,

    /**
     * Connection name to check (default: 'local')
     */
    connectionName: env.get('REDIS_CONNECTION', 'local'),

    /**
     * Memory usage check configuration
     */
    memoryUsage: {
      /**
       * Enable Redis memory monitoring
       */
      enabled: true,

      /**
       * Warning threshold (default: 100MB)
       */
      warningThreshold: '100 mb',

      /**
       * Failure threshold (default: 120MB)
       */
      failureThreshold: '120 mb',
    },
  },

  /**
   * File system check configuration
   */
  fileSystem: {
    /**
     * Enable file system check
     */
    enabled: true,

    /**
     * Paths to check for write permissions
     */
    paths: [
      'tmp/uploads',
      'tmp/logs',
      'public/uploads',
    ],
  },

  /**
   * Queue system check configuration (BullMQ)
   */
  queue: {
    /**
     * Enable queue health check
     */
    enabled: true,

    /**
     * Maximum queue depth before warning
     */
    warningDepth: 100,

    /**
     * Maximum queue depth before failure
     */
    failureDepth: 500,

    /**
     * Maximum job age in seconds before warning
     */
    maxJobAge: 3600, // 1 hour
  },

  /**
   * External API check configuration
   */
  externalAPIs: {
    /**
     * Enable external API checks
     */
    enabled: true,

    /**
     * API configurations to check
     */
    apis: {
      /**
       * Stripe API check
       */
      stripe: {
        enabled: env.get('STRIPE_SECRET_KEY') ? true : false,
        url: 'https://api.stripe.com/v1',
        timeout: 5000,
      },

      /**
       * Custom external APIs can be added here
       */
      // customAPI: {
      //   enabled: true,
      //   url: 'https://api.example.com/health',
      //   timeout: 5000,
      // },
    },
  },

  /**
   * Custom health checks configuration
   */
  custom: {
    /**
     * Application-specific health checks
     */
    checks: [],
  },
}
