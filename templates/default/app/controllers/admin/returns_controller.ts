/**
 * Admin Returns Controller
 *
 * Manages RMA (Return Merchandise Authorization) requests.
 */

import type { HttpContext } from '@adonisjs/core/http'
import Return from '#models/return'
import { returnsService } from '#services/returns_service'

export default class AdminReturnsController {
  /**
   * List all returns
   */
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')
    const customerId = request.input('customerId')
    const orderId = request.input('orderId')

    const query = Return.query()

    if (status) {
      query.where('status', status)
    }

    if (customerId) {
      query.where('customerId', customerId)
    }

    if (orderId) {
      query.where('orderId', orderId)
    }

    const returns = await query
      .preload('items')
      .preload('customer')
      .preload('order')
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)

    return returns.serialize({
      fields: {
        pick: ['id', 'returnNumber', 'orderNumber', 'status', 'reason', 'refundAmount', 'createdAt'],
      },
    })
  }

  /**
   * Get return details
   */
  async show({ params }: HttpContext) {
    const returnRecord = await Return.findOrFail(params.id)

    await returnRecord.load('items', (itemsQuery) => {
      itemsQuery.preload('orderItem')
    })
    await returnRecord.load('customer')
    await returnRecord.load('order')

    return returnRecord.serialize()
  }

  /**
   * Get return by return number
   */
  async findByNumber({ params }: HttpContext) {
    const returnRecord = await returnsService.getReturnByNumber(params.number)

    if (!returnRecord) {
      return { error: 'Return not found' }
    }

    return returnRecord.serialize()
  }

  /**
   * Approve return request
   */
  async approve({ params, request, response }: HttpContext) {
    const returnRecord = await returnsService.approveReturn(
      params.id,
      request.input('approvedBy'),
      request.input('notes')
    )

    return response.json({
      message: 'Return approved successfully',
      data: returnRecord.serialize(),
    })
  }

  /**
   * Reject return request
   */
  async reject({ params, request, response }: HttpContext) {
    const returnRecord = await returnsService.rejectReturn(
      params.id,
      request.input('rejectedBy'),
      request.input('reason')
    )

    return response.json({
      message: 'Return rejected',
      data: returnRecord.serialize(),
    })
  }

  /**
   * Mark return as received
   */
  async markReceived({ params, request, response }: HttpContext) {
    const trackingNumber = request.input('trackingNumber')
    const returnRecord = await returnsService.markAsReceived(params.id, trackingNumber)

    return response.json({
      message: 'Return marked as received',
      data: returnRecord.serialize(),
    })
  }

  /**
   * Complete inspection
   */
  async completeInspection({ params, request, response }: HttpContext) {
    const notes = request.input('notes')
    const returnRecord = await returnsService.completeInspection(params.id, notes)

    return response.json({
      message: 'Inspection completed',
      data: returnRecord.serialize(),
    })
  }

  /**
   * Process return with refund
   */
  async process({ params, request, response }: HttpContext) {
    const resolution = request.input('resolution', 'refund')
    const returnRecord = await returnsService.processRefund(params.id, resolution)

    return response.json({
      message: 'Return processed successfully',
      data: returnRecord.serialize(),
    })
  }

  /**
   * Cancel return
   */
  async cancel({ params, request, response }: HttpContext) {
    const returnRecord = await Return.findOrFail(params.id)

    await returnRecord.cancel(request.input('reason'))

    return response.json({
      message: 'Return cancelled',
      data: returnRecord.serialize(),
    })
  }

  /**
   * Get pending returns
   */
  async pending({ response }: HttpContext) {
    const returns = await returnsService.getPendingReturns()

    return response.json({
      data: returns.map((r) => r.serialize()),
    })
  }

  /**
   * Get overdue returns
   */
  async overdue({ response }: HttpContext) {
    const returns = await returnsService.getOverdueReturns()

    return response.json({
      data: returns.map((r) => r.serialize()),
    })
  }

  /**
   * Get return statistics
   */
  async statistics({ request }: HttpContext) {
    const days = request.input('days', 30)

    const stats = await returnsService.getStatistics(days)

    return stats
  }

  /**
   * Get customer returns
   */
  async customerReturns({ params, request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    const returns = await returnsService.getCustomerReturns(params.customerId, page, limit)

    return returns.serialize()
  }

  /**
   * Bulk update returns
   */
  async bulkUpdate({ request, response }: HttpContext) {
    const returnIds = request.input('returnIds', [])
    const action = request.input('action')
    const reason = request.input('reason')

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const returnId of returnIds) {
      try {
        const returnRecord = await Return.find(returnId)

        if (!returnRecord) {
          results.failed++
          results.errors.push(`${returnId}: Return not found`)
          continue
        }

        switch (action) {
          case 'approve':
            await returnRecord.approve(request.input('approvedBy'), reason)
            break
          case 'reject':
            await returnRecord.reject(request.input('rejectedBy'), reason)
            break
          case 'cancel':
            await returnRecord.cancel(reason)
            break
          default:
            throw new Error(`Invalid action: ${action}`)
        }

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`${returnId}: ${(error as Error).message}`)
      }
    }

    return response.json({
      message: `Bulk update complete: ${results.success} success, ${results.failed} failed`,
      ...results,
    })
  }
}
