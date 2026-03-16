/**
 * Return Model
 *
 * Handles RMA (Return Merchandise Authorization) requests.
 */

import { DateTime } from 'luxon'
import { column, BaseModel , belongsTo, hasMany} from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import Order from './order.js'
import Customer from './customer.js'
import ReturnItem from './return_item.js'
import { jsonColumn } from '#helpers/json_column'

export default class Return extends BaseModel {
 @column({ isPrimary: true })
 declare id: string

 @column()
 declare storeId: string

 @column()
 declare orderId: string

 @column()
 declare orderNumber: string

 @column()
 declare customerId: string

 @column()
 declare returnNumber: string

 @column()
 declare status: 'requested' | 'approved' | 'received' | 'requires_action' | 'inspected' | 'completed' | 'rejected' | 'cancelled'

 @column()
 declare reason: 'damaged' | 'defective' | 'wrong_item' | 'no_longer_needed' | 'better_price_available' | 'other'

 @column()
 declare reasonDetails: string | null

 @column()
 declare resolution: 'refund' | 'exchange' | 'store_credit' | null

 @column()
 declare refundAmount: number | null

 @column()
 declare refundCurrency: string | null

 @column()
 declare refundMethod: 'original' | 'store_credit' | 'exchange' | null

 @column()
 declare refundId: string | null

 @column()
 declare exchangeOrderId: string | null

 @column()
 declare shippingMethod: string | null

 @column()
 declare trackingNumber: string | null

 @column()
 declare returnShippingCost: number | null

 @column()
 declare note: string | null

 @column()
 declare internalNote: string | null

 @column()
 declare receivedBy: string | null

 @column.dateTime()
 declare receivedAt: DateTime | null

 @column.dateTime()
 declare approvedAt: DateTime | null

 @column.dateTime()
 declare inspectedAt: DateTime | null

 @column.dateTime()
 declare processedAt: DateTime | null

 @column.dateTime()
 declare expectedReturnBy: DateTime | null

 @column()
 declare approvedBy: string | null

 @column(jsonColumn())
 declare metadata: Record<string, unknown>

 @column.dateTime({ autoCreate: true })
 declare createdAt: DateTime

 @column.dateTime({ autoCreate: true, autoUpdate: true })
 declare updatedAt: DateTime

 @belongsTo(() => Store)
 declare store: BelongsTo<typeof Store>

 @belongsTo(() => Order)
 declare order: BelongsTo<typeof Order>

 @belongsTo(() => Customer)
 declare customer: BelongsTo<typeof Customer>

 @hasMany(() => ReturnItem)
 declare items: HasMany<typeof ReturnItem>

 /**
 * Check if return can be approved
 */
 get canBeApproved(): boolean {
 return this.status === 'requested'
 }

 /**
 * Check if return can be received
 */
 get canBeReceived(): boolean {
 return this.status === 'approved'
 }

 /**
 * Check if return can be inspected
 */
 get canBeInspected(): boolean {
 return this.status === 'received'
 }

 /**
 * Check if return can be processed
 */
 get canBeProcessed(): boolean {
 return this.status === 'inspected'
 }

 /**
 * Check if return is overdue
 */
 get isOverdue(): boolean {
 if (!this.expectedReturnBy) return false
 return DateTime.now() > this.expectedReturnBy && this.status === 'approved'
 }

 /**
 * Check if return is within return window
 */
 get isWithinReturnWindow(): boolean {
 const returnWindowDays = 30 // TODO: make configurable
 const cutoffDate = this.createdAt.minus({ days: returnWindowDays })
 return DateTime.now() <= cutoffDate
 }

 /**
 * Approve return request
 */
 async approve(approvedBy: string, notes?: string): Promise<void> {
 if (!this.canBeApproved) {
 throw new Error('Return cannot be approved')
 }

 this.status = 'approved'
 this.approvedAt = DateTime.now()
 this.approvedBy = approvedBy
 this.internalNote = notes ? `${notes}\n${this.internalNote || ''}`.trim() : this.internalNote

 // Set expected return date (14 days from approval)
 this.expectedReturnBy = DateTime.now().plus({ days: 14 })

 await this.save()
 }

 /**
 * Reject return request
 */
 async reject(rejectedBy: string, reason: string): Promise<void> {
 if (!this.canBeApproved) {
 throw new Error('Return cannot be rejected')
 }

 this.status = 'rejected'
 this.internalNote = `Rejected: ${reason}\n${this.internalNote || ''}`.trim()

 await this.save()
 }

 /**
 * Mark return as received
 */
 async markAsReceived(trackingNumber?: string): Promise<void> {
 if (!this.canBeReceived) {
 throw new Error('Return cannot be marked as received')
 }

 this.status = 'received'
 this.receivedAt = DateTime.now()
 if (trackingNumber) {
 this.trackingNumber = trackingNumber
 }

 await this.save()
 }

 /**
 * Complete inspection
 */
 async completeInspection(notes?: string): Promise<void> {
 if (!this.canBeInspected) {
 throw new Error('Return cannot be inspected')
 }

 this.status = 'inspected'
 this.inspectedAt = DateTime.now()
 this.internalNote = notes ? `${notes}\n${this.internalNote || ''}`.trim() : this.internalNote

 await this.save()
 }

 /**
 * Process return with resolution
 */
 async process(resolution: 'refund' | 'exchange' | 'store_credit', refundAmount?: number): Promise<void> {
 if (!this.canBeProcessed) {
 throw new Error('Return cannot be processed')
 }

 this.status = 'completed'
 this.processedAt = DateTime.now()
 this.resolution = resolution
 if (refundAmount) {
 this.refundAmount = refundAmount
 }

 await this.save()
 }

 /**
 * Cancel return
 */
 async cancel(reason: string): Promise<void> {
 if (['completed', 'rejected', 'cancelled'].includes(this.status)) {
 throw new Error('Return cannot be cancelled')
 }

 this.status = 'cancelled'
 this.internalNote = `Cancelled: ${reason}\n${this.internalNote || ''}`.trim()

 await this.save()
 }

 /**
 * Calculate total refund amount
 */
 async calculateRefundAmount(): Promise<number> {
 await this.load('items')

 let total = 0
 for (const item of this.items) {
 if (item.refundAmount) {
 total += item.refundAmount
 }
 }

 // Subtract return shipping cost if applicable
 if (this.returnShippingCost) {
 total -= this.returnShippingCost
 }

 return Math.max(0, total)
 }

 /**
 * Get return reason display text
 */
 getReasonDisplay(): string {
 const reasons: Record<string, string> = {
 damaged: 'Item arrived damaged',
 defective: 'Item is defective',
 wrong_item: 'Wrong item received',
 no_longer_needed: 'No longer needed',
 better_price_available: 'Found better price',
 other: 'Other' }
 return reasons[this.reason] || this.reason
 }

 /**
 * Get status display text
 */
 getStatusDisplay(): string {
 const statuses: Record<string, string> = {
 requested: 'Requested',
 approved: 'Approved',
 received: 'Received',
 requires_action: 'Requires Action',
 inspected: 'Inspected',
 completed: 'Completed',
 rejected: 'Rejected',
 cancelled: 'Cancelled' }
 return statuses[this.status] || this.status
 }
}
