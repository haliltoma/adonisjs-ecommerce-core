import {
  SearchProvider,
  type SearchParams,
  type SearchResult,
  type ProductSearchHit,
  type IndexableProduct,
} from '#contracts/search_provider'
import Product from '#models/product'
import SearchLog from '#models/search_log'
import { randomUUID } from 'node:crypto'

/**
 * Database Search Provider
 *
 * Default search provider using PostgreSQL ILIKE queries.
 * For production, consider MeiliSearch or Algolia providers.
 */
export class DatabaseSearchProvider extends SearchProvider {
  readonly name = 'database'

  async searchProducts(params: SearchParams): Promise<SearchResult<ProductSearchHit>> {
    const start = Date.now()
    const page = params.page || 1
    const limit = params.limit || 20

    const query = Product.query()
      .where('storeId', params.storeId)
      .where('status', 'active')
      .whereNull('deletedAt')
      .preload('images')
      .preload('categories')
      .preload('tags')

    // Text search
    if (params.query) {
      query.where((builder) => {
        builder
          .whereILike('title', `%${params.query}%`)
          .orWhereILike('description', `%${params.query}%`)
          .orWhereILike('sku', `%${params.query}%`)
          .orWhereILike('vendor', `%${params.query}%`)
      })
    }

    // Filters
    if (params.filters?.categoryIds?.length) {
      query.whereHas('categories', (builder) => {
        builder.whereIn('categories.id', params.filters!.categoryIds!)
      })
    }

    if (params.filters?.tagIds?.length) {
      query.whereHas('tags', (builder) => {
        builder.whereIn('tags.id', params.filters!.tagIds!)
      })
    }

    if (params.filters?.priceMin !== undefined) {
      query.where('price', '>=', params.filters.priceMin)
    }

    if (params.filters?.priceMax !== undefined) {
      query.where('price', '<=', params.filters.priceMax)
    }

    if (params.filters?.inStock) {
      query.where('stockQuantity', '>', 0)
    }

    // Sort
    const sortField = params.sort?.field || 'relevance'
    const sortDir = params.sort?.direction || 'desc'

    if (sortField === 'relevance') {
      query.orderBy('isFeatured', 'desc').orderBy('createdAt', 'desc')
    } else if (sortField === 'price') {
      query.orderBy('price', sortDir)
    } else if (sortField === 'title') {
      query.orderBy('title', sortDir)
    } else if (sortField === 'createdAt') {
      query.orderBy('createdAt', sortDir)
    }

    const paginated = await query.paginate(page, limit)

    const hits: ProductSearchHit[] = paginated.all().map((product) => ({
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.shortDescription || product.description?.substring(0, 200),
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      imageUrl: product.images?.[0]?.url,
      status: product.status,
      categoryNames: product.categories?.map((c) => c.name),
      tagNames: product.tags?.map((t) => t.name),
    }))

    // Log search query
    await SearchLog.create({
      id: randomUUID(),
      storeId: params.storeId,
      query: params.query,
      resultsCount: paginated.total,
    }).catch(() => {})

    return {
      hits,
      total: paginated.total,
      page,
      limit,
      totalPages: paginated.lastPage,
      processingTimeMs: Date.now() - start,
    }
  }

  async indexProduct(_product: IndexableProduct): Promise<void> {
    // Database search doesn't need separate indexing
  }

  async removeProduct(_productId: string): Promise<void> {
    // Database search doesn't need separate index removal
  }

  async bulkIndexProducts(_products: IndexableProduct[]): Promise<void> {
    // Database search doesn't need separate indexing
  }

  async getSuggestions(query: string, storeId: string, limit: number = 5): Promise<string[]> {
    const products = await Product.query()
      .where('storeId', storeId)
      .where('status', 'active')
      .whereNull('deletedAt')
      .whereILike('title', `%${query}%`)
      .select('title')
      .limit(limit)

    return products.map((p) => p.title)
  }

  async rebuildIndex(_storeId: string): Promise<void> {
    // No-op for database search
  }

  async healthCheck(): Promise<{ healthy: boolean; message?: string }> {
    try {
      await Product.query().limit(1)
      return { healthy: true }
    } catch (error: unknown) {
      return { healthy: false, message: String(error) }
    }
  }
}
