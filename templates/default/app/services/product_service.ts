import { DateTime } from 'luxon'
import Product from '#models/product'
import { ModelPaginatorContract } from '#models/cart'
import type IProductRepository from '#repositories/interfaces/i_product_repository'
import ProductSlugGenerator from '#services/product/product_slug_generator'
import ProductVariantManager from '#services/product/product_variant_manager'
import ProductImageManager from '#services/product/product_image_manager'
import ProductCategoryManager from '#services/product/product_category_manager'
import ProductInventoryManager from '#services/product/product_inventory_manager'
import ProductOptionManager from '#services/product/product_option_manager'
import ProductTagManager from '#services/product/product_tag_manager'

interface CreateProductDTO {
  storeId: string
  title: string
  slug?: string
  description?: string
  shortDescription?: string
  status?: 'draft' | 'active' | 'archived'
  type?: 'simple' | 'variable' | 'digital' | 'bundle' | 'subscription'
  vendor?: string
  sku?: string
  barcode?: string
  price?: number
  compareAtPrice?: number
  costPrice?: number
  isTaxable?: boolean
  taxClassId?: string
  weight?: number
  weightUnit?: 'g' | 'kg' | 'lb' | 'oz'
  requiresShipping?: boolean
  isFeatured?: boolean
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
  customFields?: Record<string, unknown>
  categoryIds?: string[]
  tagIds?: string[]
  options?: { name: string; values: string[] }[]
  variants?: {
    title: string
    sku: string
    barcode?: string
    price: number
    compareAtPrice?: number
    costPrice?: number
    option1?: string
    option2?: string
    option3?: string
    weight?: number
    position?: number
    isActive?: boolean
    trackInventory?: boolean
    allowBackorder?: boolean
    inventoryQuantity?: number
  }[]
  images?: { url: string; alt?: string; position?: number }[]
}

