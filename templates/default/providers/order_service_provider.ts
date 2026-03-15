/**
 * Order Service Provider
 *
 * Registers OrderService and its dependencies in the IoC container.
 * This enables proper dependency injection following SOLID principles.
 */

import { ApplicationContract } from '@adonisjs/core/types'
import OrderRepository from '#repositories/implementations/order_repository'
import CartRepository from '#repositories/implementations/cart_repository'
import OrderService from '#services/order_service'
import OrderItemFactory from '#services/order/order_item_factory'
import OrderStatusManager from '#services/order/order_status_manager'
import OrderNumberGenerator from '#services/order/order_number_generator'

export default class OrderServiceProvider {
  constructor(protected app: ApplicationContract) {}

  /**
   * Register bindings
   */
  public register() {
    // Register repositories
    this.app.container.bind('repositories/OrderRepository', () => {
      return new OrderRepository()
    })

    this.app.container.bind('repositories/CartRepository', () => {
      return new CartRepository()
    })

    // Register order service components
    this.app.container.bind('services/order/OrderItemFactory', () => {
      return new OrderItemFactory()
    })

    this.app.container.bind('services/order/OrderStatusManager', () => {
      return new OrderStatusManager()
    })

    this.app.container.bind('services/order/OrderNumberGenerator', () => {
      return new OrderNumberGenerator()
    })

    // Register OrderService with all dependencies
    this.app.container.bind('services/OrderService', () => {
      const orderRepository = await this.app.container.make('repositories/OrderRepository')
      const cartRepository = await this.app.container.make('repositories/CartRepository')
      const orderItemFactory = await this.app.container.make('services/order/OrderItemFactory')
      const statusManager = await this.app.container.make('services/order/OrderStatusManager')
      const numberGenerator = await this.app.container.make('services/order/OrderNumberGenerator')

      return new OrderService(
        orderRepository,
        cartRepository,
        orderItemFactory,
        statusManager,
        numberGenerator
      )
    })
  }

  /**
   * Bootstrap logic (optional)
   */
  public async boot() {
    // IoC container is ready
  }
}
