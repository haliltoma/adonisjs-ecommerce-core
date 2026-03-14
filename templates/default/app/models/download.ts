import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'
import { compose } from '@adonisjs/core/helpers'
import { SoftDeletes } from '@adonisjs/lucid/softDeletes'
import DigitalProduct from '#models/digital_product'
import Customer from '#models/customer'
import Order from '#models/order'

export default class Download extends compose(BaseModel, SoftDeletes) {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare digitalProductId: string

  @column()
  declare orderId: string | null

  @column()
  declare customerId: string | null

  @column()
  declare downloadCount: number

  @column()
  declare maxDownloads: number

  @column.dateTime()
  declare expiresAt: DateTime | null

  @column.dateTime()
  declare lastDownloadedAt: DateTime | null

  @column()
  declare ipAddress: string | null

  @column()
  declare userAgent: string | null

  @column()
  declare status: 'active' | 'expired' | 'revoked'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @column()
  declare deletedAt: DateTime | null

  // Relationships
  async digitalProduct() {
    return await DigitalProduct.findBy('id', this.digitalProductId)
  }

  async customer() {
    return await Customer.findBy('id', this.customerId)
  }

  async order() {
    return await Order.findBy('id', this.orderId)
  }

  // Check if download is valid
  isValid(): boolean {
    if (this.status !== 'active') return false
    if (this.expiresAt && this.expiresAt < DateTime.now()) return false
    if (this.maxDownloads > 0 && this.downloadCount >= this.maxDownloads) return false
    return true
  }

  // Check if download limit reached
  isLimitReached(): boolean {
    return this.maxDownloads > 0 && this.downloadCount >= this.maxDownloads
  }

  // Increment download count
  async incrementDownload() {
    this.downloadCount++
    this.lastDownloadedAt = DateTime.now()
    await this.save()
  }

  // Expire download
  async expire() {
    this.status = 'expired'
    await this.save()
  }

  // Revoke download
  async revoke() {
    this.status = 'revoked'
    await this.save()
  }

  // Get remaining downloads
  get remainingDownloads(): number {
    if (this.maxDownloads === 0) return -1 // Unlimited
    return Math.max(0, this.maxDownloads - this.downloadCount)
  }
}
