/**
 * Router type augmentations for loose typing of route names
 * This allows any route name to be used with toRoute()
 */

declare module '@adonisjs/core/http' {
  export interface Redirect {
    /**
     * Redirect to a named route with optional parameters
     */
    toRoute(
      routeName: string,
      params?: Record<string, unknown> | unknown[],
      options?: { qs?: Record<string, unknown> }
    ): void
  }
}
