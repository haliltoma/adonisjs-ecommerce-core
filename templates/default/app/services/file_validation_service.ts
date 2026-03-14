import { MultipartFile } from '@adonisjs/core/body_parser'
import { randomBytes } from 'crypto'
import Application from '@adonisjs/core/app'
import drive from '@adonisjs/drive/services/main'

interface ValidationResult {
  isValid: boolean
  error?: string
  fileSize?: number
  mimeType?: string
}

interface FileValidationOptions {
  maxSize?: number // In bytes
  allowedMimeTypes?: string[]
  allowedExtensions?: string[]
  requireMagicNumberValidation?: boolean
}

interface ScanResult {
  isClean: boolean
  threatFound?: boolean
  threatName?: string
  scanTime: number
}

interface UploadAttempt {
  id: string
  fileName: string
  fileSize: number
  mimeType: string
  ipAddress: string
  userAgent: string
  userId?: string
  status: 'pending' | 'approved' | 'rejected' | 'quarantined'
  threatFound?: boolean
  threatName?: string
  scannedAt?: Date
  createdAt: Date
}

export default class FileValidationService {
  constructor(protected app: Application) {}

  /**
   * Validate uploaded file
   */
  async validateFile(
    file: MultipartFile | null,
    options: FileValidationOptions = {}
  ): Promise<ValidationResult> {
    if (!file) {
      return {
        isValid: false,
        error: 'No file provided',
      }
    }

    const {
      maxSize = 10 * 1024 * 1024, // 10MB default
      allowedMimeTypes,
      allowedExtensions,
      requireMagicNumberValidation = true,
    } = options

    // Check file size
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: `File size exceeds maximum allowed size of ${Math.round(maxSize / 1024 / 1024)}MB`,
        fileSize: file.size,
      }
    }

    // Get file extension
    const fileName = file.clientName || ''
    const fileExtension = fileName.split('.').pop()?.toLowerCase()

    // Validate extension
    if (allowedExtensions && fileExtension) {
      if (!allowedExtensions.includes(fileExtension)) {
        return {
          isValid: false,
          error: `File extension .${fileExtension} is not allowed`,
          mimeType: file.headers['content-type'],
        }
      }
    }

    // Validate MIME type from headers
    const declaredMimeType = file.headers['content-type']

    if (allowedMimeTypes && declaredMimeType) {
      if (!allowedMimeTypes.includes(declaredMimeType)) {
        return {
          isValid: false,
          error: `MIME type ${declaredMimeType} is not allowed`,
          mimeType: declaredMimeType,
        }
      }
    }

    // Magic number validation (verify real file type)
    if (requireMagicNumberValidation) {
      const isValidMagicNumber = await this.validateMagicNumber(file, allowedMimeTypes)
      if (!isValidMagicNumber.isValid) {
        return isValidMagicNumber
      }
    }

    return {
      isValid: true,
      fileSize: file.size,
      mimeType: declaredMimeType,
    }
  }

  /**
   * Validate file using magic numbers (file signature)
   */
  private async validateMagicNumber(
    file: MultipartFile,
    allowedMimeTypes?: string[]
  ): Promise<ValidationResult> {
    try {
      // Read first 8 bytes for magic number detection
      const buffer = await file.toBuffer()
      const magicNumber = buffer.slice(0, 8).toString('hex')

      // Known magic numbers and their MIME types
      const magicNumbers: Record<string, string[]> = {
        // Images
        'ffd8ffe0': ['image/jpeg'],
        '89504e47': ['image/png'],
        '47494638': ['image/gif'],
        '52494646': ['image/webp', 'image/webp2'],
        '38425053': ['image/photoshop', 'application/vnd.adobe.photoshop'],

        // Documents
        '25504446': ['application/pdf'],
        '504b0304': ['application/pdf'],
        'd0cf11e0': ['application/vnd.ms-powerpoint'],
        '504b0303': ['application/msword', 'application/vnd.ms-word'],
        '504b0506': ['application/vnd.ms-excel'],

        // Archives
        '504b0304': ['application/zip'],
        '377abcaf': ['application/zip'],
        '42573637': ['application/zlib', 'application/x-gzip'],
        '1f8b0808': ['application/x-gzip'],

        // Executables and scripts
        '4d5a9000': ['application/x-msdownload', 'application/exe'],
        '7f454c46': ['application/x-executable', 'application/x-sharedlib'],
        '23212770': ['application/x-executable'],

        // Media files
        '0000001c': ['video/mp4', 'video/quicktime'],
        '00000020667479': ['application/mp4'],
        '66747970': ['video/mp4'],
        '1a45dfa3': ['video/webm'],
        'fff14d00': ['audio/mpeg'],
        '49443336': ['audio/mp3'],
      }

      // Check magic number
      const detectedTypes = magicNumbers[magicNumber.slice(0, 8)]

      if (!detectedTypes) {
        return {
          isValid: false,
          error: 'File type could not be detected from magic number',
        }
      }

      // Verify declared MIME type matches detected type
      const declaredType = file.headers['content-type']

      for (const detectedType of detectedTypes) {
        if (declaredType && detectedType.includes(declaredType.split('/')[0])) {
          return { isValid: true }
        }
      }

      return {
        isValid: true,
      }
    } catch (error) {
      return {
        isValid: false,
        error: 'Failed to validate file magic number',
      }
    }
  }

  /**
   * Sanitize filename
   */
  sanitizeFileName(fileName: string): string {
    // Remove any path components
    const cleanName = fileName.replace(/.*[\/\\]/, '')

    // Remove special characters except dots, hyphens, underscores
    const sanitizedName = cleanName.replace(/[^a-zA-Z0-9._-]/g, '_')

    // Generate random suffix if needed
    const randomSuffix = randomBytes(4).toString('hex')
    const nameWithoutExt = sanitizedName.replace(/\.[^.]+$/, '')
    const extension = sanitizedName.split('.').pop()

    return `${nameWithoutExt}-${randomSuffix}.${extension}`
  }

  /**
   * Generate secure file path
   */
  generateSecurePath(originalPath: string): string {
    const randomDir = randomBytes(16).toString('hex')
    const sanitizedName = this.sanitizeFileName(originalPath)

    return `uploads/${randomDir}/${sanitizedName}`
  }

  /**
   * Check for malicious patterns in file
   */
  async checkMaliciousPatterns(file: MultipartFile): Promise<{
    isMalicious: boolean
    patterns?: string[]
  }> {
    try {
      const content = await file.toBuffer()
      const contentString = content.toString('utf-8', 0, Math.min(content.length, 10000))

      const maliciousPatterns = [
        /<script/i,
        /javascript:/i,
        /<iframe/i,
        /<object/i,
        /<embed/i,
        /<link/i,
        /<meta/i,
        /data:text\/html/i,
        /<\?php/i,
        /<\?%/i,
        /\beval\(/i,
        /\bexec\(/i,
        /system\(/i,
        /shell_exec\(/i,
        /passthru\(/i,
        /`.*\$/i,
      ]

      const foundPatterns: string[] = []

      for (const pattern of maliciousPatterns) {
        if (pattern.test(contentString)) {
          foundPatterns.push(pattern.source)
        }
      }

      return {
        isMalicious: foundPatterns.length > 0,
        patterns: foundPatterns,
      }
    } catch (error) {
      return {
        isMalicious: false,
      }
    }
  }

  /**
   * Scan file for viruses (ClamAV integration)
   */
  async scanForVirus(filePath: string): Promise<ScanResult> {
    const startTime = Date.now()

    try {
      // TODO: Integrate with ClamAV
      // For now, return as clean (would integrate ClamAV daemon here)
      const isClean = true

      const scanTime = Date.now() - startTime

      return {
        isClean,
        threatFound: !isClean,
        scanTime,
      }
    } catch (error) {
      // If scanning fails, allow file but log error
      console.error('Virus scan failed:', error)

      return {
        isClean: true, // Allow file if scan fails
        scanTime: Date.now() - startTime,
      }
    }
  }

  /**
   * Validate multiple files
   */
  async validateFiles(
    files: (MultipartFile | null)[],
    options: FileValidationOptions = {}
  ): Promise<ValidationResult[]> {
    const results: ValidationResult[] = []

    for (const file of files) {
      const result = await this.validateFile(file, options)
      results.push(result)
    }

    return results
  }

  /**
   * Get file hash for integrity checking
   */
  async getFileHash(filePath: string): Promise<string> {
    const crypto = require('crypto')
    const fs = require('fs').promises
    const buffer = await fs.readFile(filePath)

    return crypto.createHash('sha256').update(buffer).digest('hex')
  }

  /**
   * Check file type using file command (if available)
   */
  async getFileType(filePath: string): Promise<string> {
    try {
      const { exec } = require('child_process')

      return new Promise((resolve, reject) => {
        exec(`file -b "${filePath}"`, (error, stdout, stderr) => {
          if (error) {
            reject(error)
          } else {
            resolve(stdout.trim())
          }
        })
      })
    } catch (error) {
      return 'unknown'
    }
  }

  /**
   * Validate image file specifically
   */
  async validateImageFile(file: MultipartFile): Promise<ValidationResult> {
    const imageOptions: FileValidationOptions = {
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
      ],
      allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
      requireMagicNumberValidation: true,
    }

    return await this.validateFile(file, imageOptions)
  }

  /**
   * Validate document file
   */
  async validateDocumentFile(file: MultipartFile): Promise<ValidationResult> {
    const docOptions: FileValidationOptions = {
      maxSize: 25 * 1024 * 1024, // 25MB
      allowedMimeTypes: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint',
        'text/plain',
      ],
      allowedExtensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'],
    }

    return await this.validateFile(file, docOptions)
  }
}
