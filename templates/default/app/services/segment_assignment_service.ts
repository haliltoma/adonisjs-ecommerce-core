/**
 * Segment Assignment Service
 *
 * Automatically assigns customers to segments based on rules and conditions.
 */

import Customer from '#models/customer'
import CustomerSegment from '#models/customer_segment'
import { DateTime } from 'luxon'
import Database from '@adonisjs/lucid/services/database'

export default class SegmentAssignmentService {
  private static instance: SegmentAssignmentService

  private constructor() {}

  static getInstance(): SegmentAssignmentService {
    if (!SegmentAssignmentService.instance) {
      SegmentAssignmentService.instance = new SegmentAssignmentService()
    }
    return SegmentAssignmentService.instance
  }

  /**
   * Assign customer to all matching segments
   */
  async assignCustomerToSegments(customerId: string): Promise<{
    assigned: string[]
    removed: string[]
  }> {
    const customer = await Customer.find(customerId)
    if (!customer) {
      throw new Error('Customer not found')
    }

    const segments = await CustomerSegment.query().where('isActive', true)

    const assigned: string[] = []
    const removed: string[] = []

    // Use transaction for consistency
    const trx = await Database.transaction()

    try {
      for (const segment of segments) {
        const matches = segment.matchesCustomer(customer)

        // Check if already assigned
        const existingAssignment = await trx
          .from('customer_segment_assignments')
          .where('customerId', customerId)
          .where('segmentId', segment.id)
          .first()

        if (matches && !existingAssignment) {
          // Assign to segment
          await trx.insert({
            customerId,
            segmentId: segment.id,
            assignedAt: DateTime.now().toSQL(),
            metadata: null,
          }).into('customer_segment_assignments')

          assigned.push(segment.name)
        } else if (!matches && existingAssignment && segment.isDynamic) {
          // Remove from dynamic segment if no longer matches
          await trx
            .from('customer_segment_assignments')
            .where('customerId', customerId)
            .where('segmentId', segment.id)
            .delete()

          removed.push(segment.name)
        }
      }

      await trx.commit()
    } catch (error) {
      await trx.rollback()
      throw error
    }

    return { assigned, removed }
  }

  /**
   * Recalculate all customers for a segment
   */
  async recalculateSegment(segmentId: string): Promise<{
    added: number
    removed: number
    total: number
  }> {
    const segment = await CustomerSegment.find(segmentId)
    if (!segment) {
      throw new Error('Segment not found')
    }

    if (!segment.isDynamic) {
      throw new Error('Cannot recalculate manual segments')
    }

    // Get all customers
    const customers = await Customer.all()

    let added = 0
    let removed = 0

    const trx = await Database.transaction()

    try {
      for (const customer of customers) {
        const matches = segment.matchesCustomer(customer)

        // Check existing assignment
        const existingAssignment = await trx
          .from('customer_segment_assignments')
          .where('customerId', customer.id)
          .where('segmentId', segmentId)
          .first()

        if (matches && !existingAssignment) {
          // Add to segment
          await trx.insert({
            customerId: customer.id,
            segmentId,
            assignedAt: DateTime.now().toSQL(),
            metadata: null,
          }).into('customer_segment_assignments')

          added++
        } else if (!matches && existingAssignment) {
          // Remove from segment
          await trx
            .from('customer_segment_assignments')
            .where('customerId', customer.id)
            .where('segmentId', segmentId)
          .delete()

          removed++
        }
      }

      await trx.commit()

      // Mark segment as calculated
      await segment.markAsCalculated()

      // Update customer count
      await segment.updateCustomerCount()
    } catch (error) {
      await trx.rollback()
      throw error
    }

    return { added, removed, total: customers.length }
  }

  /**
   * Batch recalculate all dynamic segments
   */
  async recalculateAllSegments(): Promise<{
    segmentsProcessed: number
    totalChanges: number
  }> {
    const segments = await CustomerSegment.query()
      .where('isActive', true)
      .where('type', 'in', ['dynamic', 'behavioral', 'demographic'])

    let totalChanges = 0

    for (const segment of segments) {
      const result = await this.recalculateSegment(segment.id)
      totalChanges += result.added + result.removed
    }

    return {
      segmentsProcessed: segments.length,
      totalChanges,
    }
  }

  /**
   * Manually assign customer to segment
   */
  async assignManually(customerId: string, segmentId: string, metadata?: Record<string, any>): Promise<void> {
    const segment = await CustomerSegment.find(segmentId)
    if (!segment) {
      throw new Error('Segment not found')
    }

    if (segment.isDynamic) {
      throw new Error('Cannot manually assign to dynamic segments')
    }

    const customer = await Customer.find(customerId)
    if (!customer) {
      throw new Error('Customer not found')
    }

    // Check if already assigned
    const existing = await db
      .from('customer_segment_assignments')
      .where('customerId', customerId)
      .where('segmentId', segmentId)
      .first()

    if (existing) {
      throw new Error('Customer already assigned to this segment')
    }

    // Assign
    await Database.table('customer_segment_assignments').insert({
      customerId,
      segmentId,
      assignedAt: DateTime.now().toSQL(),
      metadata: metadata ? JSON.stringify(metadata) : null,
    })

    // Update customer count
    await segment.updateCustomerCount()
  }

  /**
   * Manually remove customer from segment
   */
  async removeManually(customerId: string, segmentId: string): Promise<void> {
    const segment = await CustomerSegment.find(segmentId)
    if (!segment) {
      throw new Error('Segment not found')
    }

    // Check if assigned
    const existing = await db
      .from('customer_segment_assignments')
      .where('customerId', customerId)
      .where('segmentId', segmentId)
      .first()

    if (!existing) {
      throw new Error('Customer not assigned to this segment')
    }

    // Remove
    await db
      .from('customer_segment_assignments')
      .where('customerId', customerId)
      .where('segmentId', segmentId)
      .delete()

    // Update customer count
    await segment.updateCustomerCount()
  }

  /**
   * Get customer segments with priority ordering
   */
  async getCustomerSegments(customerId: string): Promise<CustomerSegment[]> {
    const segments = await CustomerSegment.query()
      .where('isActive', true)
      .whereHas('customers', (query) => {
        query.where('customers.id', customerId)
      })
      .orderBy('priority', 'desc')

    return segments
  }

  /**
   * Get applicable segment for pricing
   */
  async getPricingSegment(customerId: string): Promise<CustomerSegment | null> {
    const segments = await this.getCustomerSegments(customerId)

    // Return highest priority segment with currency code
    return segments.find((s) => s.currencyCode !== null) || null
  }

  /**
   * Check if customer is in any of the given segments
   */
  async isInSegments(customerId: string, segmentSlugs: string[]): Promise<boolean> {
    const count = await db
      .from('customer_segment_assignments')
      .join('customer_segments', 'customer_segments.id', 'customer_segment_assignments.segmentId')
      .where('customer_segment_assignments.customerId', customerId)
      .whereIn('customer_segments.slug', segmentSlugs)
      .count('* as count')
      .first()

    return Number(count?.count || 0) > 0
  }
}

/**
 * Export singleton instance
 */
export const segmentAssignmentService = SegmentAssignmentService.getInstance()
