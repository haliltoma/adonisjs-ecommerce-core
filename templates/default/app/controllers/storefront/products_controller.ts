import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import vine from '@vinejs/vine'
import ProductService from '#services/product_service'
import CategoryService from '#services/category_service'
import Product from '#models/product'
import Collection from '#models/collection'
import Review from '#models/review'

export default class ProductsController {
  private productService: ProductService
  private categoryService: CategoryService

  constructor() {
    this.productService = new ProductService()
    this.categoryService = new CategoryService()
  }

  async index({ inertia, request, store }: HttpContext) {
    const storeId = store.id
    const page = request.input('page', 1)
    const sortBy = request.input('sort', 'newest')
    const categoryId = request.input('category')
    const minPrice = request.input('minPrice')
    const maxPrice = request.input('maxPrice')
    const isFeatured = request.input('featured')

    const products = await this.productService.list({
      storeId,
      status: 'active',
      categoryId,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      isFeatured: isFeatured === 'true' ? true : undefined,
      sortBy: sortBy === 'price-asc' || sortBy === 'price-desc' ? 'price' : 'createdAt',
      sortDir: sortBy === 'price-asc' ? 'asc' : sortBy === 'price-desc' ? 'desc' : 'desc',
      page,
      limit: 24,
    })

    const categories = await this.categoryService.getTree(storeId)

    return inertia.render('storefront/products/Index', {
      products: {
        data: products.all().map((p) => this.serializeProductCard(p)),
        meta: products.getMeta(),
      },
      filters: { sortBy, categoryId, minPrice, maxPrice, isFeatured },
      categories,
      priceRange: { min: 0, max: 10000 },
    })
  }

