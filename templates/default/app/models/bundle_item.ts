import { DateTime } from 'luxon'
import { column, BaseModel } from '@adonisjs/lucid/orm';
//, column } from 'adonis-lucid-soft-deletes'
import { compose } from '@adonisjs/core/helpers'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import BundleProduct from '#models/bundle_product'
import Product from '#models/product'

export default class BundleItem extends compose(BaseModel, SoftDeletes) {
 @column({ isPrimary: true })
 declare id: string

 @column()
 declare bundleProductId: string

 @column()
 declare componentProductId: string

 @column()
 declare quantity: number

 @column()
 declare required: boolean

 @column()
 declare minQuantity: number

 @column()
 declare maxQuantity: number | null

 @column()
 declare overridePrice: number | null

 @column()
 declare useOverridePrice: boolean

 @column()
 declare position: number

 @column()
 declare variantSelection: Record<string, any> | null

 @column()
 declare metadata: Record<string, any>

 @column.dateTime({ autoCreate: true })
 declare createdAt: DateTime

 @column.dateTime({ autoCreate: true, autoUpdate: true })
 declare updatedAt: DateTime

 @column()
 declare deletedAt: DateTime | null

 // Relationships
 async bundle() {
 return await BundleProduct.findBy('id', this.bundleProductId)
 }

 async componentProduct() {
 return await Product.findBy('id', this.componentProductId)
 }

 // Get effective price for this item
 async getEffectivePrice(): Promise<number> {
 if (this.useOverridePrice && this.overridePrice !== null) {
 return this.overridePrice
 }

 const product = await this.componentProduct()
 return product?.price || 0
 }

 // Check if customer can choose quantity
 hasQuantityChoice(): boolean {
 return this.maxQuantity !== null && this.maxQuantity > this.minQuantity
 }

 // Get available quantity range
 getQuantityRange(): { min: number; max: number | null } {
 return {
 min: this.minQuantity,
 max: this.maxQuantity }
 }
}
