import sharp from 'sharp'
import { DateTime } from 'luxon'
import { stat } from 'node:fs/promises'

interface ImageSizes {
  thumbnail?: { width: number; height: number }
  small?: { width: number; height: number }
  medium?: { width: number; height: number }
  large?: { width: number; height: number }
}

interface ProcessedImage {
  original: {
    path: string
    size: number
    width: number
    height: number
    mimeType: string
  }
  sizes: {
    [key: string]: {
      path: string
      size: number
      width: number
      height: number
    }
  }
  webP: {
    [key: string]: {
      path: string
      size: number
    }
  }
  metadata: {
    processedAt: string
    originalFormat: string
    hasWebP: boolean
  }
}

export default class ImageService {

  /**
   * Default image sizes configuration
   */
  private getDefaultSizes(): ImageSizes {
    return {
      thumbnail: { width: 300, height: 300 },
      small: { width: 400, height: 400 },
      medium: { width: 800, height: 800 },
      large: { width: 1200, height: 1200 },
    }
  }

  /**
   * Process uploaded image with multiple sizes and WebP conversion
   */
  async processImage(
    filePath: string,
    customSizes?: ImageSizes,
    quality: number = 85
  ): Promise<ProcessedImage> {
    const image = sharp(filePath)
    const metadata = await image.metadata()
    const sizes = customSizes || this.getDefaultSizes()

    // Get original image info
    const originalInfo = {
      path: filePath,
      size: 0,
      width: metadata.width || 0,
      height: metadata.height || 0,
      mimeType: metadata.format || 'image',
    }

    // Get file size
    const originalFileStat = await stat(filePath)
    originalInfo.size = originalFileStat.size

    const processedSizes: ProcessedImage['sizes'] = {}
    const webPImages: ProcessedImage['webP'] = {}

    // Generate different sizes
    for (const [sizeName, sizeConfig] of Object.entries(sizes)) {
      if (!sizeConfig) continue

      const resizedPath = this.getResizedPath(filePath, sizeName, sizeConfig)

      await image
        .clone()
        .resize(sizeConfig.width, sizeConfig.height, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .jpeg({ quality })
        .toFile(resizedPath)

      const resizedStats = await sharp(resizedPath).metadata()
      const resizedFileStat = await stat(resizedPath)

      processedSizes[sizeName] = {
        path: resizedPath,
        size: resizedFileStat.size,
        width: resizedStats.width || 0,
        height: resizedStats.height || 0,
      }
    }

    // Generate WebP versions
    for (const [sizeName, sizeConfig] of Object.entries(sizes)) {
      if (!sizeConfig) continue

      const webPPath = this.getWebPPath(filePath, sizeName)
      const sourcePath = sizeName === 'original' ? filePath : this.getResizedPath(filePath, sizeName, sizeConfig)

      await sharp(sourcePath)
        .clone()
        .webp({ quality })
        .toFile(webPPath)

      const webPFileStat = await stat(webPPath)

      webPImages[sizeName] = {
        path: webPPath,
        size: webPFileStat.size,
      }
    }

    // Generate original WebP
    const originalWebPPath = this.getWebPPath(filePath, 'original')
    await image
      .clone()
      .webp({ quality })
      .toFile(originalWebPPath)

    const originalWebPFileStat = await stat(originalWebPPath)
    webPImages['original'] = {
      path: originalWebPPath,
      size: originalWebPFileStat.size,
    }

    // Strip metadata from original
    const strippedPath = this.getStrippedPath(filePath)
    await image
      .clone()
      .jpeg({ quality })
      .toFile(strippedPath)

    return {
      original: {
        ...originalInfo,
        path: strippedPath,
      },
      sizes: processedSizes,
      webP: webPImages,
      metadata: {
        processedAt: DateTime.now().toISO(),
        originalFormat: metadata.format || 'unknown',
        hasWebP: true,
      },
    }
  }

  /**
   * Generate responsive srcset for images
   */
  async generateSrcset(
    imagePath: string,
    sizes: ImageSizes
  ): Promise<string> {
    const srcsetEntries: string[] = []
    const baseUrl = this.getBaseUrl()

    for (const [sizeName, sizeConfig] of Object.entries(sizes)) {
      if (!sizeConfig) continue

      const width = sizeConfig.width
      const webPPath = this.getWebPPath(imagePath, sizeName)

      srcsetEntries.push(`${baseUrl}${webPPath} ${width}w`)
    }

    return srcsetEntries.join(', ')
  }

  /**
   * Get image placeholder (blur-up)
   */
  async generatePlaceholder(
    imagePath: string,
    width: number = 20,
    height: number = 20,
    quality: number = 30
  ): Promise<string> {
    const placeholderPath = this.getPlaceholderPath(imagePath)

    await sharp(imagePath)
      .resize(width, height, {
        fit: 'cover',
        position: 'center',
      })
      .blur(2)
      .jpeg({ quality })
      .toBuffer()
      .then((data) => {
        return `data:image/jpeg;base64,${data.toString('base64')}`
      })

    return `data:image/jpeg;base64,${placeholderPath}`
  }

  /**
   * Optimize existing image
   */
  async optimizeImage(
    imagePath: string,
    quality: number = 85
  ): Promise<{
    originalSize: number
    optimizedSize: number
    savings: number
    savingsPercentage: number
  }> {
    const originalStats = await sharp(imagePath).metadata()
    const originalFileStat2 = await stat(imagePath)
    const originalSize = originalFileStat2.size

    // Optimize image
    const optimizedPath = this.getOptimizedPath(imagePath)
    await sharp(imagePath)
      .jpeg({ quality, progressive: true, mozjpeg: true })
      .toFile(optimizedPath)

    const optimizedFileStat = await stat(optimizedPath)
    const optimizedSize = optimizedFileStat.size
    const savings = originalSize - optimizedSize
    const savingsPercentage = ((savings / originalSize) * 100).toFixed(2)

    return {
      originalSize,
      optimizedSize,
      savings,
      savingsPercentage: Number(savingsPercentage),
    }
  }

  /**
   * Convert image to WebP
   */
  async convertToWebP(
    imagePath: string,
    quality: number = 85
  ): Promise<{
    webPPath: string
    webPSize: number
    originalSize: number
  }> {
    const webPPath = this.getWebPPath(imagePath, 'converted')
    const originalFileStat3 = await stat(imagePath)

    await sharp(imagePath)
      .webp({ quality })
      .toFile(webPPath)

    const webPFileStat2 = await stat(webPPath)

    return {
      webPPath,
      webPSize: webPFileStat2.size,
      originalSize: originalFileStat3.size,
    }
  }

  /**
   * Batch process images
   */
  async batchProcessImages(
    imagePaths: string[],
    progressCallback?: (current: number, total: number) => void
  ): Promise<ProcessedImage[]> {
    const results: ProcessedImage[] = []

    for (let i = 0; i < imagePaths.length; i++) {
      const result = await this.processImage(imagePaths[i])
      results.push(result)

      if (progressCallback) {
        progressCallback(i + 1, imagePaths.length)
      }
    }

    return results
  }

  /**
   * Get image dimensions
   */
  async getDimensions(imagePath: string): Promise<{ width: number; height: number }> {
    const metadata = await sharp(imagePath).metadata()
    return {
      width: metadata.width || 0,
      height: metadata.height || 0,
    }
  }

  /**
   * Get image metadata
   */
  async getMetadata(imagePath: string): Promise<sharp.Metadata> {
    return await sharp(imagePath).metadata()
  }

  /**
   * Resize image to specific dimensions
   */
  async resize(
    imagePath: string,
    width: number,
    height: number,
    fit: 'cover' | 'contain' | 'fill' | 'inside' | 'outside' = 'cover'
  ): Promise<string> {
    const resizedPath = this.getResizedPath(imagePath, 'custom', { width, height })

    await sharp(imagePath)
      .resize(width, height, { fit })
      .jpeg({ quality: 85 })
      .toFile(resizedPath)

    return resizedPath
  }

  /**
   * Generate all image URLs for frontend
   */
  async getImageUrls(imagePath: string): Promise<{
    original: string
    thumbnail: string
    small: string
    medium: string
    large: string
    webP: {
      original: string
      thumbnail: string
      small: string
      medium: string
      large: string
    }
    srcset: string
  }> {
    const baseUrl = this.getBaseUrl()
    const sizes = this.getDefaultSizes()

    const urls: any = {
      original: `${baseUrl}${imagePath}`,
      webP: {},
      srcset: await this.generateSrcset(imagePath, sizes),
    }

    // Add size URLs
    for (const sizeName of Object.keys(sizes)) {
      urls[sizeName] = `${baseUrl}${this.getResizedPath(imagePath, sizeName, sizes[sizeName as keyof ImageSizes])}`
      urls.webP[sizeName] = `${baseUrl}${this.getWebPPath(imagePath, sizeName)}`
    }

    urls.webP.original = `${baseUrl}${this.getWebPPath(imagePath, 'original')}`

    return urls
  }

  // Helper methods for path generation

  private getResizedPath(originalPath: string, sizeName: string, sizeConfig: any): string {
    const ext = this.getExtension(originalPath)
    const pathWithoutExt = originalPath.replace(`.${ext}`, '')
    return `${pathWithoutExt}-${sizeName}.${ext}`
  }

  private getWebPPath(originalPath: string, sizeName: string): string {
    const pathWithoutExt = originalPath.replace(/\.[^.]+$/, '')
    return `${pathWithoutExt}-${sizeName}.webp`
  }

  private getPlaceholderPath(originalPath: string): string {
    return originalPath.replace(/\.[^.]+$/, '-placeholder.jpg')
  }

  private getStrippedPath(originalPath: string): string {
    const ext = this.getExtension(originalPath)
    return originalPath.replace(`.${ext}`, `-stripped.${ext}`)
  }

  private getOptimizedPath(originalPath: string): string {
    const ext = this.getExtension(originalPath)
    return originalPath.replace(`.${ext}`, `-optimized.${ext}`)
  }

  private getExtension(filePath: string): string {
    return filePath.split('.').pop() || 'jpg'
  }

  private getBaseUrl(): string {
    return '' // Use relative paths or configure CDN URL
  }
}
