/**
 * Product Repository Interface
 *
 * Defines the contract for product data access operations.
 */

import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import Product from '#models/product'

export interface CreateProductData {
  storeId: string
  title: string
  slug: string
  description?: string
  price?: number | null
  compareAtPrice?: number | null
  costPerItem?: number | null
  sku?: string
  barcode?: string
  trackInventory?: boolean
  stockQuantity?: number
  weight?: number | null
  requiresShipping?: boolean
  taxable?: boolean
  status: 'active' | 'draft' | 'archived'
  productType?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface UpdateProductData {
  title?: string
  slug?: string
  description?: string
  price?: number | null
  compareAtPrice?: number | null
  costPerItem?: number | null
  sku?: string
  barcode?: string
  trackInventory?: boolean
  stockQuantity?: number
  weight?: number | null
  requiresShipping?: boolean
  taxable?: boolean
  status?: string
  productType?: string
  tags?: string[]
  metadata?: Record<string, any>
}

export interface ProductFilters {
  storeId: string
  status?: string
  productType?: string
  categoryIds?: string[]
  tags?: string[]
  search?: string
  inStock?: boolean
  onSale?: boolean
  minPrice?: number
  maxPrice?: number
  dateFrom?: DateTime
  dateTo?: DateTime
  sortBy?: 'createdAt' | 'updatedAt' | 'title' | 'price'
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export type TransactionCallback<T> = (trx: any) => Promise<T>

export default interface IProductRepository {
  /**
   * Find product by ID
   */
  findById(id: string, trx?: any): Promise<Product | null>

  /**
   * Find product by slug
   */
  findBySlug(slug: string, storeId: string, trx?: any): Promise<Product | null>

  /**
   * Find product by SKU
   */
  findBySku(sku: string, storeId: string, trx?: any): Promise<Product | null>

  /**
   * Create new product
   */
  create(data: CreateProductData, trx?: any): Promise<Product>

  /**
   * Update product
   */
  update(id: string, data: UpdateProductData, trx?: any): Promise<Product>

  /**
   * Delete product
   */
  delete(id: string, trx?: any): Promise<void>

  /**
   * List products with filters and pagination
   */
  list(filters: ProductFilters): Promise<ModelPaginatorContract<Product>>

  /**
   * Execute callback within a transaction
   */
  transaction<T>(callback: TransactionCallback<T>): Promise<T>

  /**
   * Search products
   */
  search(
    storeId: string,
    searchTerm: string,
    page?: number,
    limit?: number
  ): Promise<ModelPaginatorContract<Product>>

  /**
   * Get products by category
   */
  findByCategory(
    categoryId: string,
    storeId: string,
    page?: number,
    limit?: number
  ): Promise<ModelPaginatorContract<Product>>

  /**
   * Get products by tags
   */
  findByTags(
    tags: string[],
    storeId: string,
    page?: number,
    limit?: number
  ): Promise<ModelPaginatorContract<Product>>

  /**
   * Get low stock products
   */
  getLowStockProducts(storeId: string, threshold?: number): Promise<Product[]>

  /**
   * Get out of stock products
   */
  getOutOfStockProducts(storeId: string): Promise<Product[]>

  /**
   * Update product stock
   */
  updateStock(
    productId: string,
    quantity: number,
    trx?: any
  ): Promise<void>

  /**
   * Atomic stock reservation - prevents race conditions
   * Uses database-level atomic update to reserve stock in a single operation
   * Returns true if reservation succeeded, false if insufficient stock
   */
  atomicReserveStock(
    productId: string,
    quantity: number,
    trx?: any
  ): Promise<boolean>

  /**
   * Check if slug is unique
   */
  isSlugUnique(slug: string, storeId: string, excludeId?: string): Promise<boolean>
}
