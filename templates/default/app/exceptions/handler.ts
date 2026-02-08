import app from '@adonisjs/core/services/app'
import { HttpContext, ExceptionHandler } from '@adonisjs/core/http'
import type { StatusPageRange, StatusPageRenderer } from '@adonisjs/core/types/http'

export default class HttpExceptionHandler extends ExceptionHandler {
  /**
   * In debug mode, the exception handler will display verbose errors
   * with pretty printed stack traces.
   */
  protected debug = !app.inProduction

  /**
   * Status pages are used to display a custom HTML pages for certain error
   * codes. You might want to enable them in production only, but feel
   * free to enable them in development as well.
   */
  protected renderStatusPages = app.inProduction

  /**
   * Status pages is a collection of error code range and a callback
   * to return the HTML contents to send as a response.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {
    '404': (error, { inertia }) => {
      return inertia.render('errors/NotFound', { error: error.message })
    },
    '500..599': (error, { inertia }) => {
      return inertia.render('errors/ServerError', { error: error.message })
    },
  }

  /**
   * The method is used for handling errors and returning
   * response to the client
   */
  async handle(error: unknown, ctx: HttpContext) {
    const { request, response } = ctx

    // Handle API errors with JSON responses
    if (request.url().startsWith('/api')) {
      return this.handleApiError(error, ctx)
    }

    return super.handle(error, ctx)
  }

  /**
   * Handle API errors with JSON responses
   */
  protected handleApiError(error: unknown, ctx: HttpContext) {
    const { response } = ctx

    if (error instanceof Error) {
      const status = (error as any).status || 500
      const code = (error as any).code || 'E_INTERNAL_ERROR'

      // Don't expose internal errors in production
      const message =
        app.inProduction && status >= 500 ? 'Internal server error' : error.message

      return response.status(status).json({
        error: {
          code,
          message,
          ...(this.debug &&
            status >= 500 && {
              stack: error.stack?.split('\n').slice(0, 10),
            }),
        },
      })
    }

    return response.status(500).json({
      error: {
        code: 'E_UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      },
    })
  }

  /**
   * The method is used to report error to the logging service or
   * the a third party error monitoring service.
   *
   * @note You should not attempt to send a response from this method.
   */
  async report(error: unknown, ctx: HttpContext) {
    // Log server errors
    if (error instanceof Error) {
      const status = (error as any).status || 500

      if (status >= 500) {
        console.error('[Error]', {
          message: error.message,
          code: (error as any).code,
          status,
          url: ctx.request.url(),
          method: ctx.request.method(),
          ip: ctx.request.ip(),
          timestamp: new Date().toISOString(),
        })
      }
    }

    return super.report(error, ctx)
  }
}
