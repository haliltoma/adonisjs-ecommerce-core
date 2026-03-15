/**
 * Returns Service
 *
 * Business logic for processing returns and refunds.
 */

import Return from '#models/return'
import ReturnItem from '#models/return_item'
import Order from '#models/order'
import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'

export interface CreateReturnOptions {
  orderId: string
  customerId: string
  reason: 'damaged' | 'defective' | 'wrong_item' | 'no_longer_needed' | 'better_price_available' | 'other'
  reasonDetails?: string
  items: Array<{
    orderItemId: string
    quantity: number
    condition: 'new' | 'opened' | 'used' | 'damaged' | 'defective'
    conditionNotes?: string
  }>
  customerNotes?: string
}

export default class ReturnsService {
  private static instance: ReturnsService

  private constructor() {}

  static getInstance(): ReturnsService {
    if (!ReturnsService.instance) {
      ReturnsService.instance = new ReturnsService()
    }
    return ReturnsService.instance
  }

  /**
   * Generate unique return number
   */
  async generateReturnNumber(): Promise<string> {
    const prefix = 'RMA'
    const timestamp = DateTime.now().toFormat('yyyyMMddHHmmss')
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')

    return `${prefix}-${timestamp}-${random}`
  }

  /**
   * Create return request
   */
  async createReturn(options: CreateReturnOptions): Promise<Return> {
    const { orderId, customerId, reason, reasonDetails, items, customerNotes } = options

    // Verify order exists and belongs to customer
    const order = await Order.find(orderId)
    if (!order) {
      throw new Error('Order not found')
    }

    if (order.customerId !== customerId) {
      throw new Error('Order does not belong to customer')
    }

    // Check if order is within return window
    const returnWindowDays = 30
    const orderDate = order.createdAt
    const cutoffDate = orderDate.plus({ days: returnWindowDays })

    if (DateTime.now() > cutoffDate) {
      throw new Error('Order is outside the return window')
    }

    // Generate return number
    const returnNumber = await this.generateReturnNumber()

    // Create return in transaction
    const trx = await db.transaction()

    try {
      const returnRecord = await Return.create(
        {
          storeId: order.storeId,
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerId,
          returnNumber,
          status: 'requested',
          reason,
          reasonDetails,
          note: customerNotes,
          expectedReturnBy: null,
        },
        { client: trx }
      )

      // Create return items
      for (const item of items) {
        // Verify order item exists
        const orderItem = await trx
          .from('order_items')
          .where('id', item.orderItemId)
          .where('orderId', orderId)
          .first()

        if (!orderItem) {
          throw new Error(`Order item ${item.orderItemId} not found`)
        }

        // Verify quantity
        if (item.quantity > orderItem.quantity) {
          throw new Error(`Return quantity exceeds order quantity for item ${item.orderItemId}`)
        }

        await ReturnItem.create(
          {
            returnId: returnRecord.id,
            orderItemId: item.orderItemId,
            productId: orderItem.productId,
            variantId: orderItem.variantId,
            productName: orderItem.productName,
            productSku: orderItem.productSku,
            productAttributes: orderItem.productAttributes,
            quantity: item.quantity,
            receivedQuantity: 0,
            condition: item.condition,
            conditionNotes: item.conditionNotes,
          },
          { client: trx }
        )
      }

      await trx.commit()

      // Load items
      await returnRecord.load('items')

      return returnRecord
    } catch (error) {
      await trx.rollback()
      throw error
    }
  }

  /**
   * Approve return request
   */
  async approveReturn(returnId: string, approvedBy: string, notes?: string): Promise<Return> {
    const returnRecord = await Return.findOrFail(returnId)

    await returnRecord.approve(approvedBy, notes)

    return returnRecord
  }

  /**
   * Reject return request
   */
  async rejectReturn(returnId: string, rejectedBy: string, reason: string): Promise<Return> {
    const returnRecord = await Return.findOrFail(returnId)

    await returnRecord.reject(rejectedBy, reason)

    return returnRecord
  }

  /**
   * Mark return as received
   */
  async markAsReceived(returnId: string, trackingNumber?: string): Promise<Return> {
    const returnRecord = await Return.findOrFail(returnId)

    await returnRecord.markAsReceived(trackingNumber)

    return returnRecord
  }

