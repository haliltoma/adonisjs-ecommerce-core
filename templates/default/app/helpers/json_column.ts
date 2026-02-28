/**
 * Column options for PostgreSQL JSON/JSONB columns.
 *
 * The `pg` driver sends JavaScript objects/arrays as PostgreSQL array literals
 * instead of JSON strings, causing "invalid input syntax for type json" errors.
 * This helper adds prepare/consume hooks to properly serialize/deserialize.
 *
 * Usage:
 *   @column(jsonColumn())
 *   declare metadata: Record<string, unknown>
 *
 *   @column(jsonColumn({ columnName: 'settings' }))
 *   declare config: Record<string, unknown>
 */
export function jsonColumn(options?: { columnName?: string; serializeAs?: string | null }) {
  return {
    ...options,
    prepare: (value: unknown) => (value != null ? JSON.stringify(value) : null),
    consume: (value: unknown) => {
      if (typeof value === 'string') {
        try {
          return JSON.parse(value)
        } catch {
          return value
        }
      }
      return value
    },
  }
}
