import { DateTime } from 'luxon'
import { column, BaseModel } from '@adonisjs/lucid/orm';
//, column } from 'adonis-lucid-soft-deletes'
import Product from '#models/product'
import { compose } from '@adonisjs/core/helpers'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'

export default class DigitalProduct extends compose(BaseModel, SoftDeletes) {
 @column({ isPrimary: true })
 declare id: string

 @column()
 declare productId: string

 @column()
 declare fileName: string

 @column()
 declare filePath: string

 @column()
 declare fileMimeType: string

 @column()
 declare fileSize: number

 @column()
 declare fileHash: string | null

 @column()
 declare requiresLicense: boolean

 @column()
 declare licenseDurationDays: number | null

 @column()
 declare version: string | null

 @column()
 declare releaseNotes: string | null

 @column.dateTime({ autoCreate: true })
 declare createdAt: DateTime

 @column.dateTime({ autoCreate: true, autoUpdate: true })
 declare updatedAt: DateTime

 // Relationships
 @column()
 declare deletedAt: DateTime | null

 async product() {
 return await Product.findBy('id', this.productId)
 }

 // Get file extension
 get fileExtension(): string {
 return this.fileName.split('.').pop() || ''
 }

 // Check if file is downloadable
 isDownloadable(): boolean {
 return this.filePath !== null && this.fileName !== null
 }

 // Get file size in human readable format
 get fileSizeFormatted(): string {
 const bytes = this.fileSize
 const sizes = ['Bytes', 'KB', 'MB', 'GB']
 if (bytes === 0) return '0 Bytes'
 const i = Math.floor(Math.log(bytes) / Math.log(1024))
 return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
 }
}
