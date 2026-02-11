import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * AdminRoleMiddleware
 *
 * Checks if admin has required role.
 * Usage: router.get('/admin/settings', [SettingsController, 'index']).use(middleware.adminRole({ roles: ['super-admin', 'manager'] }))
 */
export default class AdminRoleMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { roles: string[] }) {
    const { admin, response, request } = ctx

    if (!admin) {
      if (request.accepts(['html', 'json']) === 'json') {
        return response.status(401).json({
          error: 'Unauthorized',
          message: 'Admin authentication required.',
        })
      }
      return response.redirect('/admin/login')
    }

    const adminRoleSlug = admin.role?.slug
    const hasRole = adminRoleSlug && options.roles.includes(adminRoleSlug)

    if (!hasRole) {
      if (request.accepts(['html', 'json']) === 'json') {
        return response.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access this resource.',
        })
      }
      return response.redirect('/admin/dashboard')
    }

    return next()
  }
}
