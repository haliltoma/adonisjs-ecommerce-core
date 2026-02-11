/**
 * Cache Provider Contract
 *
 * Abstract class for cache implementations.
 * Providers: Redis, In-Memory, etc.
 */
export abstract class CacheProvider {
  /**
   * Get a value from cache
   */
  abstract get<T = unknown>(key: string): Promise<T | null>

  /**
   * Set a value in cache with optional TTL (seconds)
   */
  abstract set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void>

  /**
   * Check if a key exists in cache
   */
  abstract has(key: string): Promise<boolean>

  /**
   * Delete a key from cache
   */
  abstract delete(key: string): Promise<boolean>

  /**
   * Delete all keys matching a pattern
   */
  abstract deletePattern(pattern: string): Promise<number>

  /**
   * Get or set - returns cached value or computes and caches it
   */
  abstract remember<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T>

  /**
   * Increment a numeric value
   */
  abstract increment(key: string, amount?: number): Promise<number>

  /**
   * Decrement a numeric value
   */
  abstract decrement(key: string, amount?: number): Promise<number>

  /**
   * Flush all cache entries
   */
  abstract flush(): Promise<void>

  /**
   * Get multiple values
   */
  abstract getMany<T = unknown>(keys: string[]): Promise<Map<string, T | null>>

  /**
   * Set multiple values
   */
  abstract setMany<T = unknown>(entries: Map<string, T>, ttlSeconds?: number): Promise<void>

  /**
   * Add tags to a cache key for group invalidation
   */
  abstract tag(tags: string[]): TaggedCache
}

/**
 * Tagged Cache for group invalidation
 */
export abstract class TaggedCache {
  abstract get<T = unknown>(key: string): Promise<T | null>
  abstract set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void>
  abstract flush(): Promise<void>
}
