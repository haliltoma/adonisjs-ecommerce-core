/**
 * Product Image Manager
 *
 * Responsible for managing product images.
 * Single Responsibility: Create and manage product images.
 */

import ProductImage from '#models/product_image'

export interface CreateImageData {
  productId: string
  url: string
  altText?: string
  position?: number
}

export default class ProductImageManager {
  /**
   * Create images for product
   */
  async createImages(
    productId: string,
    images: CreateImageData[],
    trx?: any
  ): Promise<ProductImage[]> {
    const createdImages: ProductImage[] = []

    for (let i = 0; i < images.length; i++) {
      const imageData = images[i]

      const image = await ProductImage.create(
        {
          productId,
          url: imageData.url,
          altText: imageData.altText,
          position: imageData.position ?? i,
        },
        { client: trx }
      )

      createdImages.push(image)
    }

    return createdImages
  }

  /**
   * Update image
   */
  async updateImage(
    imageId: string,
    data: Partial<CreateImageData>,
    trx?: any
  ): Promise<ProductImage> {
    const image = await ProductImage.find(imageId)

    if (!image) {
      throw new Error(`Image not found: ${imageId}`)
    }

    image.merge(data)
    await image.save(trx ? { client: trx } : undefined)

    return image
  }

  /**
   * Delete image
   */
  async deleteImage(imageId: string, trx?: any): Promise<void> {
    const image = await ProductImage.find(imageId)

    if (!image) {
      throw new Error(`Image not found: ${imageId}`)
    }

    await image.delete(trx ? { client: trx } : undefined)
  }

  /**
   * Reorder images
   */
  async reorderImages(
    productId: string,
    imageIds: string[],
    trx?: any
  ): Promise<void> {
    for (let i = 0; i < imageIds.length; i++) {
      await ProductImage.query(trx ? { client: trx } : undefined)
        .where('id', imageIds[i])
        .update({ position: i })
    }
  }

  /**
   * Sync images - replace all images for a product
   * Used in product update operations
   */
  async syncImages(
    productId: string,
    images: CreateImageData[],
    trx?: any
  ): Promise<void> {
    // Delete all existing images
    await ProductImage.query({ client: trx })
      .where('productId', productId)
      .delete()

    // Create new images
    await this.createImages(productId, images, trx)
  }
}
