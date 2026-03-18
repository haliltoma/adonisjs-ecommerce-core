/**
 * Admin Search Controller
 *
 * Manages MeiliSearch integration and provides search analytics.
 */

import type { HttpContext } from '@adonisjs/core/http'
import { meilisearchService } from '#services/meilisearch_service'
import { searchAnalyticsService } from '#services/search_analytics_service'

export default class AdminSearchController {
  /**
   * Get search configuration and status
   */
  async status({ response }: HttpContext) {
    const stats = await meilisearchService.getIndexStats()

    return response.json({
      available: meilisearchService.isAvailable(),
      stats,
    })
  }

  /**
   * Reindex all products
   */
  async reindex({ response }: HttpContext) {
    const result = await meilisearchService.reindexAllProducts()

    return response.json({
      message: `Reindexing complete: ${result.indexed} indexed, ${result.failed} failed`,
      ...result,
    })
  }

  /**
   * Clear search index
   */
  async clearIndex({ response }: HttpContext) {
    await meilisearchService.clearIndex()

    return response.json({
      message: 'Search index cleared successfully',
    })
  }

  /**
   * Create product index
   */
  async createIndex({ response }: HttpContext) {
    await meilisearchService.createProductIndex()

    return response.json({
      message: 'Product index created successfully',
    })
  }

  /**
   * Get search analytics summary
   */
  async analytics({ request }: HttpContext) {
    const days = request.input('days', 30)

    const summary = await searchAnalyticsService.getAnalyticsSummary(days)

    return summary
  }

  /**
   * Get popular search terms
   */
  async popularTerms({ request }: HttpContext) {
    const days = request.input('days', 30)
    const limit = request.input('limit', 20)

    const terms = await searchAnalyticsService.getPopularSearchTerms(days, limit)

    return terms
  }

  /**
   * Get trending searches
   */
  async trending({ request }: HttpContext) {
    const days = request.input('days', 7)
    const limit = request.input('limit', 10)

    const trending = await searchAnalyticsService.getTrendingSearches(days, limit)

    return trending
  }

  /**
   * Get zero result searches
   */
  async zeroResults({ request }: HttpContext) {
    const days = request.input('days', 7)
    const limit = request.input('limit', 20)

    const zeroResults = await searchAnalyticsService.getZeroResultSearches(days, limit)

    return zeroResults
  }

  /**
   * Clean old search events
   */
  async cleanEvents({ request, response }: HttpContext) {
    const daysToKeep = request.input('daysToKeep', 90)

    const deleted = await searchAnalyticsService.cleanOldEvents(daysToKeep)

    return response.json({
      message: `Deleted ${deleted} old search events`,
      deleted,
    })
  }

  /**
   * Search products (admin search with extra fields)
   */
  async search({ request }: HttpContext) {
    const query = request.input('query')
    const category = request.input('category')
    const priceMin = request.input('priceMin')
    const priceMax = request.input('priceMax')
    const inStock = request.input('inStock')
    const onSale = request.input('onSale')
    const tags = request.input('tags')
    const sortBy = request.input('sortBy')
    const sortOrder = request.input('sortOrder', 'desc')
    const limit = request.input('limit', 20)
    const offset = request.input('offset', 0)

    const results = await meilisearchService.search({
      query,
      category,
      priceMin,
      priceMax,
      inStock,
      onSale,
      tags,
      sortBy,
      sortOrder,
      limit,
      offset,
    })

    return results
  }

  /**
   * Get search suggestions
   */
  async suggestions({ request }: HttpContext) {
    const query = request.input('query', '')
    const limit = request.input('limit', 5)

    const suggestions = await meilisearchService.getSuggestions(query, limit)

    return suggestions
  }

  /**
   * Track search event (for analytics)
   */
  async trackSearch({ request, response, auth }: HttpContext) {
    const query = request.input('query')
    const resultsCount = request.input('resultsCount', 0)
    const filters = request.input('filters', {})

    const user = auth.auth?.user
    const userId = user ? String(user.id) : undefined

    await searchAnalyticsService.trackSearch({
      query,
      resultsCount,
      filters,
      userId,
      sessionId: request.input('sessionId'),
      ipAddress: request.ip(),
      userAgent: request.header('user-agent'),
    })

    return response.noContent()
  }

  /**
   * Track search click (for analytics)
   */
  async trackClick({ request, response }: HttpContext) {
    const searchQuery = request.input('searchQuery')
    const productId = request.input('productId')
    const position = request.input('position', 0)

    await searchAnalyticsService.trackClick(searchQuery, productId, position)

    return response.noContent()
  }
}
