/**
 * Product Variant Manager
 *
 * Responsible for managing product variants.
 * Single Responsibility: Create and update product variants.
 */

import ProductVariant from '#models/product_variant'

export interface CreateVariantData {
  productId: string
  title: string
  sku?: string
  price?: number
  compareAtPrice?: number
  costPerItem?: number
  quantityAvailable?: number
  weight?: number
  barcode?: string
  options?: Record<string, string>
}

export default class ProductVariantManager {
  /**
   * Create variants for product
   */
  async createVariants(
    productId: string,
    variants: CreateVariantData[],
    trx?: any
  ): Promise<ProductVariant[]> {
    const createdVariants: ProductVariant[] = []

    for (const variantData of variants) {
      const variant = await ProductVariant.create(
        {
          productId,
          title: variantData.title,
          sku: variantData.sku,
          price: variantData.price || 0,
          compareAtPrice: variantData.compareAtPrice,
          costPerItem: variantData.costPerItem,
          quantityAvailable: variantData.quantityAvailable || 0,
          weight: variantData.weight,
          barcode: variantData.barcode,
          options: variantData.options || {},
        },
        { client: trx }
      )

      createdVariants.push(variant)
    }

    return createdVariants
  }

  /**
   * Update variant
   */
  async updateVariant(
    variantId: string,
    data: Partial<CreateVariantData>,
    trx?: any
  ): Promise<ProductVariant> {
    const variant = await ProductVariant.find(variantId)

    if (!variant) {
      throw new Error(`Variant not found: ${variantId}`)
    }

    variant.merge(data)
    await variant.save(trx ? { client: trx } : undefined)

    return variant
  }

  /**
   * Delete variant
   */
  async deleteVariant(variantId: string, trx?: any): Promise<void> {
    const variant = await ProductVariant.find(variantId)

    if (!variant) {
      throw new Error(`Variant not found: ${variantId}`)
    }

    await variant.delete(trx ? { client: trx } : undefined)
  }

  /**
   * Update variant stock
   */
  async updateStock(
    variantId: string,
    quantity: number,
    trx?: any
  ): Promise<void> {
    const variant = await ProductVariant.findOrFail(variantId)

    variant.quantityAvailable = quantity
    await variant.save(trx ? { client: trx } : undefined)
  }

  /**
   * Sync variants - replace all variants for a product
   * Used in product update operations
   */
  async syncVariants(
    productId: string,
    variants: CreateVariantData[],
    trx?: any
  ): Promise<void> {
    // Delete all existing variants
    await ProductVariant.query({ client: trx })
      .where('productId', productId)
      .delete()

    // Create new variants
    await this.createVariants(productId, variants, trx)
  }
}