interface ProductFilters {
  storeId: string
  status?: 'draft' | 'active' | 'archived'
  type?: string
  categoryId?: string
  tagId?: string
  minPrice?: number
  maxPrice?: number
  search?: string
  isFeatured?: boolean
  sortBy?: 'title' | 'price' | 'createdAt' | 'updatedAt'
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export default class ProductService {
  /**
   * Constructor with dependency injection
   * Following SOLID principles: Dependency Inversion
   */
  constructor(
    private productRepository: IProductRepository,
    private slugGenerator: ProductSlugGenerator,
    private variantManager: ProductVariantManager,
    private imageManager: ProductImageManager,
    private categoryManager: ProductCategoryManager,
    private inventoryManager: ProductInventoryManager,
    private optionManager: ProductOptionManager,
    private tagManager: ProductTagManager
  ) {}

  /**
   * Create new product with all related entities
   * Following SOLID principles: Single Responsibility (orchestration only)
   */
  async create(data: CreateProductDTO): Promise<Product> {
    return await this.productRepository.transaction(async (trx) => {
      // Generate unique slug
      const slug = await this.slugGenerator.generate(
        data.title || `product-${Date.now()}`,
        data.storeId,
        this.productRepository,
        data.slug
      )

      // Create base product
      const product = await this.productRepository.create(
        {
          storeId: data.storeId,
          title: data.title,
          slug,
          description: data.description,
          shortDescription: data.shortDescription,
          status: data.status || 'draft',
          type: data.type || 'simple',
          vendor: data.vendor,
          sku: data.sku,
          barcode: data.barcode,
          price: data.price,
          compareAtPrice: data.compareAtPrice,
          costPrice: data.costPrice,
          isTaxable: data.isTaxable ?? true,
          taxClassId: data.taxClassId,
          weight: data.weight,
          weightUnit: data.weightUnit || 'g',
          requiresShipping: data.requiresShipping ?? true,
          isFeatured: data.isFeatured ?? false,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
          customFields: data.customFields || {},
        },
        trx
      )

      // Attach categories
      if (data.categoryIds?.length) {
        await this.categoryManager.attachCategories(product.id, data.categoryIds, trx)
      }

      // Attach tags
      if (data.tagIds?.length) {
        await this.tagManager.attachTags(product.id, data.tagIds, trx)
      }

      // Create options
      if (data.options?.length) {
        const optionsData = data.options.map((opt, index) => ({
          productId: product.id,
          name: opt.name,
          values: opt.values,
          position: index,
        }))
        await this.optionManager.createOptions(product.id, optionsData, trx)
      }

      // Create variants
      if (data.variants?.length) {
        const variantsData = data.variants.map((variant, index) => ({
          productId: product.id,
          title: variant.title,
          sku: variant.sku,
          barcode: variant.barcode,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          costPerItem: variant.costPrice,
          option1: variant.option1,
          option2: variant.option2,
          option3: variant.option3,
          weight: variant.weight,
          position: variant.position ?? index,
          isActive: variant.isActive ?? true,
          trackInventory: variant.trackInventory ?? false,
          allowBackorder: variant.allowBackorder ?? false,
          quantityAvailable: variant.stockQuantity ?? 0,
        }))
        await this.variantManager.createVariants(product.id, variantsData, trx)
      }

      // Create images
      if (data.images?.length) {
        const imagesData = data.images.map((img, index) => ({
          productId: product.id,
          url: img.url,
          altText: img.alt,
          position: img.position ?? index,
        }))
        await this.imageManager.createImages(product.id, imagesData, trx)
      }

      return product
    })
  }

  /**
   * Update product and sync all related entities
   * Following SOLID principles: Single Responsibility (orchestration only)
   */
  async update(productId: string, data: Partial<CreateProductDTO>): Promise<Product> {
    return await this.productRepository.transaction(async (trx) => {
      // Update base product
      const product = await this.productRepository.update(
        productId,
        {
          title: data.title,
          slug: data.slug,
          description: data.description,
          shortDescription: data.shortDescription,
          status: data.status,
          type: data.type,
          vendor: data.vendor,
          sku: data.sku,
          barcode: data.barcode,
          price: data.price,
          compareAtPrice: data.compareAtPrice,
          costPrice: data.costPrice,
          isTaxable: data.isTaxable,
          taxClassId: data.taxClassId,
          weight: data.weight,
          weightUnit: data.weightUnit,
          requiresShipping: data.requiresShipping,
          isFeatured: data.isFeatured,
          metaTitle: data.metaTitle,
          metaDescription: data.metaDescription,
          metaKeywords: data.metaKeywords,
          customFields: data.customFields,
        },
        trx
      )

      // Sync categories
      if (data.categoryIds !== undefined) {
        await this.categoryManager.syncCategories(productId, data.categoryIds, trx)
      }

      // Sync tags
      if (data.tagIds !== undefined) {
        await this.tagManager.syncTags(productId, data.tagIds, trx)
      }

      // Sync options
      if (data.options !== undefined) {
        const optionsData = data.options.map((opt, index) => ({
          productId,
          name: opt.name,
          values: opt.values,
          position: index,
        }))
        await this.optionManager.syncOptions(productId, optionsData, trx)
      }

      // Sync variants
      if (data.variants !== undefined) {
        const variantsData = data.variants.map((variant, index) => ({
          productId,
          title: variant.title,
          sku: variant.sku,
          barcode: variant.barcode,
          price: variant.price,
          compareAtPrice: variant.compareAtPrice,
          costPerItem: variant.costPrice,
          option1: variant.option1,
          option2: variant.option2,
          option3: variant.option3,
          weight: variant.weight,
          position: variant.position ?? index,
          isActive: variant.isActive ?? true,
          trackInventory: variant.trackInventory ?? false,
          allowBackorder: variant.allowBackorder ?? false,
          quantityAvailable: variant.stockQuantity ?? 0,
        }))
        await this.variantManager.syncVariants(productId, variantsData, trx)
      }

      // Sync images
      if (data.images !== undefined) {
        const imagesData = data.images.map((img, index) => ({
          productId,
          url: img.url,
          altText: img.alt,
          position: img.position ?? index,
        }))
        await this.imageManager.syncImages(productId, imagesData, trx)
      }

      return product
    })
  }

  /**
   * Soft delete product
   */
  async delete(productId: string): Promise<void> {
    const product = await Product.findOrFail(productId)
    product.deletedAt = DateTime.now()
    await product.save()
  }

  /**
   * Permanently delete product
   */
  async forceDelete(productId: string): Promise<void> {
    const product = await Product.findOrFail(productId)
    await product.delete()
  }

  /**
   * Restore soft deleted product
   */
  async restore(productId: string): Promise<Product> {
    const product = await Product.query().where('id', productId).firstOrFail()
    product.deletedAt = null
    await product.save()
    return product
  }

  /**
   * Find product by ID with all relations
   */
  async findById(productId: string): Promise<Product | null> {
    return await Product.query()
      .where('id', productId)
      .whereNull('deletedAt')
      .preload('variants')
      .preload('options')
      .preload('images')
      .preload('categories')
      .preload('tags')
      .first()
  }

  /**
   * Find product by slug with all relations
   */
  async findBySlug(storeId: string, slug: string): Promise<Product | null> {
    return await Product.query()
      .where('storeId', storeId)
      .where('slug', slug)
      .whereNull('deletedAt')
      .preload('variants')
      .preload('options')
      .preload('images')
      .preload('categories')
      .preload('tags')
      .first()
  }

  /**
   * List products with filters and pagination
   */
  async list(filters: ProductFilters): Promise<ModelPaginatorContract<Product>> {
    const query = Product.query()
      .where('storeId', filters.storeId)
      .whereNull('deletedAt')
      .preload('variants')
      .preload('images')

    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.type) {
      query.where('type', filters.type)
    }

    if (filters.isFeatured !== undefined) {
      query.where('isFeatured', filters.isFeatured)
    }

    if (filters.categoryId) {
      query.whereHas('categories', (builder) => {
        builder.where('categories.id', filters.categoryId!)
      })
    }

    if (filters.tagId) {
      query.whereHas('tags', (builder) => {
        builder.where('tags.id', filters.tagId!)
      })
    }

    if (filters.minPrice !== undefined) {
      query.where('price', '>=', filters.minPrice)
    }

    if (filters.maxPrice !== undefined) {
      query.where('price', '<=', filters.maxPrice)
    }

    if (filters.search) {
      query.where((builder) => {
        builder
          .whereILike('title', `%${filters.search}%`)
          .orWhereILike('description', `%${filters.search}%`)
          .orWhereILike('sku', `%${filters.search}%`)
      })
    }

    const sortBy = filters.sortBy || 'createdAt'
    const sortDir = filters.sortDir || 'desc'
    query.orderBy(sortBy, sortDir)

    return await query.paginate(filters.page || 1, filters.limit || 20)
  }

