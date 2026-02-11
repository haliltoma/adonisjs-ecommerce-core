import type { ApplicationService } from '@adonisjs/core/types'
import logger from '@adonisjs/core/services/logger'
import commerceConfig from '#config/commerce'
import { PaymentProvider } from '#contracts/payment_provider'
import { ShippingProvider } from '#contracts/shipping_provider'
import { NotificationManager } from '#contracts/notification_provider'
import { SearchProvider } from '#contracts/search_provider'
import { MediaProvider } from '#contracts/media_provider'
import { CacheProvider } from '#contracts/cache_provider'
import { QueueProvider } from '#contracts/queue_provider'
import { WebhookDispatcher } from '#contracts/webhook_provider'
import PluginManager from '#services/plugin_manager'

/**
 * CommerceProvider
 *
 * Main service provider for AdonisCommerce.
 * Registers all commerce-related services and bindings.
 */
export default class CommerceProvider {
  constructor(protected app: ApplicationService) {}

  /**
   * Register bindings to the container
   */
  register() {
    // Register commerce config
    this.app.container.singleton('commerce.config', () => {
      return commerceConfig
    })

    // Register money helper
    this.app.container.singleton('commerce.money', async () => {
      const { MoneyHelper } = await import('#helpers/money')
      return new MoneyHelper()
    })

    // Register discount engine
    this.app.container.singleton('commerce.discountEngine', async () => {
      const { DiscountEngine } = await import('#helpers/discount_engine')
      return new DiscountEngine()
    })

    // Register tax calculator
    this.app.container.singleton('commerce.taxCalculator', async () => {
      const { TaxCalculator } = await import('#helpers/tax_calculator')
      return new TaxCalculator()
    })

    // Register plugin manager
    this.app.container.singleton('commerce.pluginManager', () => {
      return new PluginManager(this.app)
    })
  }

  /**
   * Called when the application is booting
   */
  async boot() {
    // ── Core Services ────────────────────────────────────────
    const ProductService = await import('#services/product_service')
    const OrderService = await import('#services/order_service')
    const CartService = await import('#services/cart_service')
    const CustomerService = await import('#services/customer_service')
    const InventoryService = await import('#services/inventory_service')
    const DiscountService = await import('#services/discount_service')
    const FulfillmentService = await import('#services/fulfillment_service')
    const CategoryService = await import('#services/category_service')
    const StoreService = await import('#services/store_service')
    const RefundService = await import('#services/refund_service')

    this.app.container.singleton('commerce.productService', () => {
      return new ProductService.default()
    })

    this.app.container.singleton('commerce.orderService', () => {
      return new OrderService.default()
    })

    this.app.container.singleton('commerce.cartService', () => {
      return new CartService.default()
    })

    this.app.container.singleton('commerce.customerService', () => {
      return new CustomerService.default()
    })

    this.app.container.singleton('commerce.inventoryService', () => {
      return new InventoryService.default()
    })

    this.app.container.singleton('commerce.discountService', () => {
      return new DiscountService.default()
    })

    this.app.container.singleton('commerce.fulfillmentService', () => {
      return new FulfillmentService.default()
    })

    this.app.container.singleton('commerce.categoryService', () => {
      return new CategoryService.default()
    })

    this.app.container.singleton('commerce.storeService', () => {
      return new StoreService.default()
    })

    this.app.container.singleton('commerce.refundService', () => {
      return new RefundService.default()
    })

    // ── Provider Contracts (abstract class bindings) ─────────
    // These are bound to concrete implementations.
    // To swap providers, change the import below.

    // Payment Provider (selected via PAYMENT_PROVIDER env or defaults to 'manual')
    this.app.container.singleton(PaymentProvider, async () => {
      const provider = process.env.PAYMENT_PROVIDER || 'manual'

      switch (provider) {
        case 'stripe': {
          const { StripePaymentProvider } = await import('#services/payment/stripe_payment_provider')
          return new StripePaymentProvider()
        }
        case 'iyzico': {
          const { IyzicoPaymentProvider } = await import('#services/payment/iyzico_payment_provider')
          return new IyzicoPaymentProvider()
        }
        default: {
          const { ManualPaymentProvider } = await import('#services/payment/manual_payment_provider')
          return new ManualPaymentProvider()
        }
      }
    })

    // Shipping Provider (selected via SHIPPING_PROVIDER env or defaults to 'flat_rate')
    this.app.container.singleton(ShippingProvider, async () => {
      const provider = process.env.SHIPPING_PROVIDER || 'flat_rate'

      switch (provider) {
        case 'weight_based': {
          const { WeightBasedShippingProvider } = await import('#services/shipping/weight_based_shipping_provider')
          return new WeightBasedShippingProvider()
        }
        case 'zone_based': {
          const { ZoneBasedShippingProvider } = await import('#services/shipping/zone_based_shipping_provider')
          return new ZoneBasedShippingProvider()
        }
        default: {
          const { FlatRateShippingProvider } = await import('#services/shipping/flat_rate_shipping_provider')
          return new FlatRateShippingProvider()
        }
      }
    })

    // Search Provider (selected via SEARCH_PROVIDER env or defaults to 'database')
    this.app.container.singleton(SearchProvider, async () => {
      const provider = commerceConfig.search?.driver || 'database'

      switch (provider) {
        case 'meilisearch': {
          const { MeilisearchSearchProvider } = await import('#services/search/meilisearch_search_provider')
          return new MeilisearchSearchProvider()
        }
        default: {
          const { DatabaseSearchProvider } = await import('#services/search/database_search_provider')
          return new DatabaseSearchProvider()
        }
      }
    })

    // Media Provider
    this.app.container.singleton(MediaProvider, async () => {
      const { LocalMediaProvider } = await import('#services/media/local_media_provider')
      return new LocalMediaProvider()
    })

    // Cache Provider
    this.app.container.singleton(CacheProvider, async () => {
      const { RedisCacheProvider } = await import('#services/cache/redis_cache_provider')
      return new RedisCacheProvider()
    })

    // Notification Manager
    this.app.container.singleton(NotificationManager, async () => {
      const { DatabaseNotificationManager } = await import(
        '#services/notification/database_notification_manager'
      )
      const manager = new DatabaseNotificationManager()

      // Register email provider
      try {
        const { EmailNotificationProvider } = await import(
          '#services/notification/email_notification_provider'
        )
        manager.registerProvider(new EmailNotificationProvider())
      } catch {
        // Email provider is optional — works without @adonisjs/mail
      }

      return manager
    })

    // Queue Provider
    this.app.container.singleton(QueueProvider, async () => {
      if (commerceConfig.queue.driver === 'bullmq') {
        const { BullMQQueueProvider } = await import('#services/queue/bullmq_queue_provider')
        return new BullMQQueueProvider(commerceConfig.queue.connection)
      }
      const { InMemoryQueueProvider } = await import('#services/queue/in_memory_queue_provider')
      return new InMemoryQueueProvider()
    })

    // Webhook Dispatcher
    this.app.container.singleton(WebhookDispatcher, async () => {
      const { HttpWebhookDispatcher } = await import(
        '#services/webhook/http_webhook_dispatcher'
      )
      return new HttpWebhookDispatcher()
    })

    // ── Load Plugins ────────────────────────────────────────
    if (commerceConfig.plugins.length > 0) {
      const pluginManager = await this.app.container.make('commerce.pluginManager') as PluginManager
      await pluginManager.loadAll(commerceConfig.plugins)

      // Register plugin routes
      const router = await this.app.container.make('router')
      await pluginManager.registerRoutes(router)

      // Register plugin events
      const emitter = await this.app.container.make('emitter')
      await pluginManager.registerEvents(emitter)
    }

    logger.info('AdonisCommerce provider booted successfully')
  }

