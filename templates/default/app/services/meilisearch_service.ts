/**
 * MeiliSearch Service
 *
 * Advanced search and filtering with MeiliSearch integration.
 */

import { MeiliSearch } from 'meilisearch'
import Product from '#models/product'
import env from '#start/env'
import logger from '@adonisjs/core/services/logger'

export interface SearchFilters {
  query?: string
  category?: string
  priceMin?: number
  priceMax?: number
  inStock?: boolean
  onSale?: boolean
  attributes?: Record<string, any>
  tags?: string[]
  sortBy?: 'price' | 'name' | 'created_at' | 'popularity'
  sortOrder?: 'asc' | 'desc'
}

export interface SearchResult {
  hits: Array<{
    id: string
    name: string
    slug: string
    price: number
    compareAtPrice: number | null
    description: string
    category: string | null
    images: string[]
    tags: string[]
    attributes: Record<string, any>
    inStock: boolean
    onSale: boolean
  }>
  estimatedTotalHits: number
  limit: number
  offset: number
  processingTimeMs: number
}

export default class MeiliSearchService {
  private static instance: MeiliSearchService
  private client: MeiliSearch | null = null
  private productIndexName = 'products'

  private constructor() {
    this.initializeClient()
  }

  static getInstance(): MeiliSearchService {
    if (!MeiliSearchService.instance) {
      MeiliSearchService.instance = new MeiliSearchService()
    }
    return MeiliSearchService.instance
  }

  /**
   * Initialize MeiliSearch client
   */
  private initializeClient(): void {
    try {
      const host = env.get('MEILISEARCH_HOST')
      const apiKey = env.get('MEILISEARCH_API_KEY')

      if (!host) {
        logger.info('MeiliSearch host not configured, search features will be limited')
        return
      }

      this.client = new MeiliSearch({
        host,
        apiKey: apiKey || undefined,
      })

      logger.info('MeiliSearch client initialized successfully')
    } catch (error) {
      logger.error({ error }, 'Failed to initialize MeiliSearch client')
      this.client = null
    }
  }

  /**
   * Check if MeiliSearch is available
   */
  isAvailable(): boolean {
    return this.client !== null
  }

  /**
   * Create product index with settings
   */
  async createProductIndex(): Promise<void> {
    if (!this.client) {
      throw new Error('MeiliSearch client not available')
    }

    try {
      // Check if index exists
      const index = await this.client.getIndex(this.productIndexName).catch(() => null)

      if (!index) {
        logger.info(`Creating MeiliSearch index: ${this.productIndexName}`)

        // Create index
        await this.client.createIndex(this.productIndexName, {
          primaryKey: 'id',
        })

        // Configure searchable attributes
        await this.client.index(this.productIndexName).updateSearchableAttributes([
          'name',
          'description',
          'slug',
          'tags',
          'category',
          'attributes',
        ])

        // Configure filterable attributes
        await this.client.index(this.productIndexName).updateFilterableAttributes([
          'price',
          'compareAtPrice',
          'categoryId',
          'inStock',
          'onSale',
          'tags',
          'createdAt',
          'status',
        ])

        // Configure sortable attributes
        await this.client.index(this.productIndexName).updateSortableAttributes([
          'price',
          'name',
          'createdAt',
        ])

        // Configure ranking rules
        await this.client.index(this.productIndexName).updateRankingRules([
          'words',
          'typo',
          'proximity',
          'attribute',
          'sort',
          'exactness',
        ])

        // Configure distinct attribute for variants
        await this.client.index(this.productIndexName).updateDistinctAttribute('productId')

        // Configure displayed attributes
        await this.client.index(this.productIndexName).updateDisplayedAttributes([
          'id',
          'productId',
          'name',
          'slug',
          'description',
          'price',
          'compareAtPrice',
          'categoryId',
          'category',
          'images',
          'tags',
          'attributes',
          'inStock',
          'onSale',
          'createdAt',
          'status',
        ])

        logger.info('MeiliSearch index created and configured successfully')
      }
    } catch (error) {
      logger.error({ error }, 'Failed to create MeiliSearch index')
      throw error
    }
  }

