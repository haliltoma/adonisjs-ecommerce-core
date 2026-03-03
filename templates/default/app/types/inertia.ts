/**
 * Inertia type augmentations for loose typing of page components
 * This allows any page name to be used with inertia.render()
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyProps = any

declare module '@adonisjs/inertia/types' {
  /**
   * Loosely typed InertiaPages interface
   * Allows any string as a page name with any props
   */
  export interface InertiaPages extends Record<string, AnyProps> {}
}
