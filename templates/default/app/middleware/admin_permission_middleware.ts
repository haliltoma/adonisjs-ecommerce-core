import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * AdminPermissionMiddleware
 *
 * Checks if admin has required permission.
 * Usage: router.delete('/admin/products/:id', [ProductsController, 'destroy']).use(middleware.adminPermission({ permissions: ['products.delete'] }))
 */
export default class AdminPermissionMiddleware {
  async handle(ctx: HttpContext, next: NextFn, options: { permissions: string[] }) {
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

    const adminPermissions = admin.role?.permissions?.map((p) => p.slug) || []
    const hasPermission = options.permissions.some((perm) => adminPermissions.includes(perm))

    if (!hasPermission) {
      if (request.accepts(['html', 'json']) === 'json') {
        return response.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to perform this action.',
        })
      }
      return response.redirect('/admin/dashboard')
    }

    return next()
  }
}
