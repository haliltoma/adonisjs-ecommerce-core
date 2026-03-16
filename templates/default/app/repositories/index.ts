/**
 * Repository Exports
 *
 * Centralized export point for all repositories.
 * This makes it easy to import repositories throughout the application.
 */

// Repository Interfaces
export { default as IOrderRepository } from './interfaces/i_order_repository.js'
export { default as ICartRepository } from './interfaces/i_cart_repository.js'
export { default as IProductRepository } from './interfaces/i_product_repository.js'
export { default as ICustomerRepository } from './interfaces/i_customer_repository.js'
export { default as IInventoryRepository } from './interfaces/i_inventory_repository.js'

// Repository Implementations
export { default as OrderRepository } from './implementations/order_repository.js'
export { default as CartRepository } from './implementations/cart_repository.js'
export { default as ProductRepository } from './implementations/product_repository.js'
export { default as CustomerRepository } from './implementations/customer_repository.js'
export { default as InventoryRepository } from './implementations/inventory_repository.js'
