/**
 * Return Item Model
 *
 * Individual line items in a return request.
 */

import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Return from './return.js'
import OrderItem from './order_item.js'
import ReturnReason from './return_reason.js'
import { jsonColumn } from '#helpers/json_column'

export default class ReturnItem extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare returnId: string

  @column()
  declare orderItemId: string

  @column()
  declare returnReasonId: string | null

  // Product info snapshot
  @column()
  declare productId: string

  @column()
  declare variantId: string | null

  @column()
  declare productName: string

  @column()
  declare productSku: string | null

  @column(jsonColumn())
  declare productAttributes: Record<string, any> | null

  @column()
  declare quantity: number

  @column()
  declare receivedQuantity: number

  @column()
  declare condition: 'new' | 'opened' | 'used' | 'damaged' | 'defective'

  @column()
  declare conditionNotes: string | null

  @column()
  declare resolution: 'refund' | 'exchange' | 'repair' | 'dispose' | null

  // Exchange details
  @column()
  declare exchangeForVariantId: string | null

  @column()
  declare exchangeForVariantName: string | null

  // Refund amount
  @column()
  declare refundAmount: number | null

  // Inspection results
  @column()
  declare passInspection: boolean | null

  @column()
  declare inspectionNotes: string | null

  @column(jsonColumn())
  declare inspectionPhotos: string[] | null

  @column()
  declare note: string | null

  @column(jsonColumn())
  declare metadata: Record<string, unknown>

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Return)
  declare return: BelongsTo<typeof Return>

  @belongsTo(() => OrderItem)
  declare orderItem: BelongsTo<typeof OrderItem>

  @belongsTo(() => ReturnReason)
  declare reason: BelongsTo<typeof ReturnReason>

  /**
   * Check if all quantity has been received
   */
  get isFullyReceived(): boolean {
    return this.receivedQuantity >= this.quantity
  }

  /**
   * Check if item has been inspected
   */
  get getIsInspected(): boolean {
    return this.passInspection !== null
  }

  /**
   * Get condition display text
   */
  getConditionDisplay(): string {
    const conditions: Record<string, string> = {
      new: 'New / Unopened',
      opened: 'Opened',
      used: 'Used',
      damaged: 'Damaged',
      defective: 'Defective',
    }
    return conditions[this.condition] || this.condition
  }

  /**
   * Get resolution display text
   */
  getResolutionDisplay(): string {
    if (!this.resolution) return 'Pending'

    const resolutions: Record<string, string> = {
      refund: 'Refund',
      exchange: 'Exchange',
      repair: 'Repair',
      dispose: 'Dispose',
    }
    return resolutions[this.resolution] || this.resolution
  }
}
