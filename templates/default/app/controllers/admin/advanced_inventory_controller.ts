/**
 * Admin Advanced Inventory Controller
 *
 * Manages inventory reservations, alerts, and backorders.
 */

import type { HttpContext } from '@adonisjs/core/http'
import { advancedInventoryService } from '#services/advanced_inventory_service'

export default class AdminAdvancedInventoryController {
  /**
   * Get inventory statistics
   */
  async statistics({ params, response }: HttpContext) {
    const stats = await advancedInventoryService.getInventoryStatistics(params.storeId)

    return response.json(stats)
  }

  /**
   * Get active inventory alerts
   */
  async alerts({ request, response }: HttpContext) {
    const storeId = request.input('storeId')
    const type = request.input('type')
    const severity = request.input('severity')
    const limit = request.input('limit', 50)

    const alerts = await advancedInventoryService.getActiveAlerts({
      storeId,
      type,
      severity,
      limit,
    })

    return response.json({ data: alerts })
  }

  /**
   * Acknowledge inventory alert
   */
  async acknowledgeAlert({ params, response }: HttpContext) {
    await advancedInventoryService.acknowledgeAlert(params.id)

    return response.json({
      message: 'Alert acknowledged',
    })
  }

  /**
   * Resolve inventory alert
   */
  async resolveAlert({ params, request, response }: HttpContext) {
    const notes = request.input('notes')

    await advancedInventoryService.resolveAlert(params.id, notes)

    return response.json({
      message: 'Alert resolved',
    })
  }

  /**
   * Dismiss inventory alert
   */
  async dismissAlert({ params, response }: HttpContext) {
    await advancedInventoryService.dismissAlert(params.id)

    return response.json({
      message: 'Alert dismissed',
    })
  }

  /**
   * Get active reservations
   */
  async reservations({ request, response }: HttpContext) {
    const productId = request.input('productId')
    const variantId = request.input('variantId')

    const reservations = await advancedInventoryService.getActiveReservations(productId, variantId)

    return response.json({ data: reservations })
  }

  /**
   * Reserve inventory
   */
  async reserveInventory({ request, response }: HttpContext) {
    const data = request.only([
      'productId',
      'variantId',
      'storeId',
      'quantity',
      'reservationType',
      'entityId',
      'expireMinutes',
    ])

    try {
      const reservationId = await advancedInventoryService.reserveInventory(data)

      return response.json({
        message: 'Inventory reserved successfully',
        reservationId,
      })
    } catch (error) {
      return response.status(400).json({
        error: (error as Error).message,
      })
    }
  }

  /**
   * Consume reservation
   */
  async consumeReservation({ params, response }: HttpContext) {
    await advancedInventoryService.consumeReservation(params.id)

    return response.json({
      message: 'Reservation consumed',
    })
  }

  /**
   * Release reservation
   */
  async releaseReservation({ params, response }: HttpContext) {
    await advancedInventoryService.releaseReservation(params.id)

    return response.json({
      message: 'Reservation released',
    })
  }

  /**
   * Cancel reservation
   */
  async cancelReservation({ params, response }: HttpContext) {
    await advancedInventoryService.cancelReservation(params.id)

    return response.json({
      message: 'Reservation cancelled',
    })
  }

  /**
   * Clean expired reservations
   */
  async cleanExpiredReservations({ response }: HttpContext) {
    const cleaned = await advancedInventoryService.cleanExpiredReservations()

    return response.json({
      message: `Cleaned ${cleaned} expired reservations`,
      cleaned,
    })
  }

  /**
   * Check inventory for alerts
   */
  async checkInventory({ request, response }: HttpContext) {
    const productId = request.input('productId')
    const variantId = request.input('variantId')
    const storeId = request.input('storeId')

    await advancedInventoryService.checkInventoryAlerts(productId, variantId, storeId)

    return response.json({
      message: 'Inventory check complete',
    })
  }

  /**
   * Bulk acknowledge alerts
   */
  async bulkAcknowledgeAlerts({ request, response }: HttpContext) {
    const alertIds = request.input('alertIds', [])

    let acknowledged = 0
    for (const alertId of alertIds) {
      try {
        await advancedInventoryService.acknowledgeAlert(alertId)
        acknowledged++
      } catch (error) {
        // Continue with next alert
      }
    }

    return response.json({
      message: `Acknowledged ${acknowledged} alerts`,
      acknowledged,
    })
  }

  /**
   * Bulk resolve alerts
   */
  async bulkResolveAlerts({ request, response }: HttpContext) {
    const alertIds = request.input('alertIds', [])
    const notes = request.input('notes')

    let resolved = 0
    for (const alertId of alertIds) {
      try {
        await advancedInventoryService.resolveAlert(alertId, notes)
        resolved++
      } catch (error) {
        // Continue with next alert
      }
    }

    return response.json({
      message: `Resolved ${resolved} alerts`,
      resolved,
    })
  }
}
