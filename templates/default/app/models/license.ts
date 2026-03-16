import { DateTime } from 'luxon'
import { column, beforeCreate, BaseModel } from '@adonisjs/lucid/orm';
//, column, beforeCreate } from 'adonis-lucid-soft-deletes'
import { compose } from '@adonisjs/core/helpers'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import DigitalProduct from '#models/digital_product'
import Customer from '#models/customer'
import Order from '#models/order'
import { randomBytes } from 'crypto'

interface ActivationRecord {
 deviceId: string
 deviceName: string
 activatedAt: string
 ipAddress?: string
}

export default class License extends compose(BaseModel, SoftDeletes) {
 @column({ isPrimary: true })
 declare id: string

 @column()
 declare licenseKey: string

 @column()
 declare digitalProductId: string

 @column()
 declare customerId: string

 @column()
 declare orderId: string | null

 @column()
 declare licenseType: string

 @column()
 declare maxActivations: number

 @column()
 declare currentActivations: number

 @column.dateTime()
 declare validFrom: DateTime

 @column.dateTime()
 declare validUntil: DateTime | null

 @column()
 declare status: 'active' | 'suspended' | 'revoked' | 'expired'

 @column()
 declare activations: ActivationRecord[]

 @column()
 declare metadata: Record<string, any>

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

 // Generate license key before create
 @beforeCreate()
 static async generateLicenseKey(license: License) {
 if (!license.licenseKey) {
 // Generate a license key in format: XXXX-XXXX-XXXX-XXXX
 const parts = []
 for (let i = 0; i < 4; i++) {
 parts.push(randomBytes(2).toString('hex').toUpperCase())
 }
 license.licenseKey = parts.join('-')
 }
 }

 // Check if license is valid
 isValid(): boolean {
 if (this.status !== 'active') return false
 const now = DateTime.now()
 if (this.validFrom > now) return false
 if (this.validUntil && this.validUntil < now) return false
 return true
 }

 // Check if license can be activated
 canBeActivated(): boolean {
 if (!this.isValid()) return false
 if (this.maxActivations > 0 && this.currentActivations >= this.maxActivations) return false
 return true
 }

 // Activate license on device
 async activate(deviceId: string, deviceName: string, ipAddress?: string): Promise<boolean> {
 if (!this.canBeActivated()) return false

 // Check if already activated on this device
 const existingActivation = this.activations.find((a) => a.deviceId === deviceId)
 if (existingActivation) return true // Already activated

 // Add new activation
 this.activations.push({
 deviceId,
 deviceName,
 activatedAt: DateTime.now().toISO(),
 ipAddress })
 this.currentActivations++
 await this.save()
 return true
 }

 // Deactivate license from device
 async deactivate(deviceId: string): Promise<boolean> {
 const index = this.activations.findIndex((a) => a.deviceId === deviceId)
 if (index === -1) return false

 this.activations.splice(index, 1)
 this.currentActivations = Math.max(0, this.currentActivations - 1)
 await this.save()
 return true
 }

 // Get remaining activations
 get remainingActivations(): number {
 if (this.maxActivations === 0) return -1 // Unlimited
 return Math.max(0, this.maxActivations - this.currentActivations)
 }

 // Suspend license
 async suspend() {
 this.status = 'suspended'
 await this.save()
 }

 // Revoke license
 async revoke() {
 this.status = 'revoked'
 await this.save()
 }

 // Reactivate license
 async reactivate() {
 if (this.status === 'suspended' || this.status === 'revoked') {
 this.status = 'active'
 await this.save()
 }
 }

 // Get days until expiry
 get daysUntilExpiry(): number | null {
 if (!this.validUntil) return null
 const now = DateTime.now()
 if (this.validUntil <= now) return 0
 return Math.floor(this.validUntil.diff(now, 'days').days)
 }
}
