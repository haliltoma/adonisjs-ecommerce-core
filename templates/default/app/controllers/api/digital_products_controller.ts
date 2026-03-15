import type { HttpContext } from '@adonisjs/core/http'
import { useDigitalProductService } from '#services/service_container'
import { validator } from '#services/validation_service'

export default class DigitalProductsController {
  protected digitalProductService = useDigitalProductService()

  /**
   * Upload digital product file
   * POST /api/digital-products/upload
   */
  async upload({ request, response }: HttpContext) {
    try {
      const file = request.file('file', {
        size: '50mb',
        extnames: ['pdf', 'zip', 'rar', 'mp3', 'mp4', 'wav', 'doc', 'docx', 'txt'],
      })

      if (!file) {
        return response.status(400).json({
          error: 'No file uploaded',
        })
      }

      const productId = request.input('productId')
      const requiresLicense = request.input('requiresLicense', false)
      const licenseDurationDays = request.input('licenseDurationDays')
      const version = request.input('version')
      const releaseNotes = request.input('releaseNotes')

      const digitalProduct = await this.digitalProductService.createDigitalProduct({
        productId,
        fileName: file.clientName,
        file: file as any,
        requiresLicense: requiresLicense === 'true' || requiresLicense === true,
        licenseDurationDays: licenseDurationDays ? Number(licenseDurationDays) : undefined,
        version,
        releaseNotes,
      })

      return response.status(201).json({
        data: digitalProduct,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }

  /**
   * Get download link
   * GET /api/digital-products/downloads/:id
   */
  async getDownloadLink({ params, response }: HttpContext) {
    try {
      const downloadUrl = await this.digitalProductService.generateDownloadUrl(params.id)

      return response.json({
        data: {
          downloadUrl,
        },
      })
    } catch (error) {
      return response.status(404).json({
        error: error.message,
      })
    }
  }

  /**
   * Record download
   * POST /api/digital-products/downloads/:id/record
   */
  async recordDownload({ params, request, response }: HttpContext) {
    try {
      const ipAddress = request.ip()
      const userAgent = request.header('user-agent')

      await this.digitalProductService.recordDownload(params.id, ipAddress, userAgent)

      return response.json({
        data: {
          message: 'Download recorded successfully',
        },
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Get customer downloads
   * GET /api/digital-products/customer/:customerId/downloads
   */
  async getCustomerDownloads({ params, response }: HttpContext) {
    try {
      const downloads = await this.digitalProductService.getCustomerDownloads(params.customerId)

      return response.json({
        data: downloads,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }

  /**
   * Validate license
   * POST /api/digital-products/licenses/validate
   */
  async validateLicense({ request, response }: HttpContext) {
    try {
      const { licenseKey, deviceId } = request.only(['licenseKey', 'deviceId'])

      const isValid = await this.digitalProductService.validateLicense(licenseKey, deviceId)

      return response.json({
        data: {
          isValid,
        },
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Activate license
   * POST /api/digital-products/licenses/activate
   */
  async activateLicense({ request, response }: HttpContext) {
    try {
      const { licenseKey, deviceId, deviceName } = request.only(['licenseKey', 'deviceId', 'deviceName'])
      const ipAddress = request.ip()

      const activated = await this.digitalProductService.activateLicense(
        licenseKey,
        deviceId,
        deviceName,
        ipAddress
      )

      if (!activated) {
        return response.status(400).json({
          error: 'Failed to activate license',
        })
      }

      return response.json({
        data: {
          message: 'License activated successfully',
        },
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Deactivate license
   * POST /api/digital-products/licenses/deactivate
   */
  async deactivateLicense({ request, response }: HttpContext) {
    try {
      const { licenseKey, deviceId } = request.only(['licenseKey', 'deviceId'])

      const deactivated = await this.digitalProductService.deactivateLicense(licenseKey, deviceId)

      if (!deactivated) {
        return response.status(400).json({
          error: 'Failed to deactivate license',
        })
      }

      return response.json({
        data: {
          message: 'License deactivated successfully',
        },
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Get customer licenses
   * GET /api/digital-products/customer/:customerId/licenses
   */
  async getCustomerLicenses({ params, response }: HttpContext) {
    try {
      const licenses = await this.digitalProductService.getCustomerLicenses(params.customerId)

      return response.json({
        data: licenses,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }

  /**
   * Revoke download
   * DELETE /api/digital-products/downloads/:id
   */
  async revokeDownload({ params, response }: HttpContext) {
    try {
      await this.digitalProductService.revokeDownload(params.id)

      return response.json({
        data: {
          message: 'Download revoked successfully',
        },
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Suspend license
   * POST /api/digital-products/licenses/:id/suspend
   */
  async suspendLicense({ params, response }: HttpContext) {
    try {
      await this.digitalProductService.suspendLicense(params.id)

      return response.json({
        data: {
          message: 'License suspended successfully',
        },
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }
}
