/**
 * Advanced Inventory Service
 *
 * Handles inventory reservations, alerts, backorders, and low stock management.
 */

import Product from '#models/product'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import logger from '@adonisjs/core/services/logger'

export interface ReservationOptions {
  productId: string
  variantId?: string
  storeId: string
  quantity: number
  reservationType: 'cart' | 'order' | 'backorder' | 'transfer'
  entityId: string
  expireMinutes?: number
}

export interface InventoryAlert {
  productId: string
  variantId?: string
  storeId: string
  type: 'low_stock' | 'out_of_stock' | 'overstock' | 'backorder_threshold'
  currentStock: number
  threshold: number
  severity: 'info' | 'warning' | 'critical'
}

export default class AdvancedInventoryService {
  private static instance: AdvancedInventoryService

  private constructor() {}

  static getInstance(): AdvancedInventoryService {
    if (!AdvancedInventoryService.instance) {
      AdvancedInventoryService.instance = new AdvancedInventoryService()
    }
    return AdvancedInventoryService.instance
  }

  /**
   * Reserve inventory for cart/order
   */
  async reserveInventory(options: ReservationOptions): Promise<string> {
    const { productId, variantId, storeId, quantity, reservationType, entityId, expireMinutes = 30 } = options

    // Check current stock
    const product = await Product.find(productId)
    if (!product) {
      throw new Error('Product not found')
    }

    const currentStock = product.stockQuantity || 0

    // Check if enough stock available
    const activeReservations = await db
      .from('inventory_reservations')
      .sum('quantity as total')
      .where('productId', productId)
      .where('variantId', variantId || null)
      .where('storeId', storeId)
      .where('status', 'active')
      .where('expiresAt', '>', DateTime.now().toSQL())
      .first()

    const reservedQuantity = Number(activeReservations?.total || 0)
    const availableQuantity = currentStock - reservedQuantity

    if (quantity > availableQuantity) {
      // Check if backorders allowed
      if (product.allowBackorder) {
        // Create backorder reservation
        return await this.createReservation({
          ...options,
          reservationType: 'backorder',
        })
      } else {
        throw new Error(`Insufficient stock. Available: ${availableQuantity}, Requested: ${quantity}`)
      }
    }

    // Create reservation
    return await this.createReservation({
      productId,
      variantId,
      storeId,
      quantity,
      reservationType,
      entityId,
      expireMinutes,
    })
  }

  /**
   * Create inventory reservation
   */
  private async createReservation(options: ReservationOptions & { expireMinutes: number }): Promise<string> {
    const expiresAt = DateTime.now().plus({ minutes: options.expireMinutes })

    const [reservationId] = await db
      .table('inventory_reservations')
      .insert({
        productId: options.productId,
        variantId: options.variantId || null,
        storeId: options.storeId,
        quantity: options.quantity,
        reservationType: options.reservationType,
        entityId: options.entityId,
        status: 'active',
        expiresAt: expiresAt.toSQL(),
        createdAt: DateTime.now().toSQL(),
        updatedAt: DateTime.now().toSQL(),
      })
      .returning('id')

    return reservationId
  }

  /**
   * Consume reservation (when order is placed)
   */
  async consumeReservation(reservationId: string): Promise<void> {
    await db
      .from('inventory_reservations')
      .where('id', reservationId)
      .where('status', 'active')
      .update({
        status: 'consumed',
        consumedAt: DateTime.now().toSQL(),
        updatedAt: DateTime.now().toSQL(),
      })
  }

  /**
   * Release reservation (when cart is abandoned/expired)
   */
  async releaseReservation(reservationId: string): Promise<void> {
    await db
      .from('inventory_reservations')
      .where('id', reservationId)
      .where('status', 'active')
      .update({
        status: 'released',
        releasedAt: DateTime.now().toSQL(),
        updatedAt: DateTime.now().toSQL(),
      })
  }

  /**
   * Cancel reservation
   */
  async cancelReservation(reservationId: string): Promise<void> {
    await db
      .from('inventory_reservations')
      .where('id', reservationId)
      .where('status', 'active')
      .update({
        status: 'cancelled',
        updatedAt: DateTime.now().toSQL(),
        releasedAt: DateTime.now().toSQL(),
      })
  }

  /**
   * Get active reservations for product
   */
  async getActiveReservations(productId: string, variantId?: string): Promise<any[]> {
    return await db
      .from('inventory_reservations')
      .where('productId', productId)
      .where('variantId', variantId || null)
      .where('status', 'active')
      .where('expiresAt', '>', DateTime.now().toSQL())
  }

  /**
   * Clean expired reservations
   */
  async cleanExpiredReservations(): Promise<number> {
    const result = await db
      .from('inventory_reservations')
      .where('status', 'active')
      .where('expiresAt', '<', DateTime.now().toSQL())
      .update({
        status: 'expired',
        updatedAt: DateTime.now().toSQL(),
        releasedAt: DateTime.now().toSQL(),
      })

    return result || 0
  }

  /**
   * Check inventory and create alerts
   */
  async checkInventoryAlerts(productId: string, variantId: string | undefined, storeId: string): Promise<void> {
    const product = await Product.find(productId)
    if (!product) return

    const currentStock = product.stockQuantity || 0
    const lowStockThreshold = product.lowStockThreshold || 10
    const backorderThreshold = product.backorderThreshold || 0

    // Check for out of stock
    if (currentStock === 0) {
      await this.createAlert({
        productId,
        variantId,
        storeId,
        type: 'out_of_stock',
        currentStock,
        threshold: 1,
        severity: 'critical',
      })
    }
    // Check for low stock
    else if (currentStock <= lowStockThreshold) {
      await this.createAlert({
        productId,
        variantId,
        storeId,
        type: 'low_stock',
        currentStock,
        threshold: lowStockThreshold,
        severity: currentStock === 0 ? 'critical' : 'warning',
      })
    }

    // Check backorder threshold
    if (product.allowBackorder && currentStock <= backorderThreshold) {
      await this.createAlert({
        productId,
        variantId,
        storeId,
        type: 'backorder_threshold',
        currentStock,
        threshold: backorderThreshold,
        severity: 'warning',
      })
    }
  }

