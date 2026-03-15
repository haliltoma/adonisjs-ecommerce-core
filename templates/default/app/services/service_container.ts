/**
 * Service Container
 *
 * Simple IoC container for managing service dependencies.
 * This enables proper dependency injection following SOLID principles.
 */

import OrderRepository from '#repositories/implementations/order_repository'
import CartRepository from '#repositories/implementations/cart_repository'
import ProductRepository from '#repositories/implementations/product_repository'
import CustomerRepository from '#repositories/implementations/customer_repository'
import InventoryRepository from '#repositories/implementations/inventory_repository'
import OrderService from '#services/order_service'
import CartService from '#services/cart_service'
import OrderItemFactory from '#services/order/order_item_factory'
import OrderStatusManager from '#services/order/order_status_manager'
import OrderNumberGenerator from '#services/order/order_number_generator'
import CartTotalsCalculator from '#services/cart/cart_totals_calculator'
import CartDiscountApplicator from '#services/cart/cart_discount_applicator'
import CartTaxCalculator from '#services/cart/cart_tax_calculator'
import CartItemManager from '#services/cart/cart_item_manager'
import CartValidator from '#services/cart/cart_validator'

/**
 * Service Container Singleton
 */
class ServiceContainer {
  private static instance: ServiceContainer
  private services: Map<string, any> = new Map()
  private initialized = false

  private constructor() {}

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer()
    }
    return ServiceContainer.instance
  }

  /**
   * Initialize all services (lazy initialization)
   */
  private ensureInitialized() {
    if (this.initialized) return

    // Repositories (Singleton)
    this.services.set('OrderRepository', new OrderRepository())
    this.services.set('CartRepository', new CartRepository())
    this.services.set('ProductRepository', new ProductRepository())
    this.services.set('CustomerRepository', new CustomerRepository())
    this.services.set('InventoryRepository', new InventoryRepository())

    // Order Service Components
    this.services.set('OrderItemFactory', new OrderItemFactory())
    this.services.set('OrderStatusManager', new OrderStatusManager())
    this.services.set('OrderNumberGenerator', new OrderNumberGenerator())

    // Cart Service Components
    this.services.set('CartTotalsCalculator', new CartTotalsCalculator())
    this.services.set('CartDiscountApplicator', new CartDiscountApplicator())
    this.services.set('CartTaxCalculator', new CartTaxCalculator())
    this.services.set('CartItemManager', new CartItemManager())
    this.services.set('CartValidator', new CartValidator())

    // Order Service (with dependencies)
    const orderRepository = this.services.get('OrderRepository')
    const cartRepository = this.services.get('CartRepository')
    const orderItemFactory = this.services.get('OrderItemFactory')
    const statusManager = this.services.get('OrderStatusManager')
    const numberGenerator = this.services.get('OrderNumberGenerator')

    this.services.set(
      'OrderService',
      new OrderService(
        orderRepository,
        cartRepository,
        orderItemFactory,
        statusManager,
        numberGenerator
      )
    )

    // Cart Service (with dependencies)
    const totalsCalculator = this.services.get('CartTotalsCalculator')
    const discountApplicator = this.services.get('CartDiscountApplicator')
    const taxCalculator = this.services.get('CartTaxCalculator')
    const itemManager = this.services.get('CartItemManager')
    const validator = this.services.get('CartValidator')

    // Note: DiscountService will be set later if needed
    this.services.set(
      'CartService',
      new CartService(
        cartRepository,
        this.services.get('ProductRepository'),
        totalsCalculator,
        discountApplicator,
        taxCalculator,
        itemManager,
        validator,
        null // DiscountService (optional)
      )
    )

    this.initialized = true
  }

  /**
   * Get service by name
   */
  get<T>(serviceName: string): T {
    this.ensureInitialized()

    const service = this.services.get(serviceName)

    if (!service) {
      throw new Error(`Service not found: ${serviceName}`)
    }

    return service as T
  }

  /**
   * Register a service
   */
  register(serviceName: string, instance: any) {
    this.services.set(serviceName, instance)
  }

  /**
   * Check if service exists
   */
  has(serviceName: string): boolean {
    this.ensureInitialized()
    return this.services.has(serviceName)
  }

  /**
   * Reset container (useful for testing)
   */
  reset() {
    this.services.clear()
    this.initialized = false
  }
}

/**
 * Export singleton instance getter
 */
export const getServiceContainer = () => ServiceContainer.getInstance()

/**
 * Convenience function to get a service
 */
export const useService = <T>(serviceName: string): T => {
  return getServiceContainer().get<T>(serviceName)
}

/**
 * Export specific service getters for type safety
 */
export const useOrderService = (): OrderService => useService<OrderService>('OrderService')
export const useCartService = (): CartService => useService<CartService>('CartService')
export const useOrderRepository = (): OrderRepository => useService<OrderRepository>('OrderRepository')
export const useCartRepository = (): CartRepository => useService<CartRepository>('CartRepository')
export const useProductRepository = (): ProductRepository =>
  useService<ProductRepository>('ProductRepository')
export const useCustomerRepository = (): CustomerRepository =>
  useService<CustomerRepository>('CustomerRepository')
export const useInventoryRepository = (): InventoryRepository =>
  useService<InventoryRepository>('InventoryRepository')
