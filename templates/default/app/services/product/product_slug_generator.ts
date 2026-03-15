/**
 * Product Slug Generator
 *
 * Responsible for generating unique URL slugs for products.
 * Single Responsibility: Generate and validate unique slugs.
 */

import { random } from '#helpers/string'
import type IProductRepository from '#repositories/interfaces/i_product_repository'

export default class ProductSlugGenerator {
  /**
   * Generate unique slug from title
   */
  async generate(
    title: string,
    storeId: string,
    productRepository: IProductRepository,
    existingSlug?: string
  ): Promise<string> {
    if (!title) {
      return `product-${Date.now()}-${random(6)}`
    }

    // Generate base slug
    const baseSlug = this.slugify(title)

    // Check if unique
    if (existingSlug && existingSlug === baseSlug) {
      return baseSlug
    }

    const isUnique = await productRepository.isSlugUnique(baseSlug, storeId)

    if (isUnique) {
      return baseSlug
    }

    // Add suffix if not unique
    let counter = 1
    let slug = `${baseSlug}-${counter}`

    while (!(await productRepository.isSlugUnique(slug, storeId))) {
      counter++
      slug = `${baseSlug}-${counter}`
    }

    return slug
  }

  /**
   * Convert title to URL-friendly slug
   */
  private slugify(title: string): string {
    const charMap: Record<string, string> = {
      ş: 's',
      ç: 'c',
      ğ: 'g',
      ü: 'u',
      ö: 'o',
      ı: 'i',
      Ş: 's',
      Ç: 'c',
      Ğ: 'g',
      Ü: 'u',
      Ö: 'o',
      İ: 'i',
    }

    return title
      .split('')
      .map((char) => charMap[char] || char)
      .join('')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }
}
