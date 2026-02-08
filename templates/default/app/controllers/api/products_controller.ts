import type { HttpContext } from '@adonisjs/core/http'
import Product from '#models/product'
import ProductVariant from '#models/product_variant'
import { productSearchValidator } from '#validators/product_validator'

/**
 * ProductsController
 *
 * REST API controller for product operations.
 * Provides endpoints for listing, searching, and retrieving products.
 */
export default class ProductsController {
  /**
   * GET /api/products
   * List products with filtering, sorting, and pagination
   */
  async index({ request, response }: HttpContext) {
    const {
      page = 1,
      limit = 20,
      sort = 'created_at',
      order = 'desc',
      category,
      collection,
      search,
      minPrice,
      maxPrice,
      inStock,
      featured,
      tags,
    } = request.qs()

    const storeId = request.header('X-Store-ID') || 'default'

    const query = Product.query()
      .where('storeId', storeId)
      .where('status', 'active')
      .preload('images', (q) => q.orderBy('position', 'asc').limit(1))
      .preload('variants', (q) => q.where('isActive', true))

    // Apply filters
    if (category) {
      query.whereHas('categories', (q) => {
        q.where('slug', category)
      })
    }

    if (collection) {
      query.whereHas('collections', (q) => {
        q.where('slug', collection)
      })
    }

    if (search) {
      query.where((q) => {
        q.whereILike('title', `%${search}%`)
          .orWhereILike('description', `%${search}%`)
          .orWhereILike('sku', `%${search}%`)
      })
    }

    if (minPrice) {
      query.where('price', '>=', Number(minPrice))
    }

    if (maxPrice) {
      query.where('price', '<=', Number(maxPrice))
    }

    if (inStock === 'true') {
      query.where('trackInventory', false).orWhere('stockQuantity', '>', 0)
    }

    if (featured === 'true') {
      query.where('isFeatured', true)
    }

    if (tags) {
      const tagList = tags.split(',')
      query.whereHas('tags', (q) => {
        q.whereIn('slug', tagList)
      })
    }

    // Apply sorting
    const validSorts = ['created_at', 'title', 'price', 'popularity']
    const sortColumn = validSorts.includes(sort) ? sort : 'created_at'
    const sortOrder = order === 'asc' ? 'asc' : 'desc'
    query.orderBy(sortColumn, sortOrder)

    // Paginate
    const products = await query.paginate(page, Math.min(limit, 100))

    return response.json({
      data: products.all().map((p) => this.formatProduct(p)),
      meta: {
        total: products.total,
        perPage: products.perPage,
        currentPage: products.currentPage,
        lastPage: products.lastPage,
        firstPage: products.firstPage,
      },
    })
  }

  /**
   * GET /api/products/:id
   * Get a single product by ID or slug
   */
  async show({ params, request, response }: HttpContext) {
    const storeId = request.header('X-Store-ID') || 'default'
    const identifier = params.id

    const query = Product.query()
      .where('storeId', storeId)
      .where('status', 'active')
      .preload('images', (q) => q.orderBy('position', 'asc'))
      .preload('variants', (q) => q.where('isActive', true))
      .preload('categories')
      .preload('tags')
      .preload('reviews', (q) => q.where('status', 'approved').limit(10).preload('customer'))

    // Check if identifier is UUID or slug
    if (this.isUuid(identifier)) {
      query.where('id', identifier)
    } else {
      query.where('slug', identifier)
    }

    const product = await query.first()

    if (!product) {
      return response.notFound({ error: 'Product not found' })
    }

    return response.json({
      data: this.formatProductDetailed(product),
    })
  }

  /**
   * GET /api/products/:id/variants
   * Get product variants
   */
  async variants({ params, request, response }: HttpContext) {
    const storeId = request.header('X-Store-ID') || 'default'

    const product = await Product.query()
      .where('storeId', storeId)
      .where('id', params.id)
      .first()

    if (!product) {
      return response.notFound({ error: 'Product not found' })
    }

    const variants = await ProductVariant.query()
      .where('productId', product.id)
      .where('isActive', true)
      .orderBy('position', 'asc')

    return response.json({
      data: variants.map((v) => this.formatVariant(v)),
    })
  }

  /**
   * GET /api/products/:id/related
   * Get related products
   */
  async related({ params, request, response }: HttpContext) {
    const storeId = request.header('X-Store-ID') || 'default'
    const limit = Math.min(Number(request.qs().limit) || 8, 20)

    const product = await Product.query()
      .where('storeId', storeId)
      .where('id', params.id)
      .preload('categories')
      .first()

    if (!product) {
      return response.notFound({ error: 'Product not found' })
    }

    const categoryIds = product.categories.map((c) => c.id)

    // Find products in same categories
    const related = await Product.query()
      .where('storeId', storeId)
      .where('status', 'active')
      .whereNot('id', product.id)
      .whereHas('categories', (q) => {
        q.whereIn('id', categoryIds)
      })
      .preload('images', (q) => q.orderBy('position', 'asc').limit(1))
      .limit(limit)

    return response.json({
      data: related.map((p) => this.formatProduct(p)),
    })
  }

