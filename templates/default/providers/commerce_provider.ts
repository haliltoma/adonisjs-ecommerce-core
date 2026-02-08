import type { ApplicationService } from '@adonisjs/core/types'
import logger from '@adonisjs/core/services/logger'
import commerceConfig from '#config/commerce'

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
  }

  /**
   * Called when the application is booting
   */
  async boot() {
    // Import services after app is ready
    const ProductService = await import('#services/product_service')
    const OrderService = await import('#services/order_service')
    const CartService = await import('#services/cart_service')
    const CustomerService = await import('#services/customer_service')
    const InventoryService = await import('#services/inventory_service')
    const DiscountService = await import('#services/discount_service')

    // Register services as singletons
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

    logger.info('AdonisCommerce provider booted successfully')
  }

  /**
   * Called when the application is ready
   */
  async ready() {
    // Register scheduled tasks, event listeners, etc.
  }

  /**
   * Called when the application is shutting down
   */
  async shutdown() {
    // Cleanup resources
  }
}

/**
 * Type declarations for the container bindings
 */
declare module '@adonisjs/core/types' {
  interface ContainerBindings {
    'commerce.config': typeof commerceConfig
    'commerce.money': InstanceType<typeof import('#helpers/money').MoneyHelper>
    'commerce.discountEngine': InstanceType<typeof import('#helpers/discount_engine').DiscountEngine>
    'commerce.taxCalculator': InstanceType<typeof import('#helpers/tax_calculator').TaxCalculator>
    'commerce.productService': InstanceType<typeof import('#services/product_service').default>
    'commerce.orderService': InstanceType<typeof import('#services/order_service').default>
    'commerce.cartService': InstanceType<typeof import('#services/cart_service').default>
    'commerce.customerService': InstanceType<typeof import('#services/customer_service').default>
    'commerce.inventoryService': InstanceType<typeof import('#services/inventory_service').default>
    'commerce.discountService': InstanceType<typeof import('#services/discount_service').default>
  }
}
