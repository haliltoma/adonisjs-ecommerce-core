import { BaseModel } from '@adonisjs/lucid/orm'
import string from '@adonisjs/core/helpers/string'

/**
 * SlugHelper
 *
 * Utility class for generating URL-safe slugs.
 * Handles uniqueness checking and special characters.
 */
export class SlugHelper {
  private separator = '-'

  /**
   * Generate a slug from text
   */
  generate(text: string): string {
    return string.slug(text, {
      replacement: this.separator,
      lower: true,
      strict: true,
      trim: true,
    })
  }

  /**
   * Generate a unique slug for a model
   */
  async generateUnique<T extends typeof BaseModel>(
    text: string,
    model: T,
    column: string = 'slug',
    excludeId?: string
  ): Promise<string> {
    let slug = this.generate(text)
    let counter = 0
    let uniqueSlug = slug

    while (true) {
      const query = model.query().where(column, uniqueSlug)

      if (excludeId) {
        query.whereNot('id', excludeId)
      }

      const existing = await query.first()

      if (!existing) {
        break
      }

      counter++
      uniqueSlug = `${slug}${this.separator}${counter}`
    }

    return uniqueSlug
  }

  /**
   * Generate a slug with a random suffix
   */
  generateWithSuffix(text: string, length: number = 6): string {
    const baseSlug = this.generate(text)
    const suffix = this.generateRandomString(length)
    return `${baseSlug}${this.separator}${suffix}`
  }

  /**
   * Generate a random alphanumeric string
   */
  private generateRandomString(length: number): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  /**
   * Validate if a string is a valid slug
   */
  isValid(slug: string): boolean {
    // Only lowercase letters, numbers, and hyphens
    const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    return slugRegex.test(slug)
  }

  /**
   * Normalize a slug (fix common issues)
   */
  normalize(slug: string): string {
    return slug
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, this.separator)
      .replace(/-+/g, this.separator)
      .replace(/^-|-$/g, '')
  }

  /**
   * Extract text from a slug
   */
  toText(slug: string): string {
    return slug
      .split(this.separator)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  /**
   * Generate a slug for SEO URLs with transliteration
   */
  generateSeo(text: string, maxLength: number = 100): string {
    let slug = this.generate(text)

    // Truncate to max length at word boundary
    if (slug.length > maxLength) {
      slug = slug.substring(0, maxLength)
      const lastHyphen = slug.lastIndexOf(this.separator)
      if (lastHyphen > 0) {
        slug = slug.substring(0, lastHyphen)
      }
    }

    return slug
  }

  /**
   * Generate a hierarchical slug (for categories)
   */
  generatePath(segments: string[]): string {
    return segments.map((s) => this.generate(s)).join('/')
  }

  /**
   * Parse a hierarchical slug path
   */
  parsePath(path: string): string[] {
    return path.split('/').filter((s) => s.length > 0)
  }

  /**
   * Compare two slugs (normalized)
   */
  equals(slug1: string, slug2: string): boolean {
    return this.normalize(slug1) === this.normalize(slug2)
  }

  /**
   * Generate a slug for file names
   */
  generateFilename(name: string, extension?: string): string {
    const slug = this.generate(name)
    return extension ? `${slug}.${extension.toLowerCase()}` : slug
  }

  /**
   * Set the separator character
   */
  setSeparator(separator: string): this {
    this.separator = separator
    return this
  }
}

// Singleton instance
export const slug = new SlugHelper()

// Utility functions for direct use
export function slugify(text: string): string {
  return slug.generate(text)
}

export async function uniqueSlug<T extends typeof BaseModel>(
  text: string,
  model: T,
  column?: string,
  excludeId?: string
): Promise<string> {
  return slug.generateUnique(text, model, column, excludeId)
}