  /**
   * Index products in MeiliSearch
   */
  async indexProducts(products: Product[]): Promise<void> {
    if (!this.client) {
      logger.warn('MeiliSearch not available, skipping indexing')
      return
    }

    try {
      const documents = products.map((product) => ({
        id: product.id,
        productId: product.id,
        name: product.title,
        slug: product.slug,
        description: product.description || '',
        price: product.price || 0,
        compareAtPrice: product.compareAtPrice,
        categoryId: null,
        category: null,
        images: [],
        tags: [],
        attributes: product.customFields || {},
        inStock: product.status === 'active' && product.trackInventory ? product.stockQuantity > 0 : product.status === 'active',
        onSale: product.compareAtPrice !== null && product.compareAtPrice > (product.price || 0),
        createdAt: product.createdAt.toISO(),
        status: product.status,
      }))

      const index = this.client.index(this.productIndexName)
      await index.updateDocuments(documents)

      logger.info(`Indexed ${products.length} products in MeiliSearch`)
    } catch (error) {
      logger.error({ error }, 'Failed to index products in MeiliSearch')
      throw error
    }
  }

  /**
   * Index single product
   */
  async indexProduct(product: Product): Promise<void> {
    await this.indexProducts([product])
  }

  /**
   * Delete product from index
   */
  async deleteProduct(productId: string): Promise<void> {
    if (!this.client) {
      return
    }

    try {
      const index = this.client.index(this.productIndexName)
      await index.deleteDocument(productId)

      logger.info(`Deleted product ${productId} from MeiliSearch`)
    } catch (error) {
      logger.error({ error, productId }, 'Failed to delete product from MeiliSearch')
    }
  }

