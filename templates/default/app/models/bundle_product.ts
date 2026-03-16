import { DateTime } from 'luxon'
import { column, BaseModel } from '@adonisjs/lucid/orm';
//, column } from 'adonis-lucid-soft-deletes'
import { compose } from '@adonisjs/core/helpers'
import { SoftDeletes } from 'adonis-lucid-soft-deletes'
import Product from '#models/product'
import BundleItem from '#models/bundle_item'

export default class BundleProduct extends compose(BaseModel, SoftDeletes) {
 @column({ isPrimary: true })
 declare id: string

 @column()
 declare productId: string

 @column()
 declare pricingType: 'fixed' | 'discount_percentage' | 'discount_fixed'

 @column()
 declare fixedPrice: number | null

 @column()
 declare discountPercentage: number | null

 @column()
 declare discountFixed: number | null

 @column()
 declare trackInventory: boolean

 @column()
 declare stockQuantity: number

 @column()
 declare isVisible: boolean

 @column()
 declare metadata: Record<string, any>

 @column.dateTime({ autoCreate: true })
 declare createdAt: DateTime

 @column.dateTime({ autoCreate: true, autoUpdate: true })
 declare updatedAt: DateTime

 @column()
 declare deletedAt: DateTime | null

 // Relationships
 async product() {
 return await Product.findBy('id', this.productId)
 }

 async items() {
 return await BundleItem.query().where('bundleProductId', this.id).orderBy('position')
 }

 async componentProducts() {
 const bundleItems = await this.items()
 const productIds = bundleItems.map((item) => item.componentProductId)
 return await Product.query().whereIn('id', productIds)
 }

 // Calculate bundle price
 async calculatePrice(): Promise<number> {
 const items = await this.items()
 const products = await this.componentProducts()
 const priceMap = new Map(products.map((p) => [p.id, p.price]))

 let totalPrice = 0

 for (const item of items) {
 if (item.useOverridePrice && item.overridePrice !== null) {
 totalPrice += item.overridePrice * item.quantity
 } else {
 const productPrice = priceMap.get(item.componentProductId) || 0
 totalPrice += productPrice * item.quantity
 }
 }

 // Apply pricing strategy
 switch (this.pricingType) {
 case 'fixed':
 return this.fixedPrice || totalPrice

 case 'discount_percentage':
 const discountAmount = totalPrice * (this.discountPercentage || 0) / 100
 return totalPrice - discountAmount

 case 'discount_fixed':
 return Math.max(0, totalPrice - (this.discountFixed || 0))

 default:
 return totalPrice
 }
 }

 // Calculate savings
 async calculateSavings(): Promise<number> {
 const items = await this.items()
 const products = await this.componentProducts()
 const priceMap = new Map(products.map((p) => [p.id, p.price]))

 let originalPrice = 0

 for (const item of items) {
 if (item.useOverridePrice && item.overridePrice !== null) {
 originalPrice += item.overridePrice * item.quantity
 } else {
 const productPrice = priceMap.get(item.componentProductId) || 0
 originalPrice += productPrice * item.quantity
 }
 }

 const bundlePrice = await this.calculatePrice()
 return originalPrice - bundlePrice
 }

 // Check if bundle is in stock
 async isInStock(): Promise<boolean> {
 if (!this.trackInventory) {
 // Check if all component products are in stock
 const products = await this.componentProducts()
 return products.every((p) => !p.trackInventory || p.stockQuantity > 0)
 }

 return this.stockQuantity > 0
 }

 // Decrease bundle stock
 async decreaseStock(quantity: number = 1): Promise<void> {
 if (!this.trackInventory) return

 this.stockQuantity = Math.max(0, this.stockQuantity - quantity)
 await this.save()

 // Also decrease component products' stock
 const items = await this.items()
 for (const item of items) {
 const product = await Product.findBy('id', item.componentProductId)
 if (product && product.trackInventory) {
 await product.decrement('stockQuantity', item.quantity * quantity)
 }
 }
 }

 // Increase bundle stock
 async increaseStock(quantity: number = 1): Promise<void> {
 if (!this.trackInventory) return

 this.stockQuantity += quantity
 await this.save()

 // Also increase component products' stock
 const items = await this.items()
 for (const item of items) {
 const product = await Product.findBy('id', item.componentProductId)
 if (product && product.trackInventory) {
 await product.increment('stockQuantity', item.quantity * quantity)
 }
 }
 }

 // Get savings percentage
 async getSavingsPercentage(): Promise<number> {
 const items = await this.items()
 const products = await this.componentProducts()
 const priceMap = new Map(products.map((p) => [p.id, p.price]))

 let originalPrice = 0

 for (const item of items) {
 if (item.useOverridePrice && item.overridePrice !== null) {
 originalPrice += item.overridePrice * item.quantity
 } else {
 const productPrice = priceMap.get(item.componentProductId) || 0
 originalPrice += productPrice * item.quantity
 }
 }

 const bundlePrice = await this.calculatePrice()

 if (originalPrice === 0) return 0
 return Math.round(((originalPrice - bundlePrice) / originalPrice) * 100)
 }
}
