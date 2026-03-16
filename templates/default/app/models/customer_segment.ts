/**
 * Customer Segment Model
 *
 * Represents a customer segment for targeted marketing and personalization.
 */

import { DateTime } from 'luxon'
import { column, BaseModel , manyToMany, scope} from '@adonisjs/lucid/orm'
import type { ManyToMany } from '@adonisjs/lucid/types/relations'
import Customer from './customer.js'
import { jsonColumn } from '#helpers/json_column'

export interface SegmentRule {
 field: string // 'totalSpent', 'orderCount', 'lastOrderDaysAgo', 'categories', 'tags', etc
 operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains' | 'matches'
 value: any
}

export interface SegmentCondition {
 minSpent?: number
 maxSpent?: number
 minOrderCount?: number
 maxOrderCount?: number
 lastOrderDaysAgo?: number
 categories?: string[]
 tags?: string[]
 registrationDate?: {
 from?: DateTime
 to?: DateTime
 }
}

export default class CustomerSegment extends BaseModel {
 @column({ isPrimary: true })
 declare id: string

 @column()
 declare name: string

 @column()
 declare slug: string

 @column()
 declare description: string | null

 @column()
 declare type: 'manual' | 'dynamic' | 'behavioral' | 'demographic'

 @column(jsonColumn())
 declare rules: SegmentRule[] | null

 @column(jsonColumn())
 declare conditions: SegmentCondition | null

 @column()
 declare currencyCode: string | null

 @column()
 declare priority: number

 @column()
 declare isActive: boolean

 @column()
 declare isPublic: boolean

 @column()
 declare customerCount: number

 @column.dateTime({ autoCreate: true })
 declare createdAt: DateTime

 @column.dateTime({ autoCreate: true, autoUpdate: true })
 declare updatedAt: DateTime

 @column.dateTime()
 declare lastCalculatedAt: DateTime | null

 @manyToMany(() => Customer, {
 pivotTable: 'customer_segment_assignments',
 pivotTimestamps: true,
 pivotColumns: ['metadata', 'assignedAt'] })
 declare customers: ManyToMany<typeof Customer>

 /**
 * Scope for active segments
 */
 static active = scope((query) => {
 query.where('isActive', true)
 })

 /**
 * Scope for public segments
 */
 static public = scope((query) => {
 query.where('isPublic', true)
 })

 /**
 * Check if segment is dynamic (auto-calculated)
 */
 get isDynamic(): boolean {
 return this.type === 'dynamic' || this.type === 'behavioral' || this.type === 'demographic'
 }

 /**
 * Check if needs recalculation
 */
 get needsRecalculation(): boolean {
 if (!this.isDynamic) return false
 if (!this.lastCalculatedAt) return true

 // Recalculate if more than 24 hours since last calculation
 const hoursSinceCalculation = DateTime.now().diff(this.lastCalculatedAt, 'hours').hours
 return hoursSinceCalculation > 24
 }

 /**
 * Check if customer matches segment rules
 */
 matchesCustomer(customer: Customer): boolean {
 if (!this.conditions && !this.rules) return false

 // Check rules
 if (this.rules && this.rules.length > 0) {
 for (const rule of this.rules) {
 if (!this.matchesRule(customer, rule)) {
 return false
 }
 }
 }

 // Check conditions
 if (this.conditions) {
 return this.matchesConditions(customer, this.conditions)
 }

 return true
 }

 /**
 * Check if customer matches a specific rule
 */
 private matchesRule(customer: Customer, rule: SegmentRule): boolean {
 const customerValue = this.getCustomerFieldValue(customer, rule.field)

 switch (rule.operator) {
 case 'eq':
 return customerValue === rule.value
 case 'ne':
 return customerValue !== rule.value
 case 'gt':
 return customerValue > rule.value
 case 'gte':
 return customerValue >= rule.value
 case 'lt':
 return customerValue < rule.value
 case 'lte':
 return customerValue <= rule.value
 case 'in':
 return Array.isArray(rule.value) && rule.value.includes(customerValue)
 case 'contains':
 return Array.isArray(customerValue) && customerValue.includes(rule.value)
 case 'matches':
 return new RegExp(rule.value).test(String(customerValue))
 default:
 return false
 }
 }

 /**
 * Get customer field value for rule matching
 */
 private getCustomerFieldValue(customer: Customer, field: string): any {
 switch (field) {
 case 'totalSpent':
 return customer.totalSpent
 case 'totalOrders':
 return customer.totalOrders
 case 'lastOrderAt':
 return customer.lastOrderAt
 case 'email':
 return customer.email
 case 'status':
 return customer.status
 case 'acceptsMarketing':
 return customer.acceptsMarketing
 case 'groupId':
 return customer.groupId
 case 'tags':
 return customer.tags
 default:
 return null
 }
 }

 /**
 * Check if customer matches segment conditions
 */
 private matchesConditions(customer: Customer, conditions: SegmentCondition): boolean {
 if (conditions.minSpent !== undefined && customer.totalSpent < conditions.minSpent) {
 return false
 }

 if (conditions.maxSpent !== undefined && customer.totalSpent > conditions.maxSpent) {
 return false
 }

 if (conditions.minOrderCount !== undefined && customer.totalOrders < conditions.minOrderCount) {
 return false
 }

 if (conditions.maxOrderCount !== undefined && customer.totalOrders > conditions.maxOrderCount) {
 return false
 }

 if (conditions.lastOrderDaysAgo !== undefined) {
 if (!customer.lastOrderAt) {
 return false
 }
 const daysSinceLastOrder = DateTime.now().diff(customer.lastOrderAt, 'days').days
 if (daysSinceLastOrder > conditions.lastOrderDaysAgo) {
 return false
 }
 }

 if (conditions.tags && conditions.tags.length > 0) {
 const hasAllTags = conditions.tags.every((tag) => customer.tags.includes(tag))
 if (!hasAllTags) {
 return false
 }
 }

 return true
 }

 /**
 * Mark as calculated
 */
 async markAsCalculated(): Promise<void> {
 this.lastCalculatedAt = DateTime.now()
 await this.save()
 }

 /**
 * Update customer count
 */
 async updateCustomerCount(): Promise<void> {
 const count = await CustomerSegment.query()
 .where('customer_segments.id', this.id)
 .join('customer_segment_assignments', 'customer_segment_assignments.segmentId', 'customer_segments.id')
 .count('* as total')
 .first()

 this.customerCount = Number(count?.$extras.total || 0)
 await this.save()
 }
}
