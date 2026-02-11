/**
 * Media Provider Contract
 *
 * Abstract class for media storage and processing.
 * Providers: Local filesystem, S3, Cloudflare R2, GCS, etc.
 */
export abstract class MediaProvider {
  /**
   * Unique identifier for the media provider
   */
  abstract readonly name: string

  /**
   * Upload a file
   */
  abstract upload(params: UploadParams): Promise<UploadResult>

  /**
   * Delete a file
   */
  abstract delete(filePath: string): Promise<{ success: boolean }>

  /**
   * Get a public URL for a file
   */
  abstract getUrl(filePath: string): string

  /**
   * Get a signed/temporary URL for a file
   */
  abstract getSignedUrl(filePath: string, expiresInSeconds?: number): Promise<string>

  /**
   * Check if a file exists
   */
  abstract exists(filePath: string): Promise<boolean>

  /**
   * Get file metadata (size, mime type, etc.)
   */
  abstract getMetadata(filePath: string): Promise<FileMetadata>

  /**
   * Resize an image and return the new file path
   */
  abstract resizeImage(
    filePath: string,
    options: ImageResizeOptions
  ): Promise<UploadResult>

  /**
   * Generate multiple image sizes (thumbnails, etc.)
   */
  abstract generateThumbnails(
    filePath: string,
    sizes: ThumbnailSize[]
  ): Promise<UploadResult[]>
}

export interface UploadParams {
  file: Buffer | NodeJS.ReadableStream
  fileName: string
  mimeType: string
  directory?: string
  isPublic?: boolean
  metadata?: Record<string, string>
}

export interface UploadResult {
  success: boolean
  filePath: string
  url: string
  size: number
  mimeType: string
  width?: number
  height?: number
  errorMessage?: string
}

export interface FileMetadata {
  size: number
  mimeType: string
  lastModified: Date
  width?: number
  height?: number
}

export interface ImageResizeOptions {
  width?: number
  height?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside'
  quality?: number
  format?: 'jpeg' | 'png' | 'webp' | 'avif'
}

export interface ThumbnailSize {
  name: string
  width: number
  height: number
  fit?: 'cover' | 'contain' | 'fill'
  quality?: number
}
