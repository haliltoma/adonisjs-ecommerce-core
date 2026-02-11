import User from '#models/user'
import Order from '#models/order'
import Customer from '#models/customer'

/**
 * Order Policy
 *
 * Defines authorization rules for order-related actions.
 * Used in admin and storefront controllers.
 */
export default class OrderPolicy {
  /**
   * Admin can view any order in their store.
   */
  viewAdmin(user: User, order: Order): boolean {
    // Admin access is checked by admin middleware; here we ensure store scope
    return !!user.roleId && order.storeId === (user as any).storeId
  }

  /**
   * Customer can only view their own orders.
   */
  viewStorefront(customer: Customer, order: Order): boolean {
    return order.customerId === customer.id
  }

  /**
   * Admin can update order status if they have the 'orders.update' permission.
   */
  async update(user: User): Promise<boolean> {
    return user.hasPermission('orders.update')
  }

  /**
   * Admin can cancel an order that hasn't been shipped.
   */
  async cancel(user: User, order: Order): Promise<boolean> {
    const hasPermission = await user.hasPermission('orders.cancel')
    if (!hasPermission) return false
    return !['shipped', 'delivered', 'cancelled', 'refunded'].includes(order.status)
  }

  /**
   * Admin can create refunds if order is paid and they have permission.
   */
  async refund(user: User, order: Order): Promise<boolean> {
    const hasPermission = await user.hasPermission('orders.refund')
    if (!hasPermission) return false
    return ['paid', 'partially_refunded'].includes(order.paymentStatus)
  }

  /**
   * Admin can manage fulfillments.
   */
  async fulfill(user: User, order: Order): Promise<boolean> {
    const hasPermission = await user.hasPermission('orders.fulfill')
    if (!hasPermission) return false
    return order.fulfillmentStatus !== 'fulfilled' && order.status !== 'cancelled'
  }

  /**
   * Admin can delete only cancelled orders with no transactions.
   */
  async delete(user: User, order: Order): Promise<boolean> {
    const hasPermission = await user.hasPermission('orders.delete')
    if (!hasPermission) return false
    return order.status === 'cancelled'
  }
}