  async show({ params, inertia, store }: HttpContext) {
    const storeId = store.id
    const product = await this.productService.findBySlug(storeId, params.slug)

    if (!product || product.status !== 'active') {
      return inertia.render('storefront/errors/NotFound', { resource: 'Product' })
    }

    // Get related products
    const relatedProducts = await this.productService.getRelated(product.id, 4)

    // Get reviews
    const reviews = await Review.query()
      .where('productId', product.id)
      .where('status', 'approved')
      .preload('customer')
      .orderBy('createdAt', 'desc')
      .limit(10)

    // Calculate review stats
    const reviewStats = await db
      .from('reviews')
      .where('product_id', product.id)
      .where('status', 'approved')
      .select(
        db.raw('COUNT(*) as total'),
        db.raw('AVG(rating) as average'),
        db.raw('COUNT(CASE WHEN rating = 5 THEN 1 END) as five_star'),
        db.raw('COUNT(CASE WHEN rating = 4 THEN 1 END) as four_star'),
        db.raw('COUNT(CASE WHEN rating = 3 THEN 1 END) as three_star'),
        db.raw('COUNT(CASE WHEN rating = 2 THEN 1 END) as two_star'),
        db.raw('COUNT(CASE WHEN rating = 1 THEN 1 END) as one_star')
      )
      .first()

    // Get breadcrumb
    const breadcrumb = product.categories?.[0]
      ? await this.categoryService.getAncestors(product.categories[0].id)
      : []

    return inertia.render('storefront/products/Show', {
      product: this.serializeProduct(product),
      relatedProducts: relatedProducts.map((p) => this.serializeProductCard(p)),
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        content: r.content,
        isVerifiedPurchase: r.isVerifiedPurchase,
        customerName: r.customer ? `${r.customer.firstName} ${r.customer.lastName?.charAt(0) || ''}.` : 'Anonymous',
        createdAt: r.createdAt.toISO(),
      })),
      reviewStats: reviewStats || {
        total: 0,
        average: 0,
        five_star: 0,
        four_star: 0,
        three_star: 0,
        two_star: 0,
        one_star: 0,
      },
      breadcrumb: [
        ...breadcrumb.map((c) => ({ name: c.name, slug: c.slug })),
        ...(product.categories?.[0] ? [{ name: product.categories[0].name, slug: product.categories[0].slug }] : []),
      ],
    })
  }

  async submitReview({ params, request, response, session, store }: HttpContext) {
    const reviewValidator = vine.compile(
      vine.object({
        rating: vine.number().min(1).max(5),
        title: vine.string().trim().maxLength(200).optional(),
        content: vine.string().trim().minLength(1).maxLength(5000),
      })
    )

    try {
      const payload = await request.validateUsing(reviewValidator)

      const product = await this.productService.findBySlug(store.id, params.slug)
      if (!product || product.status !== 'active') {
        session.flash('error', 'Product not found.')
        return response.redirect().back()
      }

      const customerId = session.get('customer_id') || null

      await Review.create({
        storeId: store.id,
        productId: product.id,
        customerId,
        rating: payload.rating,
        title: payload.title || null,
        content: payload.content,
        status: 'pending',
        isVerifiedPurchase: false,
        helpfulCount: 0,
        reportCount: 0,
      })

      session.flash('success', 'Your review has been submitted and is pending approval.')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', 'There was a problem submitting your review. Please try again.')
      return response.redirect().back()
    }
  }

  async byCategory({ params, inertia, request, store }: HttpContext) {
    const storeId = store.id
    const category = await this.categoryService.findBySlug(storeId, params.slug)

    if (!category || !category.isActive) {
      return inertia.render('storefront/errors/NotFound', { resource: 'Category' })
    }

    const page = request.input('page', 1)
    const sortBy = request.input('sort', 'newest')
    const minPrice = request.input('minPrice')
    const maxPrice = request.input('maxPrice')

    const products = await this.productService.list({
      storeId,
      status: 'active',
      categoryId: category.id,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      sortBy: sortBy === 'price-asc' || sortBy === 'price-desc' ? 'price' : 'createdAt',
      sortDir: sortBy === 'price-asc' ? 'asc' : sortBy === 'price-desc' ? 'desc' : 'desc',
      page,
      limit: 24,
    })

    const ancestors = await this.categoryService.getAncestors(category.id)
    const children = await this.categoryService.getChildren(category.id)

    return inertia.render('storefront/products/Category', {
      category: {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        imageUrl: category.imageUrl,
      },
      products: {
        data: products.all().map((p) => this.serializeProductCard(p)),
        meta: products.getMeta(),
      },
      filters: { sortBy, minPrice, maxPrice },
      breadcrumb: ancestors.map((c) => ({ name: c.name, slug: c.slug })),
      subcategories: children.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        imageUrl: c.imageUrl,
      })),
    })
  }

  async collections({ inertia, store }: HttpContext) {
    const Category = (await import('#models/category')).default
    const categories = await Category.query()
      .where('storeId', store.id)
      .where('isActive', true)
      .whereNull('parentId')
      .orderBy('position', 'asc')

    return inertia.render('storefront/Collections', {
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
      })),
    })
  }

  async showCollection({ params, inertia, request, store }: HttpContext) {
    const collection = await Collection.query()
      .where('storeId', store.id)
      .where('slug', params.slug)
      .where('isActive', true)
      .first()

    if (!collection) {
      return inertia.render('storefront/errors/NotFound', { resource: 'Collection' })
    }

    const page = request.input('page', 1)
    const sortBy = request.input('sort', 'newest')

    const productsQuery = collection
      .related('products')
      .query()
      .where('status', 'active')
      .preload('images', (q) => q.orderBy('position', 'asc'))
      .preload('variants', (q) => q.orderBy('position', 'asc'))

    if (sortBy === 'price-asc') {
      productsQuery.orderBy('price', 'asc')
    } else if (sortBy === 'price-desc') {
      productsQuery.orderBy('price', 'desc')
    } else {
      productsQuery.orderBy('createdAt', 'desc')
    }

    const products = await productsQuery.paginate(page, 24)

    return inertia.render('storefront/products/Category', {
      category: {
        id: collection.id,
        name: collection.name,
        slug: collection.slug,
        description: collection.description,
        imageUrl: collection.imageUrl,
      },
      products: {
        data: products.all().map((p) => this.serializeProductCard(p)),
        meta: products.getMeta(),
      },
      filters: { sortBy },
      breadcrumb: [{ name: 'Collections', slug: 'collections' }],
      subcategories: [],
    })
  }

  async compare({ inertia }: HttpContext) {
    return inertia.render('storefront/Compare')
  }

  async allCategories({ inertia, store }: HttpContext) {
    const Category = (await import('#models/category')).default
    const categories = await Category.query()
      .where('storeId', store.id)
      .where('isActive', true)
      .orderBy('depth', 'asc')
      .orderBy('position', 'asc')

    return inertia.render('storefront/Categories', {
      categories: categories.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        description: c.description,
        imageUrl: c.imageUrl,
        parentId: c.parentId,
        depth: c.depth,
      })),
    })
  }

  private serializeProduct(product: Product) {
    return {
      id: product.id,
      title: product.title,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      isOnSale: product.isOnSale,
      discountPercentage: product.discountPercentage,
      sku: product.sku,
      type: product.type,
      vendor: product.vendor,
      isTaxable: product.isTaxable,
      requiresShipping: product.requiresShipping,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      variants: product.variants?.map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        option1: v.option1,
        option2: v.option2,
        option3: v.option3,
        inventoryQuantity: v.inventoryQuantity,
        trackInventory: v.trackInventory,
        allowBackorder: v.allowBackorder,
        position: v.position,
        isAvailable: !v.trackInventory || v.inventoryQuantity > 0 || v.allowBackorder,
      })),
      options: product.options?.map((o) => ({
        id: o.id,
        name: o.name,
        values: o.values,
        position: o.position,
      })),
      images: product.images?.map((i) => ({
        id: i.id,
        url: i.url,
        alt: i.altText,
        position: i.position,
      })),
      categories: product.categories?.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
      })),
      tags: product.tags?.map((t) => ({
        id: t.id,
        name: t.name,
      })),
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
