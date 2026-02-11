/**
 * Policy Index
 *
 * Exports all policy classes and a convenience helper.
 * Policies provide resource-level authorization checks
 * that complement the route-level RBAC middleware.
 *
 * Usage in controllers:
 *   import { policies } from '#policies'
 *
 *   const canRefund = await policies.order.refund(admin, order)
 *   if (!canRefund) throw new ForbiddenException('Not authorized')
 */
import OrderPolicy from './order_policy.js'
import ProductPolicy from './product_policy.js'
import CustomerPolicy from './customer_policy.js'
import DiscountPolicy from './discount_policy.js'
import SettingsPolicy from './settings_policy.js'

export const policies = {
  order: new OrderPolicy(),
  product: new ProductPolicy(),
  customer: new CustomerPolicy(),
  discount: new DiscountPolicy(),
  settings: new SettingsPolicy(),
}

export { OrderPolicy, ProductPolicy, CustomerPolicy, DiscountPolicy, SettingsPolicy }
