import { DateTime } from 'luxon'
import DigitalProduct from '#models/digital_product'
import Download from '#models/download'
import License from '#models/license'
import Product from '#models/product'
import { randomBytes } from 'crypto'
import Application from '@adonisjs/core/app'
import drive from '@adonisjs/drive/services/main'
import { MultipartFile } from '@adonisjs/core/body_parser'

interface CreateDigitalProductDTO {
  productId: string
  fileName: string
  file: MultipartFile
  requiresLicense?: boolean
  licenseDurationDays?: number
  version?: string
  releaseNotes?: string
}

interface CreateDownloadDTO {
  digitalProductId: string
  orderId?: string
  customerId?: string
  maxDownloads?: number
  expiresAfterDays?: number
}

interface CreateLicenseDTO {
  digitalProductId: string
  customerId: string
  orderId?: string
  licenseType?: string
  maxActivations?: number
  validUntil?: DateTime
}

export default class DigitalProductService {
  constructor(protected app: Application) {}

  /**
   * Upload digital product file
   */
  async uploadFile(file: MultipartFile, productId: string): Promise<string> {
    const fileName = `${productId}-${Date.now()}-${file.clientName}`
    const filePath = `digital-products/${fileName}`

    await file.putDrive(filePath)

    return filePath
  }

  /**
   * Create digital product
   */
  async createDigitalProduct(data: CreateDigitalProductDTO): Promise<DigitalProduct> {
    // Upload file
    const filePath = await this.uploadFile(data.file, data.productId)

    // Get file stats
    const fileStats = await data.file.getDrive().getStats(filePath)

    // Create digital product record
    const digitalProduct = await DigitalProduct.create({
      productId: data.productId,
      fileName: data.fileName,
      filePath: filePath,
      fileMimeType: data.file.headers['content-type'] || 'application/octet-stream',
      fileSize: data.file.size || 0,
      fileHash: randomBytes(32).toString('hex'),
      requiresLicense: data.requiresLicense || false,
      licenseDurationDays: data.licenseDurationDays,
      version: data.version || '1.0.0',
      releaseNotes: data.releaseNotes,
    })

    return digitalProduct
  }

  /**
   * Create download link for customer
   */
  async createDownload(data: CreateDigitalDTODTO): Promise<Download> {
    const expiresAt = data.expiresAfterDays
      ? DateTime.now().plus({ days: data.expiresAfterDays })
      : DateTime.now().plus({ days: 7 }) // Default 7 days

    const download = await Download.create({
      digitalProductId: data.digitalProductId,
      orderId: data.orderId,
      customerId: data.customerId,
      downloadCount: 0,
      maxDownloads: data.maxDownloads || 5,
      expiresAt,
      status: 'active',
    })

    return download
  }

  /**
   * Generate secure download URL
   */
  async generateDownloadUrl(downloadId: string): Promise<string> {
    const download = await Download.findOrFail(downloadId)

    if (!download.isValid()) {
      throw new Error('Download is not valid or has expired')
    }

    // Generate expiring token
    const token = randomBytes(32).toString('hex')
    const expiresAt = DateTime.now().plus({ hours: 24 })

    // Store token in download metadata
    download.metadata = {
      ...download.metadata,
      downloadToken: token,
      tokenExpiresAt: expiresAt.toISO(),
    }
    await download.save()

    return `/api/downloads/${downloadId}?token=${token}`
  }

  /**
   * Record download attempt
   */
  async recordDownload(
    downloadId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    const download = await Download.findOrFail(downloadId)

    if (!download.isValid()) {
      throw new Error('Download is not valid or has expired')
    }

    await download.incrementDownload()
    download.ipAddress = ipAddress
    download.userAgent = userAgent
    await download.save()
  }

  /**
   * Create license for digital product
   */
  async createLicense(data: CreateLicenseDTO): Promise<License> {
    const license = await License.create({
      digitalProductId: data.digitalProductId,
      customerId: data.customerId,
      orderId: data.orderId,
      licenseType: data.licenseType || 'standard',
      maxActivations: data.maxActivations || 3,
      currentActivations: 0,
      validFrom: DateTime.now(),
      validUntil: data.validUntil,
      status: 'active',
      activations: [],
      metadata: {},
    })

    return license
  }

  /**
   * Validate license key
   */
  async validateLicense(licenseKey: string, deviceId: string): Promise<boolean> {
    const license = await License.findBy('licenseKey', licenseKey)

    if (!license) return false
    if (!license.isValid()) return false

    // Check if already activated on this device
    const isActivated = license.activations.some((a) => a.deviceId === deviceId)
    if (isActivated) return true

    // Check if can be activated on new device
    return license.canBeActivated()
  }

  /**
   * Activate license on device
   */
  async activateLicense(
    licenseKey: string,
    deviceId: string,
    deviceName: string,
    ipAddress?: string
  ): Promise<boolean> {
    const license = await License.findBy('licenseKey', licenseKey)
    if (!license) return false

    return await license.activate(deviceId, deviceName, ipAddress)
  }

  /**
   * Deactivate license from device
   */
  async deactivateLicense(licenseKey: string, deviceId: string): Promise<boolean> {
    const license = await License.findBy('licenseKey', licenseKey)
    if (!license) return false

    return await license.deactivate(deviceId)
  }

  /**
   * Get customer downloads
   */
  async getCustomerDownloads(customerId: string): Promise<Download[]> {
    return await Download.query()
      .where('customerId', customerId)
      .where('status', 'active')
      .preload('digitalProduct')
      .orderBy('createdAt', 'desc')
  }

  /**
   * Get customer licenses
   */
  async getCustomerLicenses(customerId: string): Promise<License[]> {
    return await License.query()
      .where('customerId', customerId)
      .whereNot('status', 'revoked')
      .preload('digitalProduct')
      .orderBy('createdAt', 'desc')
  }

  /**
   * Revoke download
   */
  async revokeDownload(downloadId: string): Promise<void> {
    const download = await Download.findOrFail(downloadId)
    await download.revoke()
  }

  /**
   * Suspend license
   */
  async suspendLicense(licenseId: string): Promise<void> {
    const license = await License.findOrFail(licenseId)
    await license.suspend()
  }

  /**
   * Check if product is digital
   */
  async isDigitalProduct(productId: string): Promise<boolean> {
    const product = await Product.find(productId)
    return product?.type === 'digital' || false
  }

  /**
   * Get digital product by product ID
   */
  async getDigitalProductByProductId(productId: string): Promise<DigitalProduct | null> {
    return await DigitalProduct.query().where('productId', productId).first()
  }
}
