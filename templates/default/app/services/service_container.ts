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
import OrderItemFactory from '#services/order/order_item_factory'
import OrderStatusManager from '#services/order/order_status_manager'
import OrderNumberGenerator from '#services/order/order_number_generator'

/**
 * Service Container Singleton
 */
class ServiceContainer {
  private static instance: ServiceContainer
  private services: Map<string, any> = new Map()

  private constructor() {
    this.registerServices()
  }

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer()
    }
    return ServiceContainer.instance
  }

  /**
   * Register all services
   */
  private registerServices() {
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
  }

  /**
   * Get service by name
   */
  get<T>(serviceName: string): T {
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
    return this.services.has(serviceName)
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
export const useOrderRepository = (): OrderRepository => useService<OrderRepository>('OrderRepository')
export const useCartRepository = (): CartRepository => useService<CartRepository>('CartRepository')
export const useProductRepository = (): ProductRepository =>
  useService<ProductRepository>('ProductRepository')
export const useCustomerRepository = (): CustomerRepository =>
  useService<CustomerRepository>('CustomerRepository')
export const useInventoryRepository = (): InventoryRepository =>
  useService<InventoryRepository>('InventoryRepository')
