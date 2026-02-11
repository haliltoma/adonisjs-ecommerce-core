/**
 * Search Provider Contract
 *
 * Abstract class for search engine providers.
 * Providers: Database (PostgreSQL full-text), MeiliSearch, Algolia, Elasticsearch, etc.
 */
export abstract class SearchProvider {
  /**
   * Unique identifier for the search provider
   */
  abstract readonly name: string

  /**
   * Search for products
   */
  abstract searchProducts(params: SearchParams): Promise<SearchResult<ProductSearchHit>>

  /**
   * Index a product for search
   */
  abstract indexProduct(product: IndexableProduct): Promise<void>

  /**
   * Remove a product from search index
   */
  abstract removeProduct(productId: string): Promise<void>

  /**
   * Bulk index products
   */
  abstract bulkIndexProducts(products: IndexableProduct[]): Promise<void>

  /**
   * Get search suggestions / autocomplete
   */
  abstract getSuggestions(query: string, storeId: string, limit?: number): Promise<string[]>

  /**
   * Rebuild the entire search index
   */
  abstract rebuildIndex(storeId: string): Promise<void>

  /**
   * Check provider health
   */
  abstract healthCheck(): Promise<{ healthy: boolean; message?: string }>
}

export interface SearchParams {
  query: string
  storeId: string
  filters?: SearchFilters
  sort?: SearchSort
  page?: number
  limit?: number
  facets?: string[]
}

export interface SearchFilters {
  categoryIds?: string[]
  tagIds?: string[]
  priceMin?: number
  priceMax?: number
  status?: string
  inStock?: boolean
  attributes?: Record<string, string | string[]>
}

export interface SearchSort {
  field: 'relevance' | 'price' | 'title' | 'createdAt' | 'popularity'
  direction: 'asc' | 'desc'
}

export interface SearchResult<T> {
  hits: T[]
  total: number
  page: number
  limit: number
  totalPages: number
  facets?: Record<string, SearchFacet[]>
  processingTimeMs: number
}

export interface SearchFacet {
  value: string
  count: number
  label?: string
}

export interface ProductSearchHit {
  id: string
  title: string
  slug: string
  description?: string
  price: number | null
  compareAtPrice: number | null
  imageUrl?: string
  status: string
  categoryNames?: string[]
  tagNames?: string[]
  score?: number
}

export interface IndexableProduct {
  id: string
  storeId: string
  title: string
  slug: string
  description?: string
  shortDescription?: string
  sku?: string
  barcode?: string
  price: number | null
  compareAtPrice: number | null
  status: string
  type: string
  vendor?: string
  isFeatured: boolean
  imageUrl?: string
  categoryIds: string[]
  categoryNames: string[]
  tagIds: string[]
  tagNames: string[]
  attributes?: Record<string, unknown>
  stockQuantity: number
  createdAt: string
  updatedAt: string
}
