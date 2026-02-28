/**
 * PluginManager
 *
 * Manages the lifecycle of AdonisCommerce plugins.
 * Handles loading, registration, boot, and shutdown of plugins.
 */

import type { ApplicationService } from '@adonisjs/core/types'
import type { Router } from '@adonisjs/core/http'
import logger from '@adonisjs/core/services/logger'
import {
  CommercePlugin,
  type CommerceHookName,
  type CommerceHookHandler,
  type PluginAdminMenuItem,
} from '#contracts/plugin'

export default class PluginManager {
  private plugins: Map<string, CommercePlugin> = new Map()
  private hooks: Map<CommerceHookName, CommerceHookHandler[]> = new Map()
  private adminMenuItems: PluginAdminMenuItem[] = []
  private booted = false

  constructor(private app: ApplicationService) {}

  /**
   * Load and register all configured plugins
   */
  async loadAll(pluginConfigs: string[]): Promise<void> {
    for (const pluginPath of pluginConfigs) {
      await this.load(pluginPath)
    }
  }

  /**
   * Load a single plugin by its module path or package name
   */
  async load(pluginPath: string): Promise<void> {
    try {
      const pluginModule = await import(pluginPath)
      const PluginClass = pluginModule.default || pluginModule

      if (!PluginClass || typeof PluginClass !== 'function') {
        logger.warn(`Plugin "${pluginPath}" does not export a valid plugin class, skipping`)
        return
      }

      const plugin: CommercePlugin = new PluginClass()

      if (!plugin.meta?.name) {
        logger.warn(`Plugin "${pluginPath}" does not define meta.name, skipping`)
        return
      }

      if (this.plugins.has(plugin.meta.name)) {
        logger.warn(`Plugin "${plugin.meta.name}" is already loaded, skipping duplicate`)
        return
      }

      // Register the plugin
      await plugin.register(this.app)
      this.plugins.set(plugin.meta.name, plugin)

      // Collect admin menu items
      if (plugin.adminMenuItems) {
        const items = plugin.adminMenuItems()
        this.adminMenuItems.push(...items)
      }

      // Collect hooks
      if (plugin.hooks) {
        const hookMap = plugin.hooks()
        for (const [hookName, handler] of Object.entries(hookMap)) {
          if (handler) {
            const existing = this.hooks.get(hookName as CommerceHookName) || []
            existing.push(handler)
            this.hooks.set(hookName as CommerceHookName, existing)
          }
        }
      }

      logger.info(`Plugin "${plugin.meta.name}" v${plugin.meta.version} loaded`)
    } catch (error: unknown) {
      logger.error(`Failed to load plugin "${pluginPath}": ${(error as Error).message}`)
    }
  }

  /**
   * Register routes for all loaded plugins
   */
  async registerRoutes(router: Router): Promise<void> {
    for (const [name, plugin] of this.plugins) {
      if (plugin.routes) {
        try {
          await plugin.routes(router)
          logger.info(`Plugin "${name}" routes registered`)
        } catch (error: unknown) {
          logger.error(`Failed to register routes for plugin "${name}": ${(error as Error).message}`)
        }
      }
    }
  }

  /**
   * Register event listeners for all loaded plugins
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async registerEvents(emitter: any): Promise<void> {
    for (const [name, plugin] of this.plugins) {
      if (plugin.events) {
        try {
          await plugin.events(emitter)
          logger.info(`Plugin "${name}" events registered`)
        } catch (error: unknown) {
          logger.error(`Failed to register events for plugin "${name}": ${(error as Error).message}`)
        }
      }
    }
  }

  /**
   * Notify all plugins that the application is ready
   */
  async boot(): Promise<void> {
    if (this.booted) return

    for (const [name, plugin] of this.plugins) {
      if (plugin.ready) {
        try {
          await plugin.ready(this.app)
        } catch (error: unknown) {
          logger.error(`Plugin "${name}" ready hook failed: ${(error as Error).message}`)
        }
      }
    }

    // Sort admin menu items by order
    this.adminMenuItems.sort((a, b) => (a.order ?? 100) - (b.order ?? 100))
    this.booted = true
  }

  /**
   * Execute a commerce hook
   */
  async executeHook(hookName: CommerceHookName, ...args: unknown[]): Promise<void> {
    const handlers = this.hooks.get(hookName)
    if (!handlers?.length) return

    for (const handler of handlers) {
      try {
        await handler(...args)
      } catch (error: unknown) {
        logger.error(`Hook "${hookName}" handler failed: ${(error as Error).message}`)
      }
    }
  }

  /**
   * Get all admin menu items from plugins
   */
  getAdminMenuItems(): PluginAdminMenuItem[] {
    return [...this.adminMenuItems]
  }

  /**
   * Get a loaded plugin by name
   */
  getPlugin(name: string): CommercePlugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * Get all loaded plugin names
   */
  getLoadedPlugins(): string[] {
    return Array.from(this.plugins.keys())
  }

  /**
   * Check if a plugin is loaded
   */
  isLoaded(name: string): boolean {
    return this.plugins.has(name)
  }

  /**
   * Shutdown all plugins gracefully
   */
  async shutdown(): Promise<void> {
    for (const [name, plugin] of this.plugins) {
      if (plugin.shutdown) {
        try {
          await plugin.shutdown()
        } catch (error: unknown) {
          logger.error(`Plugin "${name}" shutdown failed: ${(error as Error).message}`)
        }
      }
    }

    this.plugins.clear()
    this.hooks.clear()
    this.adminMenuItems = []
    this.booted = false
  }
}