  /**
   * Get featured products
   */
  async getFeatured(storeId: string, limit: number = 8): Promise<Product[]> {
    return await Product.query()
      .where('storeId', storeId)
      .where('status', 'active')
      .where('isFeatured', true)
      .whereNull('deletedAt')
      .preload('images')
      .preload('variants')
      .orderBy('sortOrder', 'asc')
      .limit(limit)
  }

  /**
   * Get related products by category
   */
  async getRelated(productId: string, limit: number = 4): Promise<Product[]> {
    const product = await Product.query()
      .where('id', productId)
      .preload('categories')
      .firstOrFail()

    const categoryIds = product.categories.map((c) => c.id)

    return await Product.query()
      .where('storeId', product.storeId)
      .where('status', 'active')
      .whereNot('id', productId)
      .whereNull('deletedAt')
      .whereHas('categories', (builder) => {
        builder.whereIn('categories.id', categoryIds)
      })
      .preload('images')
      .preload('variants')
      .limit(limit)
  }

  /**
   * Update variant inventory quantity
   * Delegates to inventory manager
   */
  async updateInventory(variantId: string, quantity: number): Promise<void> {
    await this.inventoryManager.updateVariantInventory(variantId, quantity)
  }

  /**
   * Adjust variant inventory quantity
   * Delegates to inventory manager
   */
  async adjustInventory(variantId: string, adjustment: number): Promise<void> {
    await this.inventoryManager.adjustVariantInventory(variantId, adjustment)
  }
}
