/**
 * IntegrationService
 *
 * Manages external integrations: registration, configuration storage,
 * connection testing, and provider lifecycle.
 */

import Setting from '#models/setting'
import {
  IntegrationProvider,
  type IntegrationCategory,
  type IntegrationStatus,
} from '#contracts/integration_provider'
import { randomUUID } from 'node:crypto'

interface IntegrationInfo {
  name: string
  displayName: string
  category: IntegrationCategory
  description: string
  icon?: string
  isEnabled: boolean
  isConnected: boolean
  lastSyncAt?: string | null
}

export default class IntegrationService {
  private providers: Map<string, IntegrationProvider> = new Map()

  /**
   * Register an integration provider
   */
  register(provider: IntegrationProvider): void {
    this.providers.set(provider.name, provider)
  }

  /**
   * Get a registered provider by name
   */
  getProvider(name: string): IntegrationProvider | undefined {
    return this.providers.get(name)
  }

  /**
   * Get all registered providers
   */
  getAllProviders(): IntegrationProvider[] {
    return Array.from(this.providers.values())
  }

  /**
   * Get providers by category
   */
  getProvidersByCategory(category: IntegrationCategory): IntegrationProvider[] {
    return Array.from(this.providers.values()).filter((p) => p.category === category)
  }

  /**
   * Get integration configuration from settings
   */
  async getConfig(storeId: string, providerName: string): Promise<Record<string, unknown>> {
    const setting = await Setting.query()
      .where('storeId', storeId)
      .where('group', 'integration')
      .where('key', `${providerName}.config`)
      .first()

    if (!setting) return {}

    const value = setting.getTypedValue()
    return (typeof value === 'object' && value !== null ? value : {}) as Record<string, unknown>
  }

  /**
   * Save integration configuration
   */
  async saveConfig(
    storeId: string,
    providerName: string,
    config: Record<string, unknown>
  ): Promise<void> {
    const existing = await Setting.query()
      .where('storeId', storeId)
      .where('group', 'integration')
      .where('key', `${providerName}.config`)
      .first()

    if (existing) {
      existing.value = JSON.stringify(config)
      await existing.save()
    } else {
      await Setting.create({
        id: randomUUID(),
        storeId,
        group: 'integration',
        key: `${providerName}.config`,
        value: JSON.stringify(config),
        type: 'json',
        isPublic: false,
      })
    }
  }

  /**
   * Enable/disable an integration
   */
  async setEnabled(storeId: string, providerName: string, enabled: boolean): Promise<void> {
    const key = `${providerName}.enabled`
    const existing = await Setting.query()
      .where('storeId', storeId)
      .where('group', 'integration')
      .where('key', key)
      .first()

    if (existing) {
      existing.value = String(enabled)
      await existing.save()
    } else {
      await Setting.create({
        id: randomUUID(),
        storeId,
        group: 'integration',
        key,
        value: String(enabled),
        type: 'boolean',
        isPublic: false,
      })
    }
  }

  /**
   * Check if an integration is enabled
   */
  async isEnabled(storeId: string, providerName: string): Promise<boolean> {
    const setting = await Setting.query()
      .where('storeId', storeId)
      .where('group', 'integration')
      .where('key', `${providerName}.enabled`)
      .first()

    return setting?.getTypedValue() === true || setting?.value === 'true'
  }

  /**
   * Test connection for an integration
   */
  async testConnection(storeId: string, providerName: string): Promise<IntegrationStatus> {
    const provider = this.providers.get(providerName)
    if (!provider) {
      return { connected: false, message: 'Provider not found' }
    }

    const config = await this.getConfig(storeId, providerName)
    if (!provider.validateConfig(config)) {
      return { connected: false, message: 'Invalid configuration' }
    }

    return provider.testConnection(config)
  }

  /**
   * Get summary of all integrations for a store
   */
  async getIntegrationList(storeId: string): Promise<IntegrationInfo[]> {
    const result: IntegrationInfo[] = []

    for (const provider of this.providers.values()) {
      const enabled = await this.isEnabled(storeId, provider.name)
      let connected = false
      let lastSyncAt: string | null = null

      if (enabled) {
        try {
          const status = await this.testConnection(storeId, provider.name)
          connected = status.connected
          lastSyncAt = status.lastSyncAt || null
        } catch {
          connected = false
        }
      }

      result.push({
        name: provider.name,
        displayName: provider.displayName,
        category: provider.category,
        description: provider.description,
        icon: provider.icon,
        isEnabled: enabled,
        isConnected: connected,
        lastSyncAt,
      })
    }

    return result
  }
}
