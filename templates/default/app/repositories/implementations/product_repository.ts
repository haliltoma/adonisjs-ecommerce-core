/**
 * Product Repository Implementation
 *
 * Concrete implementation of product data access using Lucid ORM.
 */

import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Product from '#models/product'
import type IProductRepository, {
  CreateProductData,
  UpdateProductData,
  ProductFilters,
  TransactionCallback,
} from '../interfaces/i_product_repository'

export default class ProductRepository implements IProductRepository {
  /**
   * Find product by ID
   */
  async findById(id: string, trx?: any): Promise<Product | null> {
    const query = Product.query(trx ? { client: trx } : undefined)
      .preload('variants')
      .preload('images')
      .preload('categories')

    return await query.where('id', id).first()
  }

  /**
   * Find product by slug
   */
  async findBySlug(slug: string, storeId: string, trx?: any): Promise<Product | null> {
    const query = Product.query(trx ? { client: trx } : undefined)
      .preload('variants')
      .preload('images')
      .preload('categories')

    return await query.where('slug', slug).where('storeId', storeId).first()
  }

  /**
   * Find product by SKU
   */
  async findBySku(sku: string, storeId: string, trx?: any): Promise<Product | null> {
    const query = Product.query(trx ? { client: trx } : undefined)

    return await query.where('sku', sku).where('storeId', storeId).first()
  }

  /**
   * Create new product
   */
  async create(data: CreateProductData, trx?: any): Promise<Product> {
    return await Product.create(data, trx ? { client: trx } : undefined)
  }

  /**
   * Update product
   */
  async update(id: string, data: UpdateProductData, trx?: any): Promise<Product> {
    const product = await this.findById(id, trx)

    if (!product) {
      throw new Error(`Product not found: ${id}`)
    }

    product.merge(data)
    await product.save(trx ? { client: trx } : undefined)

    return product
  }

  /**
   * Delete product
   */
  async delete(id: string, trx?: any): Promise<void> {
    const product = await this.findById(id, trx)

    if (!product) {
      throw new Error(`Product not found: ${id}`)
    }

    await product.delete(trx ? { client: trx } : undefined)
  }

  /**
   * List products with filters and pagination
   */
  async list(filters: ProductFilters): Promise<any> {
    const query = Product.query()

    // Store filter is always required
    query.where('storeId', filters.storeId)

    // Status filter
    if (filters.status) {
      query.where('status', filters.status)
    }

    // Product type filter
    if (filters.productType) {
      query.where('productType', filters.productType)
    }

    // Category filter
    if (filters.categoryIds && filters.categoryIds.length > 0) {
      query.whereHas('categories', (categoryQuery) => {
        categoryQuerywhereIn('categories.id', filters.categoryIds!)
      })
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach((tag) => {
        query.where('tags', 'like', `%${tag}%`)
      })
    }

    // Stock filter
    if (filters.inStock !== undefined) {
      if (filters.inStock) {
        query.where('quantityAvailable', '>', 0)
      } else {
        query.where('quantityAvailable', '<=', 0)
      }
    }

    // Sale filter
    if (filters.onSale) {
      query.whereNotNull('compareAtPrice')
        .whereColumn('compareAtPrice', '>', 'price')
    }

    // Price range filter
    if (filters.minPrice !== undefined) {
      query.where('price', '>=', filters.minPrice)
    }

    if (filters.maxPrice !== undefined) {
      query.where('price', '<=', filters.maxPrice)
    }

    // Date range filter
    if (filters.dateFrom) {
      query.where('createdAt', '>=', filters.dateFrom.toSQL())
    }

    if (filters.dateTo) {
      query.where('createdAt', '<=', filters.dateTo.toSQL())
    }

    // Search filter
    if (filters.search) {
      query.where((subQuery) => {
        subQuery
          .where('title', 'LIKE', `%${filters.search}%`)
          .orWhere('description', 'LIKE', `%${filters.search}%`)
          .orWhere('sku', 'LIKE', `%${filters.search}%`)
      })
    }

    // Sorting
    const sortBy = filters.sortBy || 'createdAt'
    const sortDir = filters.sortDir || 'desc'
    query.orderBy(sortBy, sortDir)

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 20

    return await query.paginate(page, limit)
  }

  /**
   * Execute callback within a transaction
   */
  async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
    return await db.transaction(callback)
  }

  /**
   * Search products
   */
  async search(
    storeId: string,
    searchTerm: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    return await Product.query()
      .where('storeId', storeId)
      .where((subQuery) => {
        subQuery
          .where('title', 'LIKE', `%${searchTerm}%`)
          .orWhere('description', 'LIKE', `%${searchTerm}%`)
          .orWhere('sku', 'LIKE', `%${searchTerm}%`)
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)
  }

  /**
   * Get products by category
   */
  async findByCategory(
    categoryId: string,
    storeId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    return await Product.query()
      .where('storeId', storeId)
      .whereHas('categories', (categoryQuery) => {
        categoryQuery.where('categories.id', categoryId)
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)
  }

  /**
   * Get products by tags
   */
  async findByTags(
    tags: string[],
    storeId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const query = Product.query().where('storeId', storeId)

    tags.forEach((tag) => {
      query.where('tags', 'like', `%${tag}%`)
    })

    return await query.orderBy('createdAt', 'desc').paginate(page, limit)
  }

  /**
   * Get low stock products
   */
  async getLowStockProducts(storeId: string, threshold: number = 10): Promise<Product[]> {
    return await Product.query()
      .where('storeId', storeId)
      .where('trackQuantity', true)
      .where('quantityAvailable', '>', 0)
      .where('quantityAvailable', '<=', threshold)
      .orderBy('quantityAvailable', 'asc')
  }

  /**
   * Get out of stock products
   */
  async getOutOfStockProducts(storeId: string): Promise<Product[]> {
    return await Product.query()
      .where('storeId', storeId)
      .where('trackQuantity', true)
      .where('quantityAvailable', '<=', 0)
      .orderBy('updatedAt', 'desc')
  }

  /**
   * Update product stock
   */
  async updateStock(productId: string, quantity: number, trx?: any): Promise<void> {
    await db.from('products')
      .where('id', productId)
      .update({
        quantityAvailable: quantity,
        updatedAt: DateTime.now().toSQL(),
      })
  }

  /**
   * Atomic stock reservation - prevents race conditions
   * Uses database-level atomic update with condition to prevent overselling
   */
  async atomicReserveStock(productId: string, quantity: number, trx?: any): Promise<boolean> {
    // Atomic update: only update if quantityAvailable >= requested quantity
    const result = await db.from('products')
      .where('id', productId)
      .where('trackQuantity', true)
      .where('quantityAvailable', '>=', quantity)
      .update({
        quantityAvailable: db.rawQuery('quantityAvailable - ?', [quantity]),
        updatedAt: DateTime.now().toSQL(),
      })

    // If no rows were updated, either product doesn't exist or insufficient stock
    return (result as any).rowCount > 0 || result > 0
  }

  /**
   * Check if slug is unique
   */
  async isSlugUnique(slug: string, storeId: string, excludeId?: string): Promise<boolean> {
    const query = db.from('products')
      .where('slug', slug)
      .where('storeId', storeId)

    if (excludeId) {
      query.whereNot('id', excludeId)
    }

    const result = await query.first()

    return !result
  }
}
