import User from '#models/user'
import Customer from '#models/customer'

/**
 * Customer Policy
 *
 * Defines authorization rules for customer-related actions.
 */
export default class CustomerPolicy {
  /**
   * Any admin can view customer list.
   */
  view(_user: User): boolean {
    return true
  }

  /**
   * Admin can update customer details with permission.
   */
  async update(user: User): Promise<boolean> {
    return user.hasPermission('customers.update')
  }

  /**
   * Admin can delete a customer if they have no orders.
   */
  async delete(user: User, customer: Customer): Promise<boolean> {
    const hasPermission = await user.hasPermission('customers.delete')
    if (!hasPermission) return false
    // Load order count to check
    const Order = (await import('#models/order')).default
    const orderCount = await Order.query()
      .where('customerId', customer.id)
      .count('* as total')
      .first()
    return Number(orderCount?.$extras.total || 0) === 0
  }

  /**
   * Admin can manage customer groups.
   */
  async manageGroups(user: User): Promise<boolean> {
    return user.hasPermission('customers.groups')
  }

  /**
   * A storefront customer can only edit their own profile.
   */
  editOwnProfile(customer: Customer, targetCustomerId: string): boolean {
    return customer.id === targetCustomerId
  }
}
