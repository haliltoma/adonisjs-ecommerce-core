import type { HttpContext } from '@adonisjs/core/http'
import ImageService from '#services/image_service'
import { MultipartFile } from '@adonisjs/core/body_parser'

export default class ImagesController {
  protected imageService: ImageService

  constructor() {
    this.imageService = new ImageService()
  }

  /**
   * Upload and process image
   * POST /api/images/upload
   */
  async upload({ request, response }: HttpContext) {
    try {
      const file = request.file('image', {
        size: '10mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      })

      if (!file) {
        return response.status(400).json({
          error: 'No image file provided',
        })
      }

      // Move file to permanent location
      const fileName = `${Date.now()}-${file.clientName}`
      const filePath = `uploads/products/${fileName}`
      await file.move(filePath)

      // Process image (generate sizes and WebP)
      const processed = await this.imageService.processImage(filePath)

      return response.json({
        data: processed,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }

  /**
   * Batch upload images
   * POST /api/images/batch-upload
   */
  async batchUpload({ request, response }: HttpContext) {
    try {
      const files = request.files('images', {
        size: '10mb',
        extnames: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      })

      if (!files || files.length === 0) {
        return response.status(400).json({
          error: 'No image files provided',
        })
      }

      const processedImages = await this.imageService.batchProcessImages(
        files.map((f) => f.filePath),
        (current, total) => {
          // Progress tracking could be sent via WebSocket
          console.log(`Processing ${current}/${total} images`)
        }
      )

      return response.json({
        data: processedImages,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }

  /**
   * Get processed image URLs
   * GET /api/images/urls
   */
  async getImageUrls({ request, response }: HttpContext) {
    try {
      const { imagePath } = request.only(['imagePath'])
      const urls = await this.imageService.getImageUrls(imagePath)

      return response.json({
        data: urls,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }

  /**
   * Optimize existing image
   * POST /api/images/optimize
   */
  async optimize({ request, response }: HttpContext) {
    try {
      const { imagePath, quality } = request.only(['imagePath', 'quality'])

      const result = await this.imageService.optimizeImage(imagePath, quality || 85)

      return response.json({
        data: result,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }

  /**
   * Convert image to WebP
   * POST /api/images/convert-webp
   */
  async convertToWebP({ request, response }: HttpContext) {
    try {
      const { imagePath, quality } = request.only(['imagePath', 'quality'])

      const result = await this.imageService.convertToWebP(imagePath, quality || 85)

      return response.json({
        data: result,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }

  /**
   * Get image dimensions
   * GET /api/images/dimensions
   */
  async getDimensions({ request, response }: HttpContext) {
    try {
      const { imagePath } = request.only(['imagePath'])
      const dimensions = await this.imageService.getDimensions(imagePath)

      return response.json({
        data: dimensions,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }

  /**
   * Get image metadata
   * GET /api/images/metadata
   */
  async getMetadata({ request, response }: HttpContext) {
    try {
      const { imagePath } = request.only(['imagePath'])
      const metadata = await this.imageService.getMetadata(imagePath)

      return response.json({
        data: metadata,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }
}
