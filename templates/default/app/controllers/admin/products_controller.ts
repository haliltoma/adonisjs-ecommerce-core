import type { HttpContext } from '@adonisjs/core/http'
import { createReadStream } from 'node:fs'
import ProductService from '#services/product_service'
import CategoryService from '#services/category_service'
import ImportExportService from '#services/import_export_service'
import { LocalMediaProvider } from '#services/media/local_media_provider'
import Product from '#models/product'
import TaxClass from '#models/tax_class'
import Tag from '#models/tag'

export default class ProductsController {
  private productService: ProductService
  private categoryService: CategoryService
  private importExportService: ImportExportService

  constructor() {
    this.productService = new ProductService()
    this.categoryService = new CategoryService()
    this.importExportService = new ImportExportService()
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
    const raw = request.only([
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

    const data = {
      ...raw,
      description: raw.description || undefined,
      shortDescription: raw.shortDescription || undefined,
      vendor: raw.vendor || undefined,
      sku: raw.sku || undefined,
      barcode: raw.barcode || undefined,
      price: raw.price !== '' && raw.price != null ? Number(raw.price) : undefined,
      compareAtPrice: raw.compareAtPrice !== '' && raw.compareAtPrice != null ? Number(raw.compareAtPrice) : undefined,
      costPrice: raw.costPrice !== '' && raw.costPrice != null ? Number(raw.costPrice) : undefined,
      taxClassId: raw.taxClassId || undefined,
      weight: raw.weight !== '' && raw.weight != null ? Number(raw.weight) : undefined,
      metaTitle: raw.metaTitle || undefined,
      metaDescription: raw.metaDescription || undefined,
      metaKeywords: raw.metaKeywords || undefined,
      variants: raw.variants?.map((v: any, idx: number) => ({
        title: v.title || '',
        sku: v.sku || '',
        barcode: v.barcode || undefined,
        price: v.price !== '' && v.price != null ? Number(v.price) : 0,
        compareAtPrice: v.compareAtPrice !== '' && v.compareAtPrice != null ? Number(v.compareAtPrice) : undefined,
        costPrice: v.costPrice !== '' && v.costPrice != null ? Number(v.costPrice) : undefined,
        option1: v.option1 || undefined,
        option2: v.option2 || undefined,
        option3: v.option3 || undefined,
        weight: v.weight !== '' && v.weight != null ? Number(v.weight) : undefined,
        position: v.position ?? idx,
        isActive: v.isActive ?? true,
        inventoryQuantity: v.inventoryQuantity != null ? Number(v.inventoryQuantity) : 0,
      })),
    }

    try {
      const product = await this.productService.create({
        storeId,
        ...data,
      })

      session.flash('success', 'Product created successfully')
      return response.redirect().toRoute('admin.products.edit', { id: product.id })
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
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
    const raw = request.only([
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

    const data = {
      ...raw,
      description: raw.description || undefined,
      shortDescription: raw.shortDescription || undefined,
      vendor: raw.vendor || undefined,
      sku: raw.sku || undefined,
      barcode: raw.barcode || undefined,
      price: raw.price !== '' && raw.price != null ? Number(raw.price) : undefined,
      compareAtPrice: raw.compareAtPrice !== '' && raw.compareAtPrice != null ? Number(raw.compareAtPrice) : undefined,
      costPrice: raw.costPrice !== '' && raw.costPrice != null ? Number(raw.costPrice) : undefined,
      taxClassId: raw.taxClassId || undefined,
      weight: raw.weight !== '' && raw.weight != null ? Number(raw.weight) : undefined,
      metaTitle: raw.metaTitle || undefined,
      metaDescription: raw.metaDescription || undefined,
      metaKeywords: raw.metaKeywords || undefined,
      variants: raw.variants?.map((v: any, idx: number) => ({
        title: v.title || '',
        sku: v.sku || '',
        barcode: v.barcode || undefined,
        price: v.price !== '' && v.price != null ? Number(v.price) : 0,
        compareAtPrice: v.compareAtPrice !== '' && v.compareAtPrice != null ? Number(v.compareAtPrice) : undefined,
        costPrice: v.costPrice !== '' && v.costPrice != null ? Number(v.costPrice) : undefined,
        option1: v.option1 || undefined,
        option2: v.option2 || undefined,
        option3: v.option3 || undefined,
        weight: v.weight !== '' && v.weight != null ? Number(v.weight) : undefined,
        position: v.position ?? idx,
        isActive: v.isActive ?? true,
        inventoryQuantity: v.inventoryQuantity != null ? Number(v.inventoryQuantity) : 0,
      })),
    }

    try {
      await this.productService.update(params.id, data)
      session.flash('success', 'Product updated successfully')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    try {
      await this.productService.delete(params.id)
      session.flash('success', 'Product deleted successfully')
      return response.redirect().toRoute('admin.products.index')
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
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
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
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
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
    }

    return response.redirect().back()
  }

  async importPage({ inertia }: HttpContext) {
    return inertia.render('admin/products/Import', {})
  }

  async exportPage({ inertia, store }: HttpContext) {
    const stats = await this.importExportService.getExportStats(store.id)
    return inertia.render('admin/products/Export', { stats })
  }

  async processImport({ request, response, session, store }: HttpContext) {
    const file = request.file('file', { size: '10mb', extnames: ['csv'] })

    if (!file || file.hasErrors) {
      session.flash('error', file?.errors?.[0]?.message || 'Invalid file')
      return response.redirect().back()
    }

    const content = await import('node:fs/promises').then((fs) => fs.readFile(file.tmpPath!, 'utf-8'))
    const rows = this.importExportService.parseCSV(content)
    const result = await this.importExportService.importProducts(store.id, rows)

    session.flash('success', `Import complete: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`)
    if (result.errors.length > 0) {
      session.flash('importErrors', JSON.stringify(result.errors.slice(0, 20)))
    }
    return response.redirect().back()
  }

  async processExport({ request, response, store }: HttpContext) {
    const type = request.input('type', 'products') as 'products' | 'customers' | 'orders' | 'inventory'
    const fields = request.input('fields', []) as string[]
    const filters = request.input('filters', {}) as Record<string, string>

    let csv: string
    let filename: string

    switch (type) {
      case 'customers':
        csv = await this.importExportService.exportCustomers(store.id, { fields, filters })
        filename = `customers-export-${Date.now()}.csv`
        break
      case 'orders':
        csv = await this.importExportService.exportOrders(store.id, { fields, filters })
        filename = `orders-export-${Date.now()}.csv`
        break
      case 'inventory':
        csv = await this.importExportService.exportInventory(store.id, { fields, filters })
        filename = `inventory-export-${Date.now()}.csv`
        break
      default:
        csv = await this.importExportService.exportProducts(store.id, { fields, filters })
        filename = `products-export-${Date.now()}.csv`
    }

    response.header('Content-Type', 'text/csv')
    response.header('Content-Disposition', `attachment; filename="${filename}"`)
    return response.send(csv)
  }

  async downloadTemplate({ response }: HttpContext) {
    const csv = this.importExportService.generateTemplate('products')

    response.header('Content-Type', 'text/csv')
    response.header('Content-Disposition', 'attachment; filename="products-template.csv"')
    return response.send(csv)
  }

  async uploadImages({ request, response }: HttpContext) {
    const files = request.files('files', {
      size: '5mb',
      extnames: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    })

    if (!files || files.length === 0) {
      return response.status(400).json({ error: 'No files provided' })
    }

    const mediaProvider = new LocalMediaProvider()
    const results = []

    for (const file of files) {
      if (file.hasErrors) continue

      const result = await mediaProvider.upload({
        file: createReadStream(file.tmpPath!),
        fileName: file.clientName,
        mimeType: `${file.type}/${file.subtype}`,
        directory: 'products',
      })

      if (result.success) {
        results.push({
          id: `img-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          url: result.url,
          name: file.clientName,
          size: result.size,
          type: `${file.type}/${file.subtype}`,
        })
      }
    }

    return response.json(results)
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
