/**
 * AdonisCommerce Plugin Contract
 *
 * Defines the interface that all plugins must implement.
 * Plugins extend the commerce platform with additional functionality
 * including routes, services, admin UI pages, and event listeners.
 */

import type { ApplicationService } from '@adonisjs/core/types'
import type { Router } from '@adonisjs/core/http'

/**
 * Plugin metadata
 */
export interface PluginMeta {
  /** Unique plugin identifier (e.g., '@adoniscommerce-plugin/blog') */
  name: string
  /** Semantic version string */
  version: string
  /** Short description of what the plugin does */
  description?: string
  /** Plugin author */
  author?: string
  /** Minimum AdonisCommerce version required */
  minCommerceVersion?: string
}

/**
 * Admin sidebar menu item added by a plugin
 */
export interface PluginAdminMenuItem {
  /** Display label */
  label: string
  /** Route path (e.g., '/admin/blog') */
  path: string
  /** Lucide icon name (e.g., 'BookOpen') */
  icon?: string
  /** Sort order in sidebar */
  order?: number
  /** Required permission slug to see this item */
  permission?: string
}

/**
 * Commerce hook definitions
 */
export type CommerceHookName =
  | 'beforeCartCalculate'
  | 'afterCartCalculate'
  | 'afterOrderCreate'
  | 'beforePaymentProcess'
  | 'afterPaymentProcess'
  | 'afterProductSave'
  | 'beforeCheckoutComplete'
  | 'afterCheckoutComplete'

export type CommerceHookHandler = (...args: unknown[]) => Promise<void> | void

/**
 * Abstract base class for AdonisCommerce plugins.
 *
 * Plugins must extend this class and implement at least the `register` method.
 * Other lifecycle methods are optional.
 */
export abstract class CommercePlugin {
  /**
   * Plugin metadata - must be provided by every plugin
   */
  abstract readonly meta: PluginMeta

  /**
   * Called when the plugin is registered.
   * Use this to bind services to the container.
   */
  abstract register(app: ApplicationService): void | Promise<void>

  /**
   * Called after all plugins are registered.
   * Use this to register routes.
   */
  routes?(_router: Router): void | Promise<void>

  /**
   * Called to register event listeners.
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  events?(_emitter: any): void | Promise<void>

  /**
   * Return admin sidebar menu items.
   */
  adminMenuItems?(): PluginAdminMenuItem[]

  /**
   * Return commerce hook registrations.
   */
  hooks?(): Partial<Record<CommerceHookName, CommerceHookHandler>>

  /**
   * Called when the application is fully ready.
   */
  ready?(_app: ApplicationService): void | Promise<void>

  /**
   * Called during application shutdown.
   * Use this for cleanup.
   */
  shutdown?(): void | Promise<void>
}
