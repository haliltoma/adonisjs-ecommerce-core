import {
  MediaProvider,
  type UploadParams,
  type UploadResult,
  type FileMetadata,
  type ImageResizeOptions,
  type ThumbnailSize,
} from '#contracts/media_provider'
import app from '@adonisjs/core/services/app'
import { randomUUID } from 'node:crypto'
import { createWriteStream, existsSync } from 'node:fs'
import { mkdir, stat, unlink } from 'node:fs/promises'
import { join, extname } from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

/**
 * Local Media Provider
 *
 * Default media provider that stores files on the local filesystem.
 * Files are stored in the public directory for direct access.
 * For production, consider S3 or Cloudflare R2 providers.
 */
export class LocalMediaProvider extends MediaProvider {
  readonly name = 'local'
  private uploadDir: string

  constructor() {
    super()
    this.uploadDir = join(app.publicPath(), 'uploads')
  }

  async upload(params: UploadParams): Promise<UploadResult> {
    try {
      const directory = params.directory || 'general'
      const targetDir = join(this.uploadDir, directory)
      await mkdir(targetDir, { recursive: true })

      const ext = extname(params.fileName) || this.getExtFromMime(params.mimeType)
      const uniqueName = `${randomUUID()}${ext}`
      const filePath = join(directory, uniqueName)
      const fullPath = join(this.uploadDir, filePath)

      if (Buffer.isBuffer(params.file)) {
        const readable = Readable.from(params.file)
        const writable = createWriteStream(fullPath)
        await pipeline(readable, writable)
      } else {
        const writable = createWriteStream(fullPath)
        await pipeline(params.file as NodeJS.ReadableStream, writable)
      }

      const fileStat = await stat(fullPath)

      return {
        success: true,
        filePath,
        url: `/uploads/${filePath}`,
        size: fileStat.size,
        mimeType: params.mimeType,
      }
    } catch (error: unknown) {
      return {
        success: false,
        filePath: '',
        url: '',
        size: 0,
        mimeType: params.mimeType,
        errorMessage: error instanceof Error ? (error as Error).message : 'Upload failed',
      }
    }
  }

  async delete(filePath: string): Promise<{ success: boolean }> {
    try {
      const fullPath = join(this.uploadDir, filePath)
      if (existsSync(fullPath)) {
        await unlink(fullPath)
      }
      return { success: true }
    } catch {
      return { success: false }
    }
  }

  getUrl(filePath: string): string {
    return `/uploads/${filePath}`
  }

  async getSignedUrl(filePath: string, _expiresInSeconds?: number): Promise<string> {
    // Local files don't need signed URLs
    return this.getUrl(filePath)
  }

  async exists(filePath: string): Promise<boolean> {
    const fullPath = join(this.uploadDir, filePath)
    return existsSync(fullPath)
  }

  async getMetadata(filePath: string): Promise<FileMetadata> {
    const fullPath = join(this.uploadDir, filePath)
    const fileStat = await stat(fullPath)
    const ext = extname(filePath).toLowerCase()

    return {
      size: fileStat.size,
      mimeType: this.getMimeFromExt(ext),
      lastModified: fileStat.mtime,
    }
  }

  async resizeImage(filePath: string, _options: ImageResizeOptions): Promise<UploadResult> {
    // Basic implementation - returns original file
    // For real resize, install sharp: npm install sharp
    const fullPath = join(this.uploadDir, filePath)
    const fileStat = await stat(fullPath)
    const ext = extname(filePath).toLowerCase()

    return {
      success: true,
      filePath,
      url: this.getUrl(filePath),
      size: fileStat.size,
      mimeType: this.getMimeFromExt(ext),
    }
  }

  async generateThumbnails(
    filePath: string,
    _sizes: ThumbnailSize[]
  ): Promise<UploadResult[]> {
    // Basic implementation - returns original for each size
    // For real thumbnails, install sharp: npm install sharp
    const result = await this.resizeImage(filePath, {})
    return _sizes.map(() => result)
  }

  private getExtFromMime(mimeType: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/svg+xml': '.svg',
      'application/pdf': '.pdf',
      'video/mp4': '.mp4',
    }
    return map[mimeType] || ''
  }

  private getMimeFromExt(ext: string): string {
    const map: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.pdf': 'application/pdf',
      '.mp4': 'video/mp4',
    }
    return map[ext] || 'application/octet-stream'
  }
}
