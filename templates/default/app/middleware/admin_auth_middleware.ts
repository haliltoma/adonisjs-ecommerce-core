import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

declare module '@adonisjs/core/http' {
  interface HttpContext {
    admin: User | null
  }
}

/**
 * AdminAuthMiddleware
 *
 * Authenticates admin users for the admin panel.
 * Checks session for admin ID and loads admin user with role/permissions.
 */
export default class AdminAuthMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const { session, response, request } = ctx

    // Try to restore from remember me token if session lacks adminId
    let adminId = session?.get('adminId')

    if (!adminId) {
      try {
        await ctx.auth.use('web').check()
        if (ctx.auth.use('web').isAuthenticated && ctx.auth.use('web').user) {
          adminId = ctx.auth.use('web').user!.id
          session?.put('adminId', adminId)
        }
      } catch {}
    }

    if (!adminId) {
      // For API requests, return JSON error
      if (request.accepts(['html', 'json']) === 'json') {
        return response.status(401).json({
          error: 'Unauthorized',
          message: 'Admin authentication required.',
        })
      }

      // For web requests, redirect to login
      return response.redirect('/admin/login')
    }

    // Load admin with role and permissions
    const admin = await User.query()
      .where('id', adminId)
      .where('isActive', true)
      .preload('role', (roleQuery) => {
        roleQuery.preload('permissions')
      })
      .first()

    if (!admin) {
      // Clear invalid session
      session?.forget('adminId')

      if (request.accepts(['html', 'json']) === 'json') {
        return response.status(401).json({
          error: 'Unauthorized',
          message: 'Admin session expired or invalid.',
        })
      }

      return response.redirect('/admin/login')
    }

    // Attach admin to context
    ctx.admin = admin

    return next()
  }
}

/**
 * AdminRoleMiddleware
 *
 * Checks if admin has required role.
 * Usage: router.get('/admin/settings', [SettingsController, 'index']).use(middleware.adminRole(['super-admin', 'manager']))
 */
export class AdminRoleMiddleware {
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

    // Check if admin has any of the required roles
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

/**
 * AdminPermissionMiddleware
 *
 * Checks if admin has required permission.
 * Usage: router.delete('/admin/products/:id', [ProductsController, 'destroy']).use(middleware.adminPermission(['products.delete']))
 */
export class AdminPermissionMiddleware {
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

    // Collect all permissions from admin's role
    const adminPermissions = admin.role?.permissions?.map((p) => p.slug) || []

    // Check if admin has any of the required permissions
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
