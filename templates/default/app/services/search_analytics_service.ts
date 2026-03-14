/**
 * Search Analytics Service
 *
 * Tracks search queries and provides analytics.
 */

import Database from '@adonisjs/lucid/services/database'
import { DateTime } from 'luxon'

export interface SearchEvent {
  query: string
  resultsCount: number
  filters: Record<string, any>
  userId?: string
  sessionId?: string
  ipAddress?: string
  userAgent?: string
}

export interface SearchStats {
  term: string
  searches: number
  clicks: number
  clickThroughRate: number
  avgResults: number
  lastSearchedAt: DateTime
}

export default class SearchAnalyticsService {
  private static instance: SearchAnalyticsService

  private constructor() {}

  static getInstance(): SearchAnalyticsService {
    if (!SearchAnalyticsService.instance) {
      SearchAnalyticsService.instance = new SearchAnalyticsService()
    }
    return SearchAnalyticsService.instance
  }

  /**
   * Track search query
   */
  async trackSearch(event: SearchEvent): Promise<void> {
    try {
      await Database.table('search_events').insert({
        query: event.query.toLowerCase().trim(),
        results_count: event.resultsCount,
        filters: event.filters ? JSON.stringify(event.filters) : null,
        user_id: event.userId || null,
        session_id: event.sessionId || null,
        ip_address: event.ipAddress || null,
        user_agent: event.userAgent || null,
        created_at: DateTime.now().toSQL(),
      })
    } catch (error) {
      // Fail silently for analytics
      console.error('Failed to track search event:', error)
    }
  }

  /**
   * Track search result click
   */
  async trackClick(searchQuery: string, productId: string, position: number): Promise<void> {
    try {
      await Database.table('search_clicks').insert({
        search_query: searchQuery.toLowerCase().trim(),
        product_id: productId,
        position,
        created_at: DateTime.now().toSQL(),
      })
    } catch (error) {
      // Fail silently for analytics
      console.error('Failed to track search click:', error)
    }
  }

  /**
   * Get popular search terms
   */
  async getPopularSearchTerms(days: number = 30, limit: number = 20): Promise<SearchStats[]> {
    const sinceDate = DateTime.now().minus({ days }).toSQL()

    const results = await db
      .from('search_events')
      .select('query')
      .count('* as searches')
      .avg('results_count as avgResults')
      .where('created_at', '>=', sinceDate)
      .groupBy('query')
      .orderBy('searches', 'desc')
      .limit(limit)

    const stats: SearchStats[] = []

    for (const result of results) {
      const query = result.query

      // Get click count
      const clicksResult = await db
        .from('search_clicks')
        .count('* as clicks')
        .where('search_query', query)
        .where('created_at', '>=', sinceDate)
        .first()

      const clicks = Number(clicksResult?.clicks || 0)
      const searches = Number(result.searches)
      const clickThroughRate = searches > 0 ? (clicks / searches) * 100 : 0

      // Get last searched timestamp
      const lastResult = await db
        .from('search_events')
        .select('created_at')
        .where('query', query)
        .orderBy('created_at', 'desc')
        .first()

      stats.push({
        term: query,
        searches,
        clicks,
        clickThroughRate,
        avgResults: Number(result.avgResults) || 0,
        lastSearchedAt: DateTime.fromSQL(lastResult?.created_at || DateTime.now().toSQL()),
      })
    }

    return stats
  }

  /**
   * Get trending searches (growing in popularity)
   */
  async getTrendingSearches(days: number = 7, limit: number = 10): Promise<Array<{ term: string; growth: number }>> {
    const currentDate = DateTime.now()
    const recentPeriod = currentDate.minus({ days })
    const previousPeriod = recentPeriod.minus({ days })

    // Recent period searches
    const recentResults = await db
      .from('search_events')
      .select('query')
      .count('* as count')
      .where('created_at', '>=', recentPeriod.toSQL())
      .groupBy('query')

    // Previous period searches
    const previousResults = await db
      .from('search_events')
      .select('query')
      .count('* as count')
      .where('created_at', '>=', previousPeriod.toSQL())
      .where('created_at', '<', recentPeriod.toSQL())
      .groupBy('query')

    // Calculate growth
    const trending: Array<{ term: string; growth: number }> = []

    for (const recent of recentResults) {
      const previous = previousResults.find((p) => p.query === recent.query)
      const recentCount = Number(recent.count)
      const previousCount = previous ? Number(previous.count) : 0

      // Minimum threshold: at least 5 searches in recent period
      if (recentCount >= 5) {
        const growth = previousCount > 0 ? ((recentCount - previousCount) / previousCount) * 100 : 100
        trending.push({
          term: recent.query,
          growth,
        })
      }
    }

    return trending.sort((a, b) => b.growth - a.growth).slice(0, limit)
  }

  /**
   * Get searches with zero results
   */
  async getZeroResultSearches(days: number = 7, limit: number = 20): Promise<Array<{ term: string; count: number }>> {
    const sinceDate = DateTime.now().minus({ days }).toSQL()

    const results = await db
      .from('search_events')
      .select('query')
      .count('* as count')
      .where('created_at', '>=', sinceDate)
      .where('results_count', 0)
      .groupBy('query')
      .orderBy('count', 'desc')
      .limit(limit)

    return results.map((r) => ({ term: r.query, count: Number(r.count) }))
  }

  /**
   * Get search analytics summary
   */
  async getAnalyticsSummary(days: number = 30): Promise<{
    totalSearches: number
    uniqueQueries: number
    avgResults: number
    zeroResultRate: number
    topTerms: Array<{ term: string; searches: number }>
  }> {
    const sinceDate = DateTime.now().minus({ days }).toSQL()

    // Total searches
    const totalResult = await db
      .from('search_events')
      .count('* as total')
      .where('created_at', '>=', sinceDate)
      .first()

    const totalSearches = Number(totalResult?.total || 0)

    // Unique queries
    const uniqueResult = await db
      .from('search_events')
      .countDistinct('query as unique')
      .where('created_at', '>=', sinceDate)
      .first()

    const uniqueQueries = Number(uniqueResult?.unique || 0)

    // Average results
    const avgResult = await db
      .from('search_events')
      .avg('results_count as avg')
      .where('created_at', '>=', sinceDate)
      .first()

    const avgResults = Number(avgResult?.avg || 0)

    // Zero result rate
    const zeroResultCount = await db
      .from('search_events')
      .count('* as count')
      .where('created_at', '>=', sinceDate)
      .where('results_count', 0)
      .first()

    const zeroResultRate = totalSearches > 0 ? (Number(zeroResultCount?.count || 0) / totalSearches) * 100 : 0

    // Top terms
    const topTermsResult = await db
      .from('search_events')
      .select('query')
      .count('* as searches')
      .where('created_at', '>=', sinceDate)
      .groupBy('query')
      .orderBy('searches', 'desc')
      .limit(5)

    const topTerms = topTermsResult.map((t) => ({
      term: t.query,
      searches: Number(t.searches),
    }))

    return {
      totalSearches,
      uniqueQueries,
      avgResults,
      zeroResultRate,
      topTerms,
    }
  }

  /**
   * Clean old search events
   */
  async cleanOldEvents(daysToKeep: number = 90): Promise<number> {
    const cutoffDate = DateTime.now().minus({ days: daysToKeep }).toSQL()

    const result = await db
      .from('search_events')
      .where('created_at', '<', cutoffDate)
      .delete()

    return result || 0
  }
}

/**
 * Export singleton instance
 */
export const searchAnalyticsService = SearchAnalyticsService.getInstance()