  /**
   * Create inventory alert
   */
  async createAlert(alert: InventoryAlert): Promise<void> {
    // Check if similar active alert exists
    const existing = await db
      .from('inventory_alerts')
      .where('productId', alert.productId)
      .where('variantId', alert.variantId || null)
      .where('storeId', alert.storeId)
      .where('type', alert.type)
      .where('status', 'active')
      .first()

    if (existing) {
      // Update existing alert
      await db
        .from('inventory_alerts')
        .where('id', existing.id)
        .update({
          currentStock: alert.currentStock,
          severity: alert.severity,
          updatedAt: DateTime.now().toSQL(),
        })
    } else {
      // Create new alert
      await db.from('inventory_alerts').insert({
        productId: alert.productId,
        variantId: alert.variantId || null,
        storeId: alert.storeId,
        type: alert.type,
        currentStock: alert.currentStock,
        threshold: alert.threshold,
        severity: alert.severity,
        status: 'active',
        triggeredAt: DateTime.now().toSQL(),
        createdAt: DateTime.now().toSQL(),
        updatedAt: DateTime.now().toSQL(),
      })

      // TODO: Send notifications
      logger.info({
        type: 'inventory_alert',
        alertType: alert.type,
        productId: alert.productId,
        variantId: alert.variantId,
        severity: alert.severity,
      }, 'Inventory alert created')
    }
  }

  /**
   * Get active alerts
   */
  async getActiveAlerts(filters: {
    storeId?: string
    type?: string
    severity?: string
    limit?: number
  } = {}): Promise<any[]> {
    const query = db.from('inventory_alerts').where('status', 'active')

    if (filters.storeId) {
      query.where('storeId', filters.storeId)
    }

    if (filters.type) {
      query.where('type', filters.type)
    }

    if (filters.severity) {
      query.where('severity', filters.severity)
    }

    query.orderBy('triggeredAt', 'desc')

    if (filters.limit) {
      query.limit(filters.limit)
    }

    return await query
  }

  /**
   * Acknowledge alert
   */
  async acknowledgeAlert(alertId: string): Promise<void> {
    await db
      .from('inventory_alerts')
      .where('id', alertId)
      .where('status', 'active')
      .update({
        status: 'acknowledged',
        acknowledgedAt: DateTime.now().toSQL(),
        updatedAt: DateTime.now().toSQL(),
      })
  }

  /**
   * Resolve alert
   */
  async resolveAlert(alertId: string, notes?: string): Promise<void> {
    await db
      .from('inventory_alerts')
      .where('id', alertId)
      .whereIn('status', ['active', 'acknowledged'])
      .update({
        status: 'resolved',
        resolutionNotes: notes || null,
        resolvedAt: DateTime.now().toSQL(),
        updatedAt: DateTime.now().toSQL(),
      })
  }

  /**
   * Dismiss alert
   */
  async dismissAlert(alertId: string): Promise<void> {
    await db
      .from('inventory_alerts')
      .where('id', alertId)
      .whereIn('status', ['active', 'acknowledged'])
      .update({
        status: 'dismissed',
        updatedAt: DateTime.now().toSQL(),
      })
  }

  /**
   * Get inventory statistics
   */
  async getInventoryStatistics(storeId: string): Promise<{
    totalProducts: number
    lowStockCount: number
    outOfStockCount: number
    activeReservations: number
    backorderCount: number
  }> {
    // Run all queries in parallel for better performance
    const [totalResult, lowStockResult, outOfStockResult, reservationsResult, backorderResult] =
      await Promise.all([
        // Total products
        db
          .from('products')
          .count('* as count')
          .where('storeId', storeId)
          .where('status', 'active')
          .first(),

        // Low stock products
        db
          .from('inventory_alerts')
          .countDistinct('productId as count')
          .where('storeId', storeId)
          .where('type', 'low_stock')
          .where('status', 'active')
          .first(),

        // Out of stock products
        db
          .from('inventory_alerts')
          .countDistinct('productId as count')
          .where('storeId', storeId)
          .where('type', 'out_of_stock')
          .where('status', 'active')
          .first(),

        // Active reservations
        db
          .from('inventory_reservations')
          .count('* as count')
          .where('storeId', storeId)
          .where('status', 'active')
          .where('expiresAt', '>', DateTime.now().toSQL())
          .first(),

        // Backorders
        db
          .from('inventory_reservations')
          .count('* as count')
          .where('storeId', storeId)
          .where('reservationType', 'backorder')
          .where('status', 'active')
          .first(),
      ])

    const totalProducts = Number(totalResult?.count || 0)
    const lowStockCount = Number(lowStockResult?.count || 0)
    const outOfStockCount = Number(outOfStockResult?.count || 0)
    const activeReservations = Number(reservationsResult?.count || 0)
    const backorderCount = Number(backorderResult?.count || 0)

    return {
      totalProducts,
      lowStockCount,
      outOfStockCount,
      activeReservations,
      backorderCount,
    }
  }
}

/**
 * Export singleton instance
 */
export const advancedInventoryService = AdvancedInventoryService.getInstance()
