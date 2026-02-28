import {
  SearchProvider,
  type SearchParams,
  type SearchResult,
  type ProductSearchHit,
  type IndexableProduct,
  type SearchFacet,
} from '#contracts/search_provider'
import Product from '#models/product'
import SearchLog from '#models/search_log'
import { MeiliSearch, type Index, type SearchResponse } from 'meilisearch'
import { randomUUID } from 'node:crypto'

const PRODUCTS_INDEX_PREFIX = 'products_'

/**
 * Meilisearch Search Provider
 *
 * Full-text search powered by Meilisearch with typo tolerance,
 * faceted filtering, and instant search capabilities.
 *
 * Set SEARCH_PROVIDER=meilisearch and configure MEILISEARCH_HOST
 * and MEILISEARCH_API_KEY environment variables.
 */
export class MeilisearchSearchProvider extends SearchProvider {
  readonly name = 'meilisearch'
  private client: MeiliSearch

  constructor() {
    super()
    this.client = new MeiliSearch({
      host: process.env.MEILISEARCH_HOST || 'http://127.0.0.1:7700',
      apiKey: process.env.MEILISEARCH_API_KEY || '',
    })
  }

  private getIndexName(storeId: string): string {
    return `${PRODUCTS_INDEX_PREFIX}${storeId.replace(/-/g, '_')}`
  }

  private getIndex(storeId: string): Index {
    return this.client.index(this.getIndexName(storeId))
  }

  private async ensureIndex(storeId: string): Promise<Index> {
    const indexName = this.getIndexName(storeId)
    const index = this.client.index(indexName)

    try {
      await index.getStats()
    } catch {
      // Index doesn't exist, create and configure it
      await this.client.createIndex(indexName, { primaryKey: 'id' })
      await this.configureIndex(index)
    }

    return index
  }

  private async configureIndex(index: Index): Promise<void> {
    await Promise.all([
      index.updateSearchableAttributes([
        'title',
        'description',
        'shortDescription',
        'vendor',
        'sku',
        'barcode',
        'tagNames',
        'categoryNames',
      ]),
      index.updateFilterableAttributes([
        'storeId',
        'status',
        'type',
        'categoryIds',
        'tagIds',
        'price',
        'isFeatured',
        'stockQuantity',
        'vendor',
      ]),
      index.updateSortableAttributes(['price', 'title', 'createdAt', 'isFeatured']),
      index.updateTypoTolerance({
        enabled: true,
        minWordSizeForTypos: { oneTypo: 4, twoTypos: 8 },
      }),
      index.updatePagination({ maxTotalHits: 10000 }),
      index.updateFaceting({ maxValuesPerFacet: 100 }),
    ])
  }

  async searchProducts(params: SearchParams): Promise<SearchResult<ProductSearchHit>> {
    const start = Date.now()
    const page = params.page || 1
    const limit = params.limit || 20
    const index = this.getIndex(params.storeId)

    // Build Meilisearch filter
    const filters: string[] = [`storeId = "${params.storeId}"`, `status = "active"`]

    if (params.filters?.categoryIds?.length) {
      const catFilter = params.filters.categoryIds.map((id) => `categoryIds = "${id}"`).join(' OR ')
      filters.push(`(${catFilter})`)
    }

    if (params.filters?.tagIds?.length) {
      const tagFilter = params.filters.tagIds.map((id) => `tagIds = "${id}"`).join(' OR ')
      filters.push(`(${tagFilter})`)
    }

    if (params.filters?.priceMin !== undefined) {
      filters.push(`price >= ${params.filters.priceMin}`)
    }

    if (params.filters?.priceMax !== undefined) {
      filters.push(`price <= ${params.filters.priceMax}`)
    }

    if (params.filters?.inStock) {
      filters.push('stockQuantity > 0')
    }

    // Build sort
    const sort: string[] = []
    if (params.sort?.field && params.sort.field !== 'relevance') {
      const dir = params.sort.direction || 'asc'
      sort.push(`${params.sort.field}:${dir}`)
    }

    // Build facets request
    const facets = params.facets || ['categoryIds', 'tagIds', 'vendor']

    let response: SearchResponse<Record<string, unknown>>

    try {
      response = await index.search(params.query || '', {
        filter: filters.join(' AND '),
        sort: sort.length > 0 ? sort : undefined,
        facets,
        hitsPerPage: limit,
        page,
        attributesToRetrieve: [
          'id',
          'title',
          'slug',
          'description',
          'shortDescription',
          'price',
          'compareAtPrice',
          'imageUrl',
          'status',
          'categoryNames',
          'tagNames',
        ],
      })
    } catch {
      // Fall back to empty results if index doesn't exist
      return {
        hits: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        processingTimeMs: Date.now() - start,
      }
    }

    const hits: ProductSearchHit[] = (response.hits || []).map((hit: Record<string, unknown>) => ({
      id: hit.id as string,
      title: hit.title as string,
      slug: hit.slug as string,
      description:
        (hit.shortDescription as string) ||
        ((hit.description as string) || '').substring(0, 200),
      price: hit.price as number | null,
      compareAtPrice: hit.compareAtPrice as number | null,
      imageUrl: hit.imageUrl as string | undefined,
      status: hit.status as string,
      categoryNames: hit.categoryNames as string[] | undefined,
      tagNames: hit.tagNames as string[] | undefined,
    }))

    // Convert Meilisearch facet distribution to our format
    const resultFacets: Record<string, SearchFacet[]> = {}
    if (response.facetDistribution) {
      for (const [key, distribution] of Object.entries(response.facetDistribution)) {
        resultFacets[key] = Object.entries(distribution).map(([value, count]) => ({
          value,
          count,
        }))
      }
    }

    // Log search query
    await SearchLog.create({
      id: randomUUID(),
      storeId: params.storeId,
      query: params.query,
      resultsCount: response.estimatedTotalHits || 0,
    }).catch(() => {})

    return {
      hits,
      total: response.estimatedTotalHits || 0,
      page,
      limit,
      totalPages: response.totalPages || Math.ceil((response.estimatedTotalHits || 0) / limit),
      facets: Object.keys(resultFacets).length > 0 ? resultFacets : undefined,
      processingTimeMs: response.processingTimeMs || Date.now() - start,
    }
  }

