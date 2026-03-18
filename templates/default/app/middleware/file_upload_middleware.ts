import type { HttpContext } from '@adonisjs/core/http'
import app from '@adonisjs/core/services/app'
import FileValidationService from '#services/file_validation_service'
import UploadSecurityService from '#services/upload_security_service'

export default class FileUploadMiddleware {
  protected fileValidation: FileValidationService
  protected uploadSecurity: UploadSecurityService

  constructor() {
    this.fileValidation = new FileValidationService(app)
    this.uploadSecurity = new UploadSecurityService(app)
  }

  /**
   * Handle file upload with security checks
   */
  async handle(ctx: HttpContext, next: () => Promise<void>) {
    const request = ctx.request

    // Get all files from request
    const files = request.files('file')
    const fileArray = Array.isArray(files) ? files : [files]

    if (fileArray.length === 0 || !fileArray[0]) {
      return next()
    }

    const ipAddress = request.ip()
    const userId = ctx.auth?.user?.id

    // Check rate limit
    const rateLimitCheck = await this.uploadSecurity.checkRateLimit(ipAddress, userId)

    if (!rateLimitCheck.allowed) {
      return ctx.response.status(429).json({
        error: 'Upload rate limit exceeded',
        retryAfter: rateLimitCheck.resetAt?.toISO(),
        reason: rateLimitCheck.reason,
      })
    }

    // Check if IP is blocked
    const isBlocked = await this.uploadSecurity.isIPBlocked(ipAddress)

    if (isBlocked) {
      return ctx.response.status(403).json({
        error: 'Your IP has been blocked due to suspicious activity',
      })
    }

    // Validate each file
    const validationResults = await this.fileValidation.validateFiles(fileArray, {
      maxSize: 10 * 1024 * 1024, // 10MB per file
      allowedMimeTypes: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'],
    })

    // Check if any file failed validation
    const failedValidation = validationResults.find((r) => !r.isValid)

    if (failedValidation) {
      // Record failed attempt
      for (const file of fileArray) {
        if (file) {
          await this.uploadSecurity.recordUploadAttempt({
            ipAddress,
            fileName: file.clientName,
            fileSize: file.size,
            mimeType: file.headers['content-type'] || 'unknown',
            status: 'rejected',
          })
        }
      }

      return ctx.response.status(400).json({
        error: failedValidation.error,
      })
    }

    // Check for malicious patterns
    for (const file of fileArray) {
      if (file) {
        const maliciousCheck = await this.fileValidation.checkMaliciousPatterns(file)

        if (maliciousCheck.isMalicious) {
          await this.uploadSecurity.recordUploadAttempt({
            ipAddress,
            fileName: file.clientName,
            fileSize: file.size,
            mimeType: file.headers['content-type'] || 'unknown',
            status: 'quarantined',
            threatFound: true,
            threatName: `Malicious pattern detected: ${maliciousCheck.patterns?.join(', ')}`,
          })

          return ctx.response.status(400).json({
            error: 'File contains malicious content and has been quarantined',
          })
        }
      }
    }

    // All checks passed, proceed with upload
    await next()
  }
}
