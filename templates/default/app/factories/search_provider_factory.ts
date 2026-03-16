/**
 * Search Provider Factory
 *
 * Creates search provider instances based on configuration.
 * Implements Open/Closed Principle: New providers can be added without modifying existing code.
 *
 * OCP: Open for extension (add new providers), closed for modification
 */

import env from '#start/env'
import { SearchProvider } from '#contracts/search_provider'

// Available search providers
import { MeilisearchSearchProvider as MeiliSearchProvider } from '#services/search/meilisearch_search_provider'
import { DatabaseSearchProvider } from '#services/search/database_search_provider'

/**
 * Search Provider Factory
 */
export default class SearchProviderFactory {
  private static providers: Map<string, new () => SearchProvider> = new Map()

  /**
   * Register a search provider
   */
  static registerProvider(name: string, providerClass: new () => SearchProvider): void {
    this.providers.set(name.toLowerCase(), providerClass)
  }

  /**
   * Get search provider by name
   */
  static getProvider(name?: string): SearchProvider {
    const providerName = (name || env.get('SEARCH_PROVIDER', 'database')).toLowerCase()

    const ProviderClass = this.providers.get(providerName)

    if (!ProviderClass) {
      // Fallback to database search
      return new DatabaseSearchProvider()
    }

    return new ProviderClass()
  }

  /**
   * Check if provider is registered
   */
  static hasProvider(name: string): boolean {
    return this.providers.has(name.toLowerCase())
  }

  /**
   * Get all registered provider names
   */
  static getRegisteredProviders(): string[] {
    return Array.from(this.providers.keys())
  }

  /**
   * Get provider with fallback
   */
  static getProviderWithFallback(preferredProvider?: string): SearchProvider {
    try {
      return this.getProvider(preferredProvider)
    } catch (error) {
      // If preferred provider fails, fallback to database
      console.warn(`Search provider "${preferredProvider}" failed, falling back to database`)
      return new DatabaseSearchProvider()
    }
  }
}

/**
 * Register default providers
 */
SearchProviderFactory.registerProvider('meilisearch', MeiliSearchProvider)
SearchProviderFactory.registerProvider('database', DatabaseSearchProvider)
SearchProviderFactory.registerProvider('algolia', DatabaseSearchProvider) // Algolia would be registered here
