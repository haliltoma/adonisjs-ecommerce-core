import env from '#start/env'
import app from '@adonisjs/core/services/app'
import { defineConfig, targets } from '@adonisjs/core/logger'

const loggerConfig = defineConfig({
  default: 'app',

  /**
   * Configure multiple loggers for different purposes
   */
  loggers: {
    /**
     * Main application logger
     */
    app: {
      enabled: true,
      name: env.get('APP_NAME', 'adoniscommerce'),
      level: env.get('LOG_LEVEL', 'info'),
      transport: {
        targets: targets()
          .pushIf(!app.inProduction, targets.pretty({
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
            singleLine: false,
          }))
          .pushIf(app.inProduction, targets.file({
            destination: 1, // stdout
            formatterOptions: {
              colorize: false,
            },
          }))
          .pushIf(app.inProduction, targets.file({
            destination: 'tmp/logs/app.log',
            formatterOptions: {
              colorize: false,
            },
          }))
          .toArray(),
      },
    },

    /**
     * Database query logger
     */
    database: {
      enabled: true,
      name: 'database',
      level: env.get('DB_LOG_LEVEL', 'info'),
      transport: {
        targets: targets()
          .pushIf(!app.inDevelopment, targets.pretty({
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          }))
          .pushIf(app.inDevelopment || app.inProduction, targets.file({
            destination: 'tmp/logs/database.log',
            formatterOptions: {
              colorize: false,
            },
          }))
          .toArray(),
      },
    },

    /**
     * Security events logger
     */
    security: {
      enabled: true,
      name: 'security',
      level: env.get('SECURITY_LOG_LEVEL', 'info'),
      transport: {
        targets: targets()
          .pushIf(!app.inDevelopment, targets.pretty({
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          }))
          .pushIf(app.inProduction, targets.file({
            destination: 'tmp/logs/security.log',
            formatterOptions: {
              colorize: false,
            },
          }))
          .toArray(),
      },
    },

    /**
     * Performance monitoring logger
     */
    performance: {
      enabled: true,
      name: 'performance',
      level: env.get('PERF_LOG_LEVEL', 'info'),
      transport: {
        targets: targets()
          .pushIf(!app.inDevelopment, targets.pretty({
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          }))
          .pushIf(app.inProduction, targets.file({
            destination: 'tmp/logs/performance.log',
            formatterOptions: {
              colorize: false,
            },
          }))
          .toArray(),
      },
    },

    /**
     * Payment/transaction logger (PCI-DSS compliant)
     */
    payments: {
      enabled: true,
      name: 'payments',
      level: env.get('PAYMENTS_LOG_LEVEL', 'info'),
      transport: {
        targets: targets()
          .pushIf(!app.inDevelopment, targets.pretty({
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          }))
          .pushIf(app.inProduction, targets.file({
            destination: 'tmp/logs/payments.log',
            formatterOptions: {
              colorize: false,
            },
          }))
          .toArray(),
      },
    },
  },
})

export default loggerConfig

/**
 * Inferring types for the list of loggers you have configured
 * in your application.
 */
declare module '@adonisjs/core/types' {
  export interface LoggersList extends InferLoggers<typeof loggerConfig> {
    app: Logger
    database: Logger
    security: Logger
    performance: Logger
    payments: Logger
  }
}
