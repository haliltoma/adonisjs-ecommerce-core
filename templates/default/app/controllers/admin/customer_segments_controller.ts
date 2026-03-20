/**
 * Admin Customer Segments Controller
 */

import type { HttpContext } from '@adonisjs/core/http'
import CustomerSegment from '#models/customer_segment'
import { segmentAssignmentService } from '#services/segment_assignment_service'
import { DateTime } from 'luxon'

export default class AdminCustomerSegmentsController {
  /**
   * Show create form (for REST API compatibility)
   */
  async create({ response }: HttpContext) {
    return response.status(200).json({
      message: 'Use POST /segments to create a new segment',
      method: 'store',
    })
  }

  /**
   * List all segments
   */
  async index({ request }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const type = request.input('type')
    const isActive = request.input('isActive')

    const query = CustomerSegment.query()

    if (type) {
      query.where('type', type)
    }

    if (isActive !== undefined) {
      query.where('isActive', isActive === 'true')
    }

    const segments = await query.orderBy('priority', 'desc').paginate(page, limit)

    return segments.serialize({
      fields: {
        pick: ['id', 'name', 'slug', 'description', 'type', 'priority', 'isActive', 'isPublic', 'customerCount', 'lastCalculatedAt', 'createdAt'],
      },
    })
  }

  /**
   * Get segment details
   */
  async show({ params }: HttpContext) {
    const segment = await CustomerSegment.findOrFail(params.id)

    await segment.load('customers', (query) => {
      query.select('id', 'email', 'firstName', 'lastName').limit(10)
    })

    return segment.serialize()
  }

  /**
   * Create new segment
   */
  async store({ request }: HttpContext) {
    const data = request.only([
      'name',
      'slug',
      'description',
      'type',
      'rules',
      'conditions',
      'currencyCode',
      'priority',
      'isActive',
      'isPublic',
    ])

    const segment = await CustomerSegment.create({
      ...data,
      customerCount: 0,
    })

    return segment.serialize()
  }

  /**
   * Update segment
   */
  async update({ params, request }: HttpContext) {
    const segment = await CustomerSegment.findOrFail(params.id)

    const data = request.only([
      'name',
      'slug',
      'description',
      'type',
      'rules',
      'conditions',
      'currencyCode',
      'priority',
      'isActive',
      'isPublic',
    ])

    segment.merge(data)

    // If rules/conditions changed for dynamic segment, reset lastCalculatedAt
    if (segment.isDynamic && (data.rules || data.conditions)) {
      segment.lastCalculatedAt = null
    }

    await segment.save()

    return segment.serialize()
  }

  /**
   * Delete segment
   */
  async destroy({ params, response }: HttpContext) {
    const segment = await CustomerSegment.findOrFail(params.id)

    await segment.delete()

    return response.status(204)
  }

  /**
   * Recalculate segment
   */
  async recalculate({ params }: HttpContext) {
    const result = await segmentAssignmentService.recalculateSegment(params.id)

    return {
      message: 'Segment recalculated successfully',
      ...result,
    }
  }

  /**
   * Recalculate all dynamic segments
   */
  async recalculateAll({ response }: HttpContext) {
    const result = await segmentAssignmentService.recalculateAllSegments()

    return response.json({
      message: `Recalculated ${result.segmentsProcessed} segments with ${result.totalChanges} total changes`,
      ...result,
    })
  }

  /**
   * Get segment customers
   */
  async customers({ params, request }: HttpContext) {
    const segment = await CustomerSegment.findOrFail(params.id)

    const page = request.input('page', 1)
    const limit = request.input('limit', 20)

    await segment.load('customers', (query) => {
      query.select('id', 'email', 'firstName', 'lastName', 'totalSpent', 'totalOrders').paginate(page, limit)
    })

    return segment.customers
  }

  /**
   * Manually assign customer to segment
   */
  async assignCustomer({ params, request }: HttpContext) {
    const customerId = request.input('customerId')
    const metadata = request.input('metadata')

    await segmentAssignmentService.assignManually(customerId, params.id, metadata)

    return {
      message: 'Customer assigned to segment successfully',
    }
  }

  /**
   * Manually remove customer from segment
   */
  async removeCustomer({ params, request }: HttpContext) {
    const customerId = request.input('customerId')

    await segmentAssignmentService.removeManually(customerId, params.id)

    return {
      message: 'Customer removed from segment successfully',
    }
  }

  /**
   * Get segment statistics
   */
  async stats({ params }: HttpContext) {
    const segment = await CustomerSegment.findOrFail(params.id)

    await segment.load('customers')

    const customers = segment.customers

    const totalSpent = customers.reduce((sum, c) => sum + c.totalSpent, 0)
    const totalOrders = customers.reduce((sum, c) => sum + c.totalOrders, 0)
    const avgSpent = customers.length > 0 ? totalSpent / customers.length : 0

    return {
      customerCount: customers.length,
      totalSpent,
      totalOrders,
      avgSpent,
      lastCalculatedAt: segment.lastCalculatedAt,
      needsRecalculation: segment.needsRecalculation,
    }
  }

  /**
   * Bulk assign customers to segment
   */
  async bulkAssign({ params, request }: HttpContext) {
    const customerIds = request.input('customerIds', [])

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const customerId of customerIds) {
      try {
        await segmentAssignmentService.assignManually(customerId, params.id)
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`${customerId}: ${(error as Error).message}`)
      }
    }

    return results
  }

  /**
   * Bulk remove customers from segment
   */
  async bulkRemove({ params, request }: HttpContext) {
    const customerIds = request.input('customerIds', [])

    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const customerId of customerIds) {
      try {
        await segmentAssignmentService.removeManually(customerId, params.id)
        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(`${customerId}: ${(error as Error).message}`)
      }
    }

    return results
  }

  /**
   * Clone segment
   */
  async clone({ params, request }: HttpContext) {
    const original = await CustomerSegment.findOrFail(params.id)

    const name = request.input('name', `${original.name} (Copy)`)

    const cloned = await CustomerSegment.create({
      name,
      slug: `${original.slug}-copy-${DateTime.now().toFormat('yyyy-MM-dd-HHmmss')}`,
      description: original.description,
      type: original.type,
      rules: original.rules,
      conditions: original.conditions,
      currencyCode: original.currencyCode,
      priority: original.priority,
      isActive: false, // Start as inactive
      isPublic: false,
      customerCount: 0,
    })

    return cloned.serialize()
  }
}