  async indexProduct(product: IndexableProduct): Promise<void> {
    const index = await this.ensureIndex(product.storeId)
    await index.addDocuments([this.toDocument(product)])
  }

  async removeProduct(productId: string): Promise<void> {
    // We need to try all possible store indices
    // Since we don't know which store this product belongs to,
    // try to find and delete from each index
    try {
      const indexes = await this.client.getIndexes()
      for (const idx of indexes.results) {
        if (idx.uid.startsWith(PRODUCTS_INDEX_PREFIX)) {
          try {
            await this.client.index(idx.uid).deleteDocument(productId)
          } catch {
            // Document might not exist in this index
          }
        }
      }
    } catch {
      // Ignore errors during removal
    }
  }

  async bulkIndexProducts(products: IndexableProduct[]): Promise<void> {
    if (products.length === 0) return

    // Group by store
    const byStore = new Map<string, IndexableProduct[]>()
    for (const product of products) {
      const existing = byStore.get(product.storeId) || []
      existing.push(product)
      byStore.set(product.storeId, existing)
    }

    for (const [storeId, storeProducts] of byStore) {
      const index = await this.ensureIndex(storeId)
      const docs = storeProducts.map((p) => this.toDocument(p))

      // Index in batches of 1000
      for (let i = 0; i < docs.length; i += 1000) {
        const batch = docs.slice(i, i + 1000)
        await index.addDocuments(batch)
      }
    }
  }

  async getSuggestions(query: string, storeId: string, limit: number = 5): Promise<string[]> {
    const index = this.getIndex(storeId)

    try {
      const response = await index.search(query, {
        filter: `storeId = "${storeId}" AND status = "active"`,
        limit,
        attributesToRetrieve: ['title'],
      })

      return (response.hits || []).map((hit: Record<string, unknown>) => hit.title as string)
    } catch {
      return []
    }
  }

  async rebuildIndex(storeId: string): Promise<void> {
    const indexName = this.getIndexName(storeId)

    // Delete existing index
    try {
      await this.client.deleteIndex(indexName)
    } catch {
      // Index might not exist
    }

    // Create fresh index
    await this.client.createIndex(indexName, { primaryKey: 'id' })
    const index = this.client.index(indexName)
    await this.configureIndex(index)

    // Load all active products
    const products = await Product.query()
      .where('storeId', storeId)
      .where('status', 'active')
      .whereNull('deletedAt')
      .preload('images')
      .preload('categories')
      .preload('tags')
      .preload('variants')

    if (products.length === 0) return

    const docs = products.map((product) =>
      this.toDocument({
        id: product.id,
        storeId: product.storeId,
        title: product.title,
        slug: product.slug,
        description: product.description || undefined,
        shortDescription: product.shortDescription || undefined,
        sku: product.sku || undefined,
        barcode: product.barcode || undefined,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        status: product.status,
        type: product.type,
        vendor: product.vendor || undefined,
        isFeatured: product.isFeatured,
        imageUrl: product.images?.[0]?.url,
        categoryIds: product.categories?.map((c) => c.id) || [],
        categoryNames: product.categories?.map((c) => c.name) || [],
        tagIds: product.tags?.map((t) => t.id) || [],
        tagNames: product.tags?.map((t) => t.name) || [],
        stockQuantity:
          product.variants?.reduce((sum, v) => sum + (v.inventoryQuantity || 0), 0) || 0,
        createdAt: product.createdAt.toISO()!,
        updatedAt: product.updatedAt.toISO()!,
      })
    )

    // Index in batches
    for (let i = 0; i < docs.length; i += 1000) {
      const batch = docs.slice(i, i + 1000)
      await index.addDocuments(batch)
    }
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      const health = await this.client.health()
      return {
        healthy: health.status === 'available',
        message: health.status === 'available' ? undefined : `Status: ${health.status}`,
      }
    } catch (error: unknown) {
      return { healthy: false, message: String(error) }
    }
  }

  private toDocument(product: IndexableProduct): Record<string, unknown> {
    return {
      id: product.id,
      storeId: product.storeId,
      title: product.title,
      slug: product.slug,
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      status: product.status,
      type: product.type,
      vendor: product.vendor || '',
      isFeatured: product.isFeatured,
      imageUrl: product.imageUrl || '',
      categoryIds: product.categoryIds,
      categoryNames: product.categoryNames,
      tagIds: product.tagIds,
      tagNames: product.tagNames,
      stockQuantity: product.stockQuantity,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  }
}