  /**
   * Complete inspection
   */
  async completeInspection(returnId: string, notes?: string): Promise<Return> {
    const returnRecord = await Return.findOrFail(returnId)

    await returnRecord.completeInspection(notes)

    return returnRecord
  }

  /**
   * Process return with refund
   */
  async processRefund(returnId: string, resolution: 'refund' | 'exchange' | 'store_credit'): Promise<Return> {
    const returnRecord = await Return.findOrFail(returnId)

    // Calculate refund amount
    const refundAmount = await returnRecord.calculateRefundAmount()

    await returnRecord.process(resolution, refundAmount)

    // TODO: Integrate with refund service to actually process the refund

    return returnRecord
  }

  /**
   * Get customer returns
   */
  async getCustomerReturns(customerId: string, page: number = 1, limit: number = 20) {
    const returns = await Return.query()
      .where('customerId', customerId)
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return returns
  }

  /**
   * Get return by number
   */
  async getReturnByNumber(returnNumber: string): Promise<Return | null> {
    return await Return.query().where('returnNumber', returnNumber).preload('items').first()
  }

  /**
   * Get pending returns (action required)
   */
  async getPendingReturns(): Promise<Return[]> {
    return await Return.query()
      .whereIn('status', ['requested', 'received', 'inspected'])
      .preload('items')
      .preload('customer')
      .preload('order')
  }

  /**
   * Get overdue returns
   */
  async getOverdueReturns(): Promise<Return[]> {
    const returns = await Return.query()
      .where('status', 'approved')
      .whereNotNull('expectedReturnBy')
      .preload('items')
      .preload('customer')

    // Filter for overdue
    return returns.filter((r) => r.isOverdue)
  }

  /**
   * Get return statistics
   */
  async getStatistics(days: number = 30): Promise<{
    totalReturns: number
    pendingReturns: number
    approvedReturns: number
    rejectedReturns: number
    completedReturns: number
    totalRefundAmount: number
    averageRefundAmount: number
    topReasons: Array<{ reason: string; count: number }>
  }> {
    const sinceDate = DateTime.now().minus({ days }).toSQL()

    // Run independent queries in parallel
    const [totalResult, statusResults, refundResult, reasonResults] = await Promise.all([
      // Total returns
      db
        .from('returns')
        .count('* as count')
        .where('createdAt', '>=', sinceDate)
        .first(),

      // By status
      db
        .from('returns')
        .select('status')
        .count('* as count')
        .where('createdAt', '>=', sinceDate)
        .groupBy('status'),

      // Refund amounts
      db
        .from('returns')
        .where('createdAt', '>=', sinceDate)
        .whereNotNull('refundAmount')
        .sum('refundAmount as total'),

      // Top reasons
      db
        .from('returns')
        .select('reason')
        .count('* as count')
        .where('createdAt', '>=', sinceDate)
        .groupBy('reason')
        .orderBy('count', 'desc')
        .limit(5),
    ])

    const totalReturns = Number(totalResult?.count || 0)

    const pendingReturns = Number(statusResults.find((r) => r.status === 'requested')?.count || 0) +
                           Number(statusResults.find((r) => r.status === 'received')?.count || 0) +
                           Number(statusResults.find((r) => r.status === 'inspected')?.count || 0)

    const approvedReturns = Number(statusResults.find((r) => r.status === 'approved')?.count || 0)
    const rejectedReturns = Number(statusResults.find((r) => r.status === 'rejected')?.count || 0)
    const completedReturns = Number(statusResults.find((r) => r.status === 'completed')?.count || 0)

    const totalRefundAmount = Number(refundResult[0]?.total || 0)
    const averageRefundAmount = completedReturns > 0 ? totalRefundAmount / completedReturns : 0

    const topReasons = reasonResults.map((r) => ({
      reason: r.reason,
      count: Number(r.count),
    }))

    return {
      totalReturns,
      pendingReturns,
      approvedReturns,
      rejectedReturns,
      completedReturns,
      totalRefundAmount,
      averageRefundAmount,
      topReasons,
    }
  }
}

/**
 * Export singleton instance
 */
export const returnsService = ReturnsService.getInstance()
