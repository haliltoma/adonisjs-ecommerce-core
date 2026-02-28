import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import ProductService from '#services/product_service'
import CategoryService from '#services/category_service'
import CustomerService from '#services/customer_service'
import { SearchProvider } from '#contracts/search_provider'
import Banner from '#models/banner'
import Collection from '#models/collection'
import { DateTime } from 'luxon'

export default class HomeController {
  private productService: ProductService
  private categoryService: CategoryService
  private customerService: CustomerService

  constructor() {
    this.productService = new ProductService()
    this.categoryService = new CategoryService()
    this.customerService = new CustomerService()
  }

  async index({ inertia, store }: HttpContext) {
    const storeId = store.id

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

    const products = await this.productService.list({
      storeId,
      status: 'active',
      search: query,
      categoryId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: sortBy === 'price-asc' || sortBy === 'price-desc' ? 'price' : 'createdAt',
      sortDir: sortBy === 'price-asc' ? 'asc' : sortBy === 'price-desc' ? 'desc' : 'desc',
      page,
      limit: 24,
    })

    const categories = await this.categoryService.getRootCategories(storeId)

    return inertia.render('storefront/Search', {
      query,
      products: {
        data: products.all().map((p) => this.serializeProductCard(p)),
        meta: products.getMeta(),
      },
      filters: { sortBy, categoryId, minPrice, maxPrice },
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
    })
  }

  async searchSuggestions({ request, response, store }: HttpContext) {
    const query = request.input('q', '')

    if (!query || query.length < 2) {
      return response.json({ suggestions: [] })
    }

    try {
      const search = await app.container.make(SearchProvider)
      const suggestions = await search.getSuggestions(query, store.id, 6)
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
