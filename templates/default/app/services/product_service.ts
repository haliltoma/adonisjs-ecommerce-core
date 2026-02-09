import { DateTime } from 'luxon'
import Product from '#models/product'
import ProductVariant from '#models/product_variant'
import ProductOption from '#models/product_option'
import ProductImage from '#models/product_image'
import db from '@adonisjs/lucid/services/db'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

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
  async create(data: CreateProductDTO): Promise<Product> {
    return await db.transaction(async (trx) => {
      const slug = data.slug || this.generateSlug(data.title)

      const product = await Product.create(
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
        { client: trx }
      )

      if (data.categoryIds?.length) {
        await product.related('categories').attach(data.categoryIds, trx)
      }

      if (data.tagIds?.length) {
        await product.related('tags').attach(data.tagIds, trx)
      }

      if (data.options?.length) {
        for (let i = 0; i < data.options.length; i++) {
          await ProductOption.create(
            {
              productId: product.id,
              name: data.options[i].name,
              values: data.options[i].values,
              position: i,
            },
            { client: trx }
          )
        }
      }

      if (data.variants?.length) {
        for (let i = 0; i < data.variants.length; i++) {
          const variantData = data.variants[i]
          await ProductVariant.create(
            {
              productId: product.id,
              title: variantData.title,
              sku: variantData.sku,
              barcode: variantData.barcode,
              price: variantData.price,
              compareAtPrice: variantData.compareAtPrice,
              costPrice: variantData.costPrice,
              option1: variantData.option1,
              option2: variantData.option2,
              option3: variantData.option3,
              weight: variantData.weight,
              position: variantData.position ?? i,
              isActive: variantData.isActive ?? true,
              trackInventory: variantData.trackInventory ?? false,
              allowBackorder: variantData.allowBackorder ?? false,
            },
            { client: trx }
          )
        }
      }

      if (data.images?.length) {
        for (let i = 0; i < data.images.length; i++) {
          await ProductImage.create(
            {
              productId: product.id,
              url: data.images[i].url,
              altText: data.images[i].alt,
              position: data.images[i].position ?? i,
            },
            { client: trx }
          )
        }
      }

      return product
    })
  }

  async update(productId: string, data: Partial<CreateProductDTO>): Promise<Product> {
    return await db.transaction(async (trx) => {
      const product = await Product.query({ client: trx }).where('id', productId).firstOrFail()

      product.merge({
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
      })

      await product.useTransaction(trx).save()

      if (data.categoryIds !== undefined) {
        await product.related('categories').sync(data.categoryIds, true, trx)
      }

      if (data.tagIds !== undefined) {
        await product.related('tags').sync(data.tagIds, true, trx)
      }

      return product
    })
  }

  async delete(productId: string): Promise<void> {
    const product = await Product.findOrFail(productId)
    product.deletedAt = DateTime.now()
    await product.save()
  }

  async forceDelete(productId: string): Promise<void> {
    const product = await Product.findOrFail(productId)
    await product.delete()
  }

  async restore(productId: string): Promise<Product> {
    const product = await Product.query().where('id', productId).firstOrFail()
    product.deletedAt = null
    await product.save()
    return product
  }

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

  async updateInventory(variantId: string, quantity: number): Promise<void> {
    const variant = await ProductVariant.findOrFail(variantId)
    variant.inventoryQuantity = quantity
    await variant.save()
  }

  async adjustInventory(variantId: string, adjustment: number): Promise<void> {
    const variant = await ProductVariant.findOrFail(variantId)
    variant.inventoryQuantity = (variant.inventoryQuantity || 0) + adjustment
    await variant.save()
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
  }
}
