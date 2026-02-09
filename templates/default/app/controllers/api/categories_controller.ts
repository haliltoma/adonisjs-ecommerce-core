import type { HttpContext } from '@adonisjs/core/http'
import Category from '#models/category'

/**
 * CategoriesController
 *
 * REST API controller for category operations.
 * Provides endpoints for listing and retrieving categories.
 */
export default class CategoriesController {
  /**
   * GET /api/categories
   * List all categories (hierarchical)
   */
  async index({ request, response, store }: HttpContext) {
    const storeId = store.id
    const { flat } = request.qs()

    const categories = await Category.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .orderBy('position', 'asc')
      .orderBy('name', 'asc')

    if (flat === 'true') {
      return response.json({
        data: categories.map((c) => this.formatCategory(c)),
      })
    }

    // Build hierarchical tree
    const tree = this.buildTree(categories)

    return response.json({
      data: tree,
    })
  }

  /**
   * GET /api/categories/:id
   * Get a single category with products
   */
  async show({ params, request, response, store }: HttpContext) {
    const storeId = store.id
    const identifier = params.id

    const query = Category.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .preload('children', (q) => q.where('isActive', true).orderBy('position', 'asc'))

    // Check if identifier is UUID or slug
    if (this.isUuid(identifier)) {
      query.where('id', identifier)
    } else {
      query.where('slug', identifier)
    }

    const category = await query.first()

    if (!category) {
      return response.notFound({ error: 'Category not found' })
    }

    // Get products in this category
    const { page = 1, limit = 20, sort = 'created_at', order = 'desc' } = request.qs()

    const Product = (await import('#models/product')).default
    const products = await Product.query()
      .where('storeId', storeId)
      .where('status', 'active')
      .whereHas('categories', (q) => {
        q.where('id', category.id)
      })
      .preload('images', (q) => q.orderBy('position', 'asc').limit(1))
      .preload('variants', (q) => q.where('isActive', true))
      .orderBy(sort, order)
      .paginate(page, Math.min(limit, 100))

    return response.json({
      data: {
        category: this.formatCategoryDetailed(category),
        products: {
          data: products.all().map((p) => this.formatProduct(p)),
          meta: {
            total: products.total,
            perPage: products.perPage,
            currentPage: products.currentPage,
            lastPage: products.lastPage,
          },
        },
      },
    })
  }

  /**
   * GET /api/categories/:id/breadcrumb
   * Get category breadcrumb
   */
  async breadcrumb({ params, response, store }: HttpContext) {
    const storeId = store.id

    const category = await Category.query()
      .where('storeId', storeId)
      .where('id', params.id)
      .first()

    if (!category) {
      return response.notFound({ error: 'Category not found' })
    }

    const breadcrumb = await this.buildBreadcrumb(category)

    return response.json({
      data: breadcrumb,
    })
  }

  /**
   * GET /api/categories/tree
   * Get full category tree
   */
  async tree({ response, store }: HttpContext) {
    const storeId = store.id

    const categories = await Category.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .orderBy('position', 'asc')
      .orderBy('name', 'asc')

    const tree = this.buildTree(categories)

    return response.json({
      data: tree,
    })
  }

  // Helper methods
  private buildTree(categories: (Category & { $extras?: { products_count?: number } })[]): any[] {
    const map = new Map<string, any>()
    const roots: any[] = []

    // Create map
    for (const category of categories) {
      map.set(category.id, {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.imageUrl,
        position: category.position,
        productCount: category.$extras?.products_count ?? 0,
        children: [],
      })
    }

    // Build tree
    for (const category of categories) {
      const node = map.get(category.id)
      if (category.parentId && map.has(category.parentId)) {
        map.get(category.parentId).children.push(node)
      } else {
        roots.push(node)
      }
    }

    return roots
  }

  private async buildBreadcrumb(category: Category): Promise<any[]> {
    const breadcrumb: any[] = []
    let current: Category | null = category

    while (current) {
      breadcrumb.unshift({
        id: current.id,
        name: current.name,
        slug: current.slug,
      })

      if (current.parentId) {
        current = await Category.find(current.parentId)
      } else {
        current = null
      }
    }

    return breadcrumb
  }

  private formatCategory(category: Category & { $extras?: { products_count?: number } }) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.imageUrl,
      parentId: category.parentId,
      position: category.position,
      productCount: category.$extras?.products_count ?? 0,
    }
  }

  private formatCategoryDetailed(category: Category & { $extras?: { products_count?: number } }) {
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.imageUrl,
      parentId: category.parentId,
      position: category.position,
      productCount: category.$extras?.products_count ?? 0,
      children: category.children?.map((c: Category & { $extras?: { products_count?: number } }) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        productCount: c.$extras?.products_count ?? 0,
      })),
      seo: {
        title: category.metaTitle || category.name,
        description: category.metaDescription || category.description,
      },
    }
  }

  private formatProduct(product: any) {
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
    }
  }

  private isUuid(str: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    return uuidRegex.test(str)
  }
}