  /**
   * Called when the application is ready
   */
  async ready() {
    // Boot all loaded plugins (notify them that app is ready)
    if (commerceConfig.plugins.length > 0) {
      const pluginManager = await this.app.container.make('commerce.pluginManager') as PluginManager
      await pluginManager.boot()
    }
  }

  /**
   * Called when the application is shutting down
   */
  async shutdown() {
    // Gracefully shutdown plugins
    try {
      const pluginManager = await this.app.container.make('commerce.pluginManager') as PluginManager
      await pluginManager.shutdown()
    } catch {
      // Plugin manager may not be initialized
    }

    // Gracefully shutdown queue workers
    try {
      const queue = await this.app.container.make(QueueProvider)
      await queue.shutdown()
    } catch {
      // Queue may not be initialized
    }
  }
}

/**
 * Type declarations for the container bindings
 */
declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    'commerce.config': typeof commerceConfig
    'commerce.money': InstanceType<typeof import('#helpers/money').MoneyHelper>
    'commerce.discountEngine': InstanceType<
      typeof import('#helpers/discount_engine').DiscountEngine
    >
    'commerce.taxCalculator': InstanceType<typeof import('#helpers/tax_calculator').TaxCalculator>
    'commerce.productService': InstanceType<typeof import('#services/product_service').default>
    'commerce.orderService': InstanceType<typeof import('#services/order_service').default>
    'commerce.cartService': InstanceType<typeof import('#services/cart_service').default>
    'commerce.customerService': InstanceType<typeof import('#services/customer_service').default>
    'commerce.inventoryService': InstanceType<typeof import('#services/inventory_service').default>
    'commerce.discountService': InstanceType<typeof import('#services/discount_service').default>
    'commerce.fulfillmentService': InstanceType<
      typeof import('#services/fulfillment_service').default
    >
    'commerce.categoryService': InstanceType<typeof import('#services/category_service').default>
    'commerce.storeService': InstanceType<typeof import('#services/store_service').default>
    'commerce.refundService': InstanceType<typeof import('#services/refund_service').default>
    'commerce.pluginManager': import('#services/plugin_manager').default
  }
}
