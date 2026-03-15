import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import { useProductService } from '#services/service_container'
import { useCategoryService } from '#services/service_container'
import { useCustomerService } from '#services/service_container'
import { SearchProvider } from '#contracts/search_provider'
import { meilisearchService } from '#services/meilisearch_service'
import { searchAnalyticsService } from '#services/search_analytics_service'
import Banner from '#models/banner'
import Collection from '#models/collection'
import Page from '#models/page'
import { DateTime } from 'luxon'

export default class HomeController {
  private productService = useProductService()
  private categoryService = useCategoryService()
  private customerService = useCustomerService()

  async index({ inertia, store }: HttpContext) {
    const storeId = store.id

    // Check for Puck home template
    const homeTemplate = await Page.query()
      .where('storeId', storeId)
      .where('pageType', 'home')
      .where('status', 'published')
      .first()

    // Get featured products
    const featuredProducts = await this.productService.getFeatured(storeId, 8)

    // Get active banners
    const now = DateTime.now()
    const banners = await Banner.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .where((query) => {
        query.whereNull('startsAt').orWhere('startsAt', '<=', now.toSQL())
      })
      .where((query) => {
        query.whereNull('endsAt').orWhere('endsAt', '>=', now.toSQL())
      })
      .orderBy('sortOrder', 'asc')
      .limit(5)

    // Get featured collections
    const collections = await Collection.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .orderBy('sortOrder', 'asc')
      .limit(6)

    // Get root categories
    const categories = await this.categoryService.getRootCategories(storeId)

    // Get new arrivals
    const newArrivals = await this.productService.list({
      storeId,
      status: 'active',
      sortBy: 'createdAt',
      sortDir: 'desc',
      limit: 8,
    })

    return inertia.render('storefront/Home', {
      store: {
        name: store.name,
        logoUrl: store.logoUrl,
      },
      puckContent: homeTemplate?.content || null,
      banners: banners.map((b) => ({
        id: b.id,
        title: b.title,
        subtitle: b.subtitle,
        imageUrl: b.imageUrl,
        mobileImageUrl: b.mobileImageUrl,
        linkUrl: b.linkUrl,
        linkTarget: b.linkTarget,
      })),
      featuredProducts: featuredProducts.map((p) => this.serializeProductCard(p)),
      newArrivals: newArrivals.all().map((p) => this.serializeProductCard(p)),
      collections: collections.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        imageUrl: c.imageUrl,
      })),
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        imageUrl: c.imageUrl,
      })),
    })
  }

  async search({ inertia, request, store }: HttpContext) {
    const storeId = store.id
    const query = request.input('q', '')
    const page = request.input('page', 1)
    const sortBy = request.input('sort', 'relevance')
    const categoryId = request.input('category')
    const minPrice = request.input('minPrice')
    const maxPrice = request.input('maxPrice')
    const inStock = request.input('inStock')
    const onSale = request.input('onSale')
    const tags = request.input('tags')

    if (!query) {
      const categories = await this.categoryService.getRootCategories(storeId)
      return inertia.render('storefront/Search', {
        query: '',
        products: { data: [], meta: {} },
        filters: {},
        categories: categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        })),
      })
    }

    // Determine sort parameters
    let sortField: 'price' | 'name' | 'created_at' | 'popularity' = 'created_at'
    let sortOrder: 'asc' | 'desc' = 'desc'

    if (sortBy === 'price-asc') {
      sortField = 'price'
      sortOrder = 'asc'
    } else if (sortBy === 'price-desc') {
      sortField = 'price'
      sortOrder = 'desc'
    } else if (sortBy === 'name-asc') {
      sortField = 'name'
      sortOrder = 'asc'
    } else if (sortBy === 'name-desc') {
      sortField = 'name'
      sortOrder = 'desc'
    }

    // Use MeiliSearch service
    const offset = (page - 1) * 24
    const searchResults = await meilisearchService.search({
      query,
      categoryId,
      priceMin: minPrice ? Number(minPrice) : undefined,
      priceMax: maxPrice ? Number(maxPrice) : undefined,
      inStock,
      onSale,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : undefined,
      sortBy: sortField,
      sortOrder,
      limit: 24,
      offset,
    })

    // Track search for analytics
    searchAnalyticsService.trackSearch({
      query,
      resultsCount: searchResults.estimatedTotalHits,
      filters: { categoryId, minPrice, maxPrice, inStock, onSale, tags },
      sessionId: request.cookie('session_id'),
      ipAddress: request.ip(),
      userAgent: request.header('user-agent'),
    })

    const categories = await this.categoryService.getRootCategories(storeId)

    return inertia.render('storefront/Search', {
      query,
      products: {
        data: searchResults.hits.map((p) => this.serializeProductCard(p)),
        meta: {
          total: searchResults.estimatedTotalHits,
          currentPage: page,
          perPage: 24,
          lastPage: Math.ceil(searchResults.estimatedTotalHits / 24),
        },
      },
      filters: { sortBy, categoryId, minPrice, maxPrice, inStock, onSale, tags },
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
    })
  }

  async searchSuggestions({ request, response }: HttpContext) {
    const query = request.input('q', '')

    if (!query || query.length < 2) {
      return response.json({ suggestions: [] })
    }

    try {
      const suggestions = await meilisearchService.getSuggestions(query, 6)
      return response.json({ suggestions })
    } catch {
      return response.json({ suggestions: [] })
    }
  }

  async subscribe({ request, response, session, store }: HttpContext) {
    const { email } = request.only(['email'])

    if (!email) {
      session.flash('error', 'Email is required')
      return response.redirect().back()
    }

    try {
      const existing = await this.customerService.findByEmail(store.id, email)

      if (existing) {
        existing.acceptsMarketing = true
        await existing.save()
      } else {
        await this.customerService.create({
          storeId: store.id,
          email,
          firstName: '',
          lastName: '',
          acceptsMarketing: true,
        })
      }

      session.flash('success', 'Thank you for subscribing!')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', 'Failed to subscribe. Please try again.')
      return response.redirect().back()
    }
  }

  private serializeProductCard(product: any) {
    const defaultVariant = product.variants?.find((v: any) => v.position === 0) || product.variants?.[0]

    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: defaultVariant?.price || product.price,
      compareAtPrice: defaultVariant?.compareAtPrice || product.compareAtPrice,
      thumbnail: product.images?.[0]?.url,
      isOnSale: product.isOnSale,
      discountPercentage: product.discountPercentage,
    }
  }
}
