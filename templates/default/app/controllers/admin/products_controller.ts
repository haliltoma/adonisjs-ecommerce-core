import type { HttpContext } from '@adonisjs/core/http'
import ProductService from '#services/product_service'
import CategoryService from '#services/category_service'
import Product from '#models/product'
import TaxClass from '#models/tax_class'
import Tag from '#models/tag'

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
    const limit = request.input('limit', 20)
    const status = request.input('status')
    const type = request.input('type')
    const categoryId = request.input('category')
    const search = request.input('search')
    const sortBy = request.input('sortBy', 'createdAt')
    const sortDir = request.input('sortDir', 'desc')

    const products = await this.productService.list({
      storeId,
      status,
      type,
      categoryId,
      search,
      sortBy,
      sortDir,
      page,
      limit,
    })

    const categories = await this.categoryService.getTree(storeId, true)

    return inertia.render('admin/products/Index', {
      products: {
        data: products.all().map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          status: p.status,
          type: p.type,
          price: p.price,
          compareAtPrice: p.compareAtPrice,
          sku: p.sku,
          isFeatured: p.isFeatured,
          thumbnail: p.images?.[0]?.url,
          variantCount: p.variants?.length || 0,
          createdAt: p.createdAt.toISO(),
        })),
        meta: products.getMeta(),
      },
      filters: { status, type, categoryId, search, sortBy, sortDir },
      categories,
    })
  }

  async create({ inertia, store }: HttpContext) {
    const storeId = store.id

    const categories = await this.categoryService.getTree(storeId, true)
    const taxClasses = await TaxClass.query().where('storeId', storeId)
    const tags = await Tag.query().where('storeId', storeId)

    return inertia.render('admin/products/Create', {
      categories,
      taxClasses: taxClasses.map((tc) => ({ id: tc.id, name: tc.name })),
      tags: tags.map((t) => ({ id: t.id, name: t.name })),
    })
  }

  async store({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const data = request.only([
      'title',
      'slug',
      'description',
      'shortDescription',
      'status',
      'type',
      'vendor',
      'sku',
      'barcode',
      'price',
      'compareAtPrice',
      'costPrice',
      'isTaxable',
      'taxClassId',
      'weight',
      'weightUnit',
      'requiresShipping',
      'isFeatured',
      'metaTitle',
      'metaDescription',
      'metaKeywords',
      'customFields',
      'categoryIds',
      'tagIds',
      'options',
      'variants',
      'images',
    ])

    try {
      const product = await this.productService.create({
        storeId,
        ...data,
      })

      session.flash('success', 'Product created successfully')
      return response.redirect().toRoute('admin.products.edit', { id: product.id })
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async show({ params, inertia }: HttpContext) {
    const product = await this.productService.findById(params.id)

    if (!product) {
      return inertia.render('admin/errors/NotFound', { resource: 'Product' })
    }

    return inertia.render('admin/products/Show', {
      product: this.serializeProduct(product),
    })
  }

  async edit({ params, inertia, store }: HttpContext) {
    const storeId = store.id
    const product = await this.productService.findById(params.id)

    if (!product) {
      return inertia.render('admin/errors/NotFound', { resource: 'Product' })
    }

    const categories = await this.categoryService.getTree(storeId, true)
    const taxClasses = await TaxClass.query().where('storeId', storeId)
    const tags = await Tag.query().where('storeId', storeId)

    return inertia.render('admin/products/Edit', {
      product: this.serializeProduct(product),
      categories,
      taxClasses: taxClasses.map((tc) => ({ id: tc.id, name: tc.name })),
      tags: tags.map((t) => ({ id: t.id, name: t.name })),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const data = request.only([
      'title',
      'slug',
      'description',
      'shortDescription',
      'status',
      'type',
      'vendor',
      'sku',
      'barcode',
      'price',
      'compareAtPrice',
      'costPrice',
      'isTaxable',
      'taxClassId',
      'weight',
      'weightUnit',
      'requiresShipping',
      'isFeatured',
      'metaTitle',
      'metaDescription',
      'metaKeywords',
      'customFields',
      'categoryIds',
      'tagIds',
    ])

    try {
      await this.productService.update(params.id, data)
      session.flash('success', 'Product updated successfully')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    try {
      await this.productService.delete(params.id)
      session.flash('success', 'Product deleted successfully')
      return response.redirect().toRoute('admin.products.index')
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async duplicate({ params, response, session, store }: HttpContext) {
    const storeId = store.id
    const original = await this.productService.findById(params.id)

    if (!original) {
      session.flash('error', 'Product not found')
      return response.redirect().back()
    }

    try {
      const duplicate = await this.productService.create({
        storeId,
        title: `${original.title} (Copy)`,
        slug: `${original.slug}-copy`,
        description: original.description || undefined,
        shortDescription: original.shortDescription || undefined,
        status: 'draft',
        type: original.type,
        vendor: original.vendor || undefined,
        price: original.price || undefined,
        compareAtPrice: original.compareAtPrice || undefined,
        costPrice: original.costPrice || undefined,
        isTaxable: original.isTaxable,
        taxClassId: original.taxClassId || undefined,
        weight: original.weight || undefined,
        weightUnit: original.weightUnit,
        requiresShipping: original.requiresShipping,
        isFeatured: false,
        metaTitle: original.metaTitle || undefined,
        metaDescription: original.metaDescription || undefined,
        metaKeywords: original.metaKeywords || undefined,
        categoryIds: original.categories?.map((c) => c.id),
        tagIds: original.tags?.map((t) => t.id),
      })

      session.flash('success', 'Product duplicated successfully')
      return response.redirect().toRoute('admin.products.edit', { id: duplicate.id })
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async bulkAction({ request, response, session }: HttpContext) {
    const { action, ids } = request.only(['action', 'ids'])

    if (!ids || ids.length === 0) {
      session.flash('error', 'No products selected')
      return response.redirect().back()
    }

    try {
      switch (action) {
        case 'delete':
          for (const id of ids) {
            await this.productService.delete(id)
          }
          session.flash('success', `${ids.length} products deleted`)
          break
        case 'publish':
          for (const id of ids) {
            await this.productService.update(id, { status: 'active' })
          }
          session.flash('success', `${ids.length} products published`)
          break
        case 'draft':
          for (const id of ids) {
            await this.productService.update(id, { status: 'draft' })
          }
          session.flash('success', `${ids.length} products set to draft`)
          break
        case 'archive':
          for (const id of ids) {
            await this.productService.update(id, { status: 'archived' })
          }
          session.flash('success', `${ids.length} products archived`)
          break
        default:
          session.flash('error', 'Unknown action')
      }
    } catch (error) {
      session.flash('error', error.message)
    }

    return response.redirect().back()
  }

  private serializeProduct(product: Product) {
    return {
      id: product.id,
      storeId: product.storeId,
      title: product.title,
      slug: product.slug,
      description: product.description,
      shortDescription: product.shortDescription,
      status: product.status,
      type: product.type,
      vendor: product.vendor,
      sku: product.sku,
      barcode: product.barcode,
      price: product.price,
      compareAtPrice: product.compareAtPrice,
      costPrice: product.costPrice,
      isTaxable: product.isTaxable,
      taxClassId: product.taxClassId,
      weight: product.weight,
      weightUnit: product.weightUnit,
      requiresShipping: product.requiresShipping,
      isFeatured: product.isFeatured,
      sortOrder: product.sortOrder,
      metaTitle: product.metaTitle,
      metaDescription: product.metaDescription,
      metaKeywords: product.metaKeywords,
      customFields: product.customFields,
      publishedAt: product.publishedAt?.toISO(),
      createdAt: product.createdAt.toISO(),
      updatedAt: product.updatedAt.toISO(),
      variants: product.variants?.map((v) => ({
        id: v.id,
        title: v.title,
        sku: v.sku,
        barcode: v.barcode,
        price: v.price,
        compareAtPrice: v.compareAtPrice,
        costPrice: v.costPrice,
        option1: v.option1,
        option2: v.option2,
        option3: v.option3,
        weight: v.weight,
        inventoryQuantity: v.inventoryQuantity,
        trackInventory: v.trackInventory,
        allowBackorder: v.allowBackorder,
        position: v.position,
        isActive: v.isActive,
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
        isPrimary: i.position === 0,
      })),
      categories: product.categories?.map((c) => ({ id: c.id, name: c.name })),
      tags: product.tags?.map((t) => ({ id: t.id, name: t.name })),
    }
  }
}
