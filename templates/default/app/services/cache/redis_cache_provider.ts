import { CacheProvider, TaggedCache } from '#contracts/cache_provider'
import redis from '@adonisjs/redis/services/main'

/**
 * Redis Cache Provider
 *
 * Default cache provider using AdonisJS Redis.
 */
export class RedisCacheProvider extends CacheProvider {
  private prefix = 'commerce:'

  private key(k: string): string {
    return `${this.prefix}${k}`
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const value = await redis.get(this.key(key))
    if (value === null) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return value as unknown as T
    }
  }

  async set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    if (ttlSeconds) {
      await redis.setex(this.key(key), ttlSeconds, serialized)
    } else {
      await redis.set(this.key(key), serialized)
    }
  }

  async has(key: string): Promise<boolean> {
    const exists = await redis.exists(this.key(key))
    return exists === 1
  }

  async delete(key: string): Promise<boolean> {
    const deleted = await redis.del(this.key(key))
    return deleted > 0
  }

  async deletePattern(pattern: string): Promise<number> {
    const keys = await redis.keys(this.key(pattern))
    if (keys.length === 0) return 0
    return await redis.del(keys)
  }

  async remember<T>(key: string, ttlSeconds: number, factory: () => Promise<T>): Promise<T> {
    const cached = await this.get<T>(key)
    if (cached !== null) return cached

    const value = await factory()
    await this.set(key, value, ttlSeconds)
    return value
  }

  async increment(key: string, amount: number = 1): Promise<number> {
    return await redis.incrby(this.key(key), amount)
  }

  async decrement(key: string, amount: number = 1): Promise<number> {
    return await redis.decrby(this.key(key), amount)
  }

  async flush(): Promise<void> {
    const keys = await redis.keys(`${this.prefix}*`)
    if (keys.length > 0) {
      await redis.del(keys)
    }
  }

  async getMany<T = unknown>(keys: string[]): Promise<Map<string, T | null>> {
    const result = new Map<string, T | null>()
    if (keys.length === 0) return result

    const prefixedKeys = keys.map((k) => this.key(k))
    const values = await redis.mget(prefixedKeys)

    keys.forEach((key, index) => {
      const value = values[index]
      if (value === null) {
        result.set(key, null)
      } else {
        try {
          result.set(key, JSON.parse(value) as T)
        } catch {
          result.set(key, value as unknown as T)
        }
      }
    })

    return result
  }

  async setMany<T = unknown>(entries: Map<string, T>, ttlSeconds?: number): Promise<void> {
    const pipeline = redis.pipeline()
    for (const [key, value] of entries) {
      const serialized = JSON.stringify(value)
      if (ttlSeconds) {
        pipeline.setex(this.key(key), ttlSeconds, serialized)
      } else {
        pipeline.set(this.key(key), serialized)
      }
    }
    await pipeline.exec()
  }

  tag(tags: string[]): TaggedCache {
    return new RedisTaggedCache(this.prefix, tags)
  }
}

class RedisTaggedCache extends TaggedCache {
  constructor(
    private prefix: string,
    private tags: string[]
  ) {
    super()
  }

  private tagKey(tag: string): string {
    return `${this.prefix}tag:${tag}`
  }

  private key(k: string): string {
    return `${this.prefix}${k}`
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    const value = await redis.get(this.key(key))
    if (value === null) return null
    try {
      return JSON.parse(value) as T
    } catch {
      return value as unknown as T
    }
  }

  async set<T = unknown>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value)
    const prefixedKey = this.key(key)

    const pipeline = redis.pipeline()
    if (ttlSeconds) {
      pipeline.setex(prefixedKey, ttlSeconds, serialized)
    } else {
      pipeline.set(prefixedKey, serialized)
    }

    // Track key under each tag
    for (const tag of this.tags) {
      pipeline.sadd(this.tagKey(tag), prefixedKey)
    }

    await pipeline.exec()
  }

  async flush(): Promise<void> {
    for (const tag of this.tags) {
      const members = await redis.smembers(this.tagKey(tag))
      if (members.length > 0) {
        await redis.del(members)
      }
      await redis.del(this.tagKey(tag))
    }
  }
}
