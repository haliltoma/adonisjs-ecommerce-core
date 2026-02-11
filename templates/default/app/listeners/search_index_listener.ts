import { SearchProvider, type IndexableProduct } from '#contracts/search_provider'
import type Product from '#models/product'
import type { ProductCreated, ProductUpdated, ProductDeleted } from '#events/product_events'
import app from '@adonisjs/core/services/app'
import logger from '@adonisjs/core/services/logger'

/**
 * Search Index Listener
 *
 * Syncs product changes to the search index (Meilisearch, Algolia, etc.)
 * when products are created, updated, or deleted.
 *
 * For the database search provider, these are no-ops.
 */
export default class SearchIndexListener {
  private async getSearchProvider(): Promise<SearchProvider> {
    return app.container.make(SearchProvider)
  }

  private async productToIndexable(product: Product): Promise<IndexableProduct> {
    // Ensure relationships are loaded
    if (!product.$preloaded.images) {
      await product.load('images')
    }
    if (!product.$preloaded.categories) {
      await product.load('categories')
    }
    if (!product.$preloaded.tags) {
      await product.load('tags')
    }
    if (!product.$preloaded.variants) {
      await product.load('variants')
    }

    return {
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
    }
  }

  async handleProductCreated(event: ProductCreated) {
    try {
      const search = await this.getSearchProvider()
      const doc = await this.productToIndexable(event.product)
      await search.indexProduct(doc)
    } catch (error) {
      logger.error({ err: error }, 'Failed to index product in search')
    }
  }

  async handleProductUpdated(event: ProductUpdated) {
    try {
      const search = await this.getSearchProvider()

      if (event.product.status === 'active' && !event.product.deletedAt) {
        const doc = await this.productToIndexable(event.product)
        await search.indexProduct(doc)
      } else {
        // Product is no longer active, remove from index
        await search.removeProduct(event.product.id)
      }
    } catch (error) {
      logger.error({ err: error }, 'Failed to update product in search index')
    }
  }

  async handleProductDeleted(event: ProductDeleted) {
    try {
      const search = await this.getSearchProvider()
      await search.removeProduct(event.product.id)
    } catch (error) {
      logger.error({ err: error }, 'Failed to remove product from search index')
    }
  }
}