  /**
   * GET /api/products/search
   * Full-text search products
   */
  async search({ request, response }: HttpContext) {
    const payload = await request.validateUsing(productSearchValidator)
    const storeId = request.header('X-Store-ID') || 'default'

    const query = Product.query()
      .where('storeId', storeId)
      .where('status', 'active')
      .preload('images', (q) => q.orderBy('position', 'asc').limit(1))

    // Full-text search using PostgreSQL
    query.whereRaw(
      `to_tsvector('english', title || ' ' || COALESCE(description, '')) @@ plainto_tsquery('english', ?)`,
      [payload.query]
    )

    const products = await query
      .orderByRaw(
        `ts_rank(to_tsvector('english', title || ' ' || COALESCE(description, '')), plainto_tsquery('english', ?)) DESC`,
        [payload.query]
      )
      .limit(payload.limit || 20)

    return response.json({
      data: products.map((p) => this.formatProduct(p)),
      query: payload.query,
    })
  }

  /**
   * GET /api/products/featured
   * Get featured products
   */
  async featured({ request, response }: HttpContext) {
    const storeId = request.header('X-Store-ID') || 'default'
    const limit = Math.min(Number(request.qs().limit) || 8, 20)

    const products = await Product.query()
      .where('storeId', storeId)
      .where('status', 'active')
      .where('isFeatured', true)
      .preload('images', (q) => q.orderBy('position', 'asc').limit(1))
      .preload('variants', (q) => q.where('isActive', true))
      .orderBy('createdAt', 'desc')
      .limit(limit)

    return response.json({
      data: products.map((p) => this.formatProduct(p)),
    })
  }

  /**
   * GET /api/products/new
   * Get new arrivals
   */
  async newArrivals({ request, response }: HttpContext) {
    const storeId = request.header('X-Store-ID') || 'default'
    const limit = Math.min(Number(request.qs().limit) || 8, 20)

    const products = await Product.query()
      .where('storeId', storeId)
      .where('status', 'active')
      .preload('images', (q) => q.orderBy('position', 'asc').limit(1))
      .preload('variants', (q) => q.where('isActive', true))
      .orderBy('createdAt', 'desc')
      .limit(limit)

    return response.json({
      data: products.map((p) => this.formatProduct(p)),
    })
  }

  // Helper methods
  private formatProduct(product: Product) {
    return {
      id: product.id,
      name: product.title,
      slug: product.slug,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      sku: product.sku,
      inStock: !product.trackInventory || (product.stockQuantity || 0) > 0,
      image: product.images?.[0]?.url || null,
      hasVariants: product.hasVariants,
      variantCount: product.variants?.length || 0,
    }
  }

  private formatProductDetailed(product: Product) {
    return {
      id: product.id,
      name: product.title,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      costPrice: product.costPrice,
      sku: product.sku,
      barcode: product.barcode,
      inStock: !product.trackInventory || (product.stockQuantity || 0) > 0,
      stockQuantity: product.stockQuantity,
      trackInventory: product.trackInventory,
      weight: product.weight,
      weightUnit: product.weightUnit,
      hasVariants: product.hasVariants,
      images: product.images?.map((img) => ({
        id: img.id,
        url: img.url,
        alt: img.altText,
        position: img.position,
      })),
      variants: product.variants?.map((v) => this.formatVariant(v)),
      categories: product.categories?.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
      tags: product.tags?.map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
      })),
      reviews: {
        average: product.reviews?.length
          ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
          : 0,
        count: product.reviews?.length || 0,
        items: product.reviews?.map((r) => ({
          id: r.id,
          rating: r.rating,
          title: r.title,
          content: r.content,
          author: r.customer?.firstName || 'Anonymous',
          createdAt: r.createdAt,
        })),
      },
      seo: {
        title: product.metaTitle || product.title,
        description: product.metaDescription || product.shortDescription,
        keywords: product.metaKeywords,
      },
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }
  }

  private formatVariant(variant: ProductVariant) {
    return {
      id: variant.id,
      name: variant.title,
      sku: variant.sku,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice,
      inStock: !variant.trackInventory || (variant.stockQuantity || 0) > 0,
      stockQuantity: variant.stockQuantity,
      option1: variant.option1,
      option2: variant.option2,
      option3: variant.option3,
      imageId: variant.imageId,
      position: variant.position,
    }
  }

  private isUuid(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }
}
