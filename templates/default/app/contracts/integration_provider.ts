/**
 * Integration Provider Contract
 *
 * Defines the interface for external service integrations.
 * All integrations (payment, shipping, CRM, etc.) implement this
 * base contract for consistent management.
 */

/**
 * Integration category types
 */
export type IntegrationCategory =
  | 'payment'
  | 'shipping'
  | 'accounting'
  | 'crm'
  | 'erp'
  | 'email_marketing'
  | 'analytics'
  | 'marketplace'
  | 'storage'
  | 'search'
  | 'sms'
  | 'cdn'

/**
 * Configuration field definition for admin UI
 */
export interface ConfigField {
  key: string
  label: string
  type: 'string' | 'password' | 'boolean' | 'select' | 'number'
  required: boolean
  description?: string
  options?: { label: string; value: string }[]
  default?: unknown
}

/**
 * Sync result returned by integration operations
 */
export interface SyncResult {
  success: boolean
  synced: number
  failed: number
  errors?: string[]
}

/**
 * Integration status
 */
export interface IntegrationStatus {
  connected: boolean
  lastSyncAt?: string | null
  message?: string
}

/**
 * Abstract base class for all integration providers
 */
export abstract class IntegrationProvider {
  /** Unique provider identifier (e.g., 'stripe', 'mailchimp') */
  abstract readonly name: string

  /** Human-readable display name */
  abstract readonly displayName: string

  /** Integration category */
  abstract readonly category: IntegrationCategory

  /** Description of what this integration does */
  abstract readonly description: string

  /** Logo URL or icon name */
  readonly icon?: string

  /** Return the configuration schema (fields required from admin) */
  abstract getConfigSchema(): ConfigField[]

  /** Validate the provided configuration */
  abstract validateConfig(config: Record<string, unknown>): boolean

  /** Test the connection with the external service */
  abstract testConnection(config: Record<string, unknown>): Promise<IntegrationStatus>

  /** Handle incoming webhook from the external service */
  async handleWebhook(
    _payload: Record<string, unknown>,
    _headers: Record<string, string>
  ): Promise<void> {
    // Override in subclass if needed
  }
}
