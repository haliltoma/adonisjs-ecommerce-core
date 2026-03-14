/**
 * Backup Configuration
 *
 * Configure database, media, and full backup strategies.
 */

import env from '#start/env'

export default {
  /**
   * Enable/disable backup system
   */
  enabled: env.get('BACKUP_ENABLED', 'true') === 'true',

  /**
   * Default backup storage destination
   * - 'local': Local filesystem (for development)
   * - 's3': AWS S3 or compatible (for production)
   * - 'r2': Cloudflare R2
   * - 'custom': Custom storage provider
   */
  defaultDestination: env.get('BACKUP_DESTINATION', 'local'),

  /**
   * Backup storage destinations configuration
   */
  destinations: {
    /**
     * Local filesystem storage
     */
    local: {
      enabled: env.get('BACKUP_LOCAL_ENABLED', 'true') === 'true',
      path: env.get('BACKUP_LOCAL_PATH', 'tmp/backups'),
    },

    /**
     * AWS S3 storage
     */
    s3: {
      enabled: env.get('BACKUP_S3_ENABLED', 'false') === 'true',
      region: env.get('BACKUP_S3_REGION', 'us-east-1'),
      bucket: env.get('BACKUP_S3_BUCKET'),
      accessKeyId: env.get('BACKUP_S3_ACCESS_KEY_ID'),
      secretAccessKey: env.get('BACKUP_S3_SECRET_ACCESS_KEY'),
      prefix: env.get('BACKUP_S3_PREFIX', 'backups/'),
    },

    /**
     * Cloudflare R2 storage
     */
    r2: {
      enabled: env.get('BACKUP_R2_ENABLED', 'false') === 'true',
      accountId: env.get('BACKUP_R2_ACCOUNT_ID'),
      bucket: env.get('BACKUP_R2_BUCKET'),
      accessKeyId: env.get('BACKUP_R2_ACCESS_KEY_ID'),
      secretAccessKey: env.get('BACKUP_R2_SECRET_ACCESS_KEY'),
      prefix: env.get('BACKUP_R2_PREFIX', 'backups/'),
    },
  },

  /**
   * Database backup configuration
   */
  database: {
    /**
     * Enable automatic database backups
     */
    enabled: env.get('BACKUP_DATABASE_ENABLED', 'true') === 'true',

    /**
     * Backup schedule (cron expression)
     * Default: Daily at 2 AM UTC
     */
    schedule: env.get('BACKUP_DATABASE_SCHEDULE', '0 2 * * *'),

    /**
     * Retention policy
     */
    retention: {
      /**
       * Number of daily backups to keep
       */
      daily: parseInt(env.get('BACKUP_RETENTION_DAILY', '7')),

      /**
       * Number of weekly backups to keep
       */
      weekly: parseInt(env.get('BACKUP_RETENTION_WEEKLY', '4')),

      /**
       * Number of monthly backups to keep
       */
      monthly: parseInt(env.get('BACKUP_RETENTION_MONTHLY', '12')),

      /**
       * Number of yearly backups to keep
       */
      yearly: parseInt(env.get('BACKUP_RETENTION_YEARLY', '2')),
    },

    /**
     * Compression settings
     */
    compression: {
      /**
       * Enable compression
       */
      enabled: env.get('BACKUP_COMPRESSION_ENABLED', 'true') === 'true',

      /**
       * Compression level (0-9, higher = better compression but slower)
       */
      level: parseInt(env.get('BACKUP_COMPRESSION_LEVEL', '6')),
    },

    /**
     * Encryption settings
     */
    encryption: {
      /**
       * Enable encryption
       */
      enabled: env.get('BACKUP_ENCRYPTION_ENABLED', 'true') === 'true',

      /**
       * Encryption algorithm
       */
      algorithm: env.get('BACKUP_ENCRYPTION_ALGORITHM', 'aes-256-cbc'),

      /**
       * Encryption key (must be 32 bytes for AES-256)
       */
      key: env.get('BACKUP_ENCRYPTION_KEY'),
    },

    /**
     * Database dump settings
     */
    dump: {
      /**
       * Use pg_dump custom format (more features, smaller size)
       */
      format: env.get('BACKUP_DUMP_FORMAT', 'custom'), // 'plain' or 'custom'

      /**
       * Include CREATE DATABASE statement
       */
      createDb: env.get('BACKUP_DUMP_CREATE_DB', 'true') === 'true',

      /**
       * Clean schema before restore (drop existing tables)
       */
      clean: env.get('BACKUP_DUMP_CLEAN', 'false') === 'true',

      /**
       * Include extension data
       */
      extensions: env.get('BACKUP_DUMP_EXTENSIONS', 'true') === 'true',

      /**
       * Exclude tables from backup (comma-separated)
       */
      excludeTables: env.get('BACKUP_DUMP_EXCLUDE_TABLES', '')
        .split(',')
        .filter(Boolean),

      /**
       * Include only specific tables (comma-separated, empty = all)
       */
      onlyTables: env.get('BACKUP_DUMP_ONLY_TABLES', '')
        .split(',')
        .filter(Boolean),
    },
  },

  /**
   * Media backup configuration
   */
  media: {
    /**
     * Enable automatic media backups
     */
    enabled: env.get('BACKUP_MEDIA_ENABLED', 'true') === 'true',

    /**
     * Backup schedule (cron expression)
     * Default: Weekly on Sunday at 3 AM UTC
     */
    schedule: env.get('BACKUP_MEDIA_SCHEDULE', '0 3 * * 0'),

    /**
     * Retention policy
     */
    retention: {
      /**
       * Number of backups to keep
       */
      count: parseInt(env.get('BACKUP_MEDIA_RETENTION', '4')),
    },

    /**
     * Directories to backup
     */
    directories: [
      'public/uploads',
      'tmp/uploads',
    ],

    /**
     * Compression settings
     */
    compression: {
      enabled: env.get('BACKUP_MEDIA_COMPRESSION_ENABLED', 'true') === 'true',
      level: parseInt(env.get('BACKUP_MEDIA_COMPRESSION_LEVEL', '6')),
    },

    /**
     * Encryption settings
     */
    encryption: {
      enabled: env.get('BACKUP_MEDIA_ENCRYPTION_ENABLED', 'true') === 'true',
      algorithm: env.get('BACKUP_MEDIA_ENCRYPTION_ALGORITHM', 'aes-256-cbc'),
      key: env.get('BACKUP_MEDIA_ENCRYPTION_KEY'),
    },

    /**
     * Backup strategy
     * - 'full': Full backup every time
     * - 'incremental': Incremental backup (only changed files)
     */
    strategy: env.get('BACKUP_MEDIA_STRATEGY', 'full') as 'full' | 'incremental',
  },

  /**
   * Full backup configuration (database + media)
   */
  full: {
    /**
     * Enable automatic full backups
     */
    enabled: env.get('BACKUP_FULL_ENABLED', 'false') === 'true',

    /**
     * Backup schedule (cron expression)
     * Default: Weekly on Sunday at 1 AM UTC
     */
    schedule: env.get('BACKUP_FULL_SCHEDULE', '0 1 * * 0'),

    /**
     * Retention policy
     */
    retention: {
      count: parseInt(env.get('BACKUP_FULL_RETENTION', '4')),
    },
  },

  /**
   * Performance settings
   */
  performance: {
    /**
     * Maximum backup duration before timeout (in seconds)
     */
    timeout: parseInt(env.get('BACKUP_TIMEOUT', '3600')),

    /**
     * Maximum concurrent backups
     */
    maxConcurrent: parseInt(env.get('BACKUP_MAX_CONCURRENT', '1')),

    /**
     * Backup retry attempts
     */
    retryAttempts: parseInt(env.get('BACKUP_RETRY_ATTEMPTS', '3')),

    /**
     * Retry delay (in seconds)
     */
    retryDelay: parseInt(env.get('BACKUP_RETRY_DELAY', '60')),
  },

  /**
   * Monitoring and alerts
   */
  monitoring: {
    /**
     * Enable backup monitoring
     */
    enabled: env.get('BACKUP_MONITORING_ENABLED', 'true') === 'true',

    /**
     * Alert on backup failure
     */
    alertOnFailure: env.get('BACKUP_ALERT_ON_FAILURE', 'true') === 'true',

    /**
     * Alert email addresses (comma-separated)
     */
    alertEmails: env.get('BACKUP_ALERT_EMAILS', '')
      .split(',')
      .filter(Boolean),

    /**
     * Alert webhook URLs (comma-separated)
     */
    alertWebhooks: env.get('BACKUP_ALERT_WEBHOOKS', '')
      .split(',')
      .filter(Boolean),
  },

  /**
   * Recovery Point Objective (RPO)
   * Maximum acceptable data loss measured in time
   */
  rpo: {
    /**
     * RPO in minutes
     */
    targetMinutes: parseInt(env.get('BACKUP_RPO_MINUTES', '60')),
  },

  /**
   * Recovery Time Objective (RTO)
   * Maximum acceptable downtime for recovery
   */
  rto: {
    /**
     * RTO in minutes
     */
    targetMinutes: parseInt(env.get('BACKUP_RTO_MINUTES', '240')),
  },
}
