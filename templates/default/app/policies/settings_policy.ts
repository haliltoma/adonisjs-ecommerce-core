import User from '#models/user'

/**
 * Settings Policy
 *
 * Defines authorization rules for store settings and admin management.
 */
export default class SettingsPolicy {
  /**
   * Only super-admin and admin roles can view settings.
   */
  async view(user: User): Promise<boolean> {
    return user.hasPermission('settings.view')
  }

  /**
   * Only super-admin can update store settings.
   */
  async update(user: User): Promise<boolean> {
    return user.hasPermission('settings.update')
  }

  /**
   * Only super-admin can manage users and roles.
   */
  async manageUsers(user: User): Promise<boolean> {
    return user.hasPermission('users.manage')
  }

  /**
   * Only super-admin can manage API keys.
   */
  async manageApiKeys(user: User): Promise<boolean> {
    return user.hasPermission('api_keys.manage')
  }

  /**
   * Only super-admin can manage payment provider config.
   */
  async managePayments(user: User): Promise<boolean> {
    return user.hasPermission('settings.payments')
  }

  /**
   * Only super-admin can manage webhook endpoints.
   */
  async manageWebhooks(user: User): Promise<boolean> {
    return user.hasPermission('settings.webhooks')
  }
}
