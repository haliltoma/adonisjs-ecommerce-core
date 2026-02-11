import User from '#models/user'

/**
 * Discount Policy
 *
 * Defines authorization rules for discount/coupon management.
 */
export default class DiscountPolicy {
  async view(user: User): Promise<boolean> {
    return user.hasPermission('discounts.view')
  }

  async create(user: User): Promise<boolean> {
    return user.hasPermission('discounts.create')
  }

  async update(user: User): Promise<boolean> {
    return user.hasPermission('discounts.update')
  }

  async delete(user: User): Promise<boolean> {
    return user.hasPermission('discounts.delete')
  }
}