  /**
   * Search products with filters
   */
  async search(filters: SearchFilters & {
    limit?: number
    offset?: number
  } = {}): Promise<SearchResult> {
    if (!this.client) {
      // Fallback to database search
      return this.databaseSearch(filters)
    }

    try {
      const index = this.client.index(this.productIndexName)

      const searchParams: any = {
        limit: filters.limit || 20,
        offset: filters.offset || 0,
      }

      // Build filter expression
      const filterExpressions: string[] = []

      // Only show active products
      filterExpressions.push('status = active')

      // Stock filter
      if (filters.inStock !== undefined) {
        filterExpressions.push(`inStock = ${filters.inStock}`)
      }

      // Sale filter
      if (filters.onSale !== undefined) {
        filterExpressions.push(`onSale = ${filters.onSale}`)
      }

      // Category filter
      if (filters.category) {
        filterExpressions.push(`category = "${filters.category}"`)
      }

      // Price range filter
      if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
        const priceFilters: string[] = []
        if (filters.priceMin !== undefined) {
          priceFilters.push(`price >= ${filters.priceMin}`)
        }
        if (filters.priceMax !== undefined) {
          priceFilters.push(`price <= ${filters.priceMax}`)
        }
        filterExpressions.push(priceFilters.join(' AND '))
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const tagFilter = filters.tags.map((tag) => `tags = "${tag}"`).join(' OR ')
        filterExpressions.push(`(${tagFilter})`)
      }

      // Apply filters
      if (filterExpressions.length > 0) {
        searchParams.filter = filterExpressions.join(' AND ')
      }

      // Sort
      if (filters.sortBy) {
        const sortOrder = filters.sortOrder || 'asc'
        searchParams.sort = [`${filters.sortBy}:${sortOrder}`]
      }

      // Execute search
      const results = await index.search(filters.query || '', searchParams)

      return {
        hits: results.hits as any,
        estimatedTotalHits: results.estimatedTotalHits,
        limit: results.limit,
        offset: results.offset,
        processingTimeMs: results.processingTimeMs,
      }
    } catch (error) {
      logger.error({ error }, 'MeiliSearch query failed, falling back to database')
      return this.databaseSearch(filters)
    }
  }

  /**
   * Fallback database search
   */
  private async databaseSearch(filters: SearchFilters & {
    limit?: number
    offset?: number
  } = {}): Promise<SearchResult> {
    const startTime = Date.now()

    const query = Product.query()

    // Only active products
    query.where('status', 'active')

    // Text search
    if (filters.query) {
      query.where((subQuery) => {
        subQuery
          .where('title', 'ILIKE', `%${filters.query}%`)
          .orWhere('description', 'ILIKE', `%${filters.query}%`)
          .orWhere('slug', 'ILIKE', `%${filters.query}%`)
      })
    }

    // Category filter
    if (filters.category) {
      query.whereHas('categories', (categoryQuery) => {
        categoryQuery.where('title', filters.category)
      })
    }

    // Price range filter
    if (filters.priceMin !== undefined) {
      query.where('price', '>=', filters.priceMin)
    }
    if (filters.priceMax !== undefined) {
      query.where('price', '<=', filters.priceMax)
    }

    // Sale filter
    if (filters.onSale) {
      query.whereNotNull('compareAtPrice').whereRaw('"compareAtPrice" > "price"')
    }

    // Stock filter
    if (filters.inStock) {
      query.where((subQuery) => {
        subQuery
          .where('track_inventory', false)
          .orWhere('stock_quantity', '>', 0)
      })
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      query.whereRaw('? <@ tags', [JSON.stringify(filters.tags)])
    }

    // Sorting
    const sortBy = filters.sortBy || 'created_at'
    const sortOrder = filters.sortOrder || 'desc'

    switch (sortBy) {
      case 'price':
        query.orderBy('price', sortOrder)
        break
      case 'name':
        query.orderBy('name', sortOrder)
        break
      case 'popularity':
        // Order by total sales if available
        query.orderBy('totalSales', sortOrder)
        break
      default:
        query.orderBy('createdAt', sortOrder)
    }

    // Pagination
    const limit = filters.limit || 20
    const offset = filters.offset || 0

    query.limit(limit).offset(offset)

    const products = await query

    const processingTimeMs = Date.now() - startTime

    return {
      hits: products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        compareAtPrice: p.compareAtPrice,
        description: p.description || '',
        category: p.category?.name || null,
        images: p.images || [],
        tags: p.tags || [],
        attributes: p.attributes || {},
        inStock: p.status === 'active' && (p.trackInventory ? p.stockQuantity > 0 : true),
        onSale: p.compareAtPrice !== null && p.compareAtPrice > p.price,
      })),
      estimatedTotalHits: products.length,
      limit,
      offset,
      processingTimeMs,
    }
  }

  /**
   * Get search suggestions
   */
  async getSuggestions(query: string, limit: number = 5): Promise<string[]> {
    if (!this.client || query.length < 2) {
      return []
    }

    try {
      const index = this.client.index(this.productIndexName)

      const results = await index.search(query, {
        limit,
        attributesToRetrieve: ['name'],
      })

      return results.hits.map((hit: any) => hit.name)
    } catch (error) {
      logger.error({ error }, 'Failed to get search suggestions')
      return []
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearchTerms(limit: number = 10): Promise<Array<{ term: string; count: number }>> {
    // This would require a search analytics table
    // For now, return empty array
    return []
  }

  /**
   * Reindex all products
   */
  async reindexAllProducts(): Promise<{ indexed: number; failed: number }> {
    let indexed = 0
    let failed = 0

    try {
      const products = await Product.query().where('status', 'active')

      const batchSize = 100
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize)
        try {
          await this.indexProducts(batch)
          indexed += batch.length
        } catch (error) {
          logger.error({ error, batchIndex: i }, 'Failed to index product batch')
          failed += batch.length
        }
      }

      logger.info(`Reindexing complete: ${indexed} indexed, ${failed} failed`)
    } catch (error) {
      logger.error({ error }, 'Failed to reindex products')
      throw error
    }

    return { indexed, failed }
  }

  /**
   * Clear all products from index
   */
  async clearIndex(): Promise<void> {
    if (!this.client) {
      return
    }

    try {
      const index = this.client.index(this.productIndexName)
      await index.deleteAllDocuments()

      logger.info('Cleared all products from MeiliSearch index')
    } catch (error) {
      logger.error({ error }, 'Failed to clear MeiliSearch index')
      throw error
    }
  }

  /**
   * Get index stats
   */
  async getIndexStats(): Promise<any> {
    if (!this.client) {
      return { available: false }
    }

    try {
      const index = this.client.index(this.productIndexName)
      const stats = await index.getStats()

      return {
        available: true,
        numberOfDocuments: stats.numberOfDocuments,
        isIndexing: stats.isIndexing,
        fieldDistribution: stats.fieldDistribution,
      }
    } catch (error) {
      logger.error({ error }, 'Failed to get MeiliSearch stats')
      return { available: false, error: (error as Error).message }
    }
  }
}

/**
 * Export singleton instance
 */
export const meilisearchService = MeiliSearchService.getInstance()
