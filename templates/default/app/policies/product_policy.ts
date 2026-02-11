import User from '#models/user'
import Product from '#models/product'

/**
 * Product Policy
 *
 * Defines authorization rules for product-related actions.
 */
export default class ProductPolicy {
  /**
   * Any admin can view products.
   */
  view(_user: User): boolean {
    return true
  }

  /**
   * Admin can create products with the products.create permission.
   */
  async create(user: User): Promise<boolean> {
    return user.hasPermission('products.create')
  }

  /**
   * Admin can update products with the products.update permission.
   */
  async update(user: User): Promise<boolean> {
    return user.hasPermission('products.update')
  }

  /**
   * Admin can delete products (draft only) with the products.delete permission.
   */
  async delete(user: User, product: Product): Promise<boolean> {
    const hasPermission = await user.hasPermission('products.delete')
    if (!hasPermission) return false
    return product.status === 'draft'
  }

  /**
   * Admin can publish a draft product.
   */
  async publish(user: User, product: Product): Promise<boolean> {
    const hasPermission = await user.hasPermission('products.publish')
    if (!hasPermission) return false
    return product.status === 'draft'
  }

  /**
   * Admin can archive an active product.
   */
  async archive(user: User, product: Product): Promise<boolean> {
    const hasPermission = await user.hasPermission('products.update')
    if (!hasPermission) return false
    return product.status === 'active'
  }

  /**
   * Admin can manage product inventory.
   */
  async manageInventory(user: User): Promise<boolean> {
    return user.hasPermission('inventory.update')
  }
}
