/**
 * Repository Exports
 *
 * Centralized export point for all repositories.
 * This makes it easy to import repositories throughout the application.
 */

// Repository Interfaces
export { default as IOrderRepository } from './interfaces/i_order_repository'
export { default as ICartRepository } from './interfaces/i_cart_repository'
export { default as IProductRepository } from './interfaces/i_product_repository'
export { default as ICustomerRepository } from './interfaces/i_customer_repository'
export { default as IInventoryRepository } from './interfaces/i_inventory_repository'

// Repository Implementations
export { default as OrderRepository } from './implementations/order_repository'
export { default as CartRepository } from './implementations/cart_repository'
export { default as ProductRepository } from './implementations/product_repository'
export { default as CustomerRepository } from './implementations/customer_repository'
export { default as InventoryRepository } from './implementations/inventory_repository'
