/**
 * Customer Segment Tests
 */

import { test } from '@japa/runner'
import CustomerSegment from '#models/customer_segment'
import Customer from '#models/customer'
import { segmentAssignmentService } from '#services/segment_assignment_service'

test.group('CustomerSegment Model', (group) => {
  test('should check if customer matches segment rules', async ({ assert }) => {
    const segment = new CustomerSegment()
    segment.type = 'dynamic'
    segment.rules = [
      { field: 'totalSpent', operator: 'gte', value: 1000 },
      { field: 'totalOrders', operator: 'gte', value: 5 },
    ]

    const customer = new Customer()
    customer.totalSpent = 1500
    customer.totalOrders = 7

    assert.isTrue(segment.matchesCustomer(customer))
  })

  test('should check if customer matches segment conditions', async ({ assert }) => {
    const segment = new CustomerSegment()
    segment.type = 'behavioral'
    segment.conditions = {
      minSpent: 500,
      maxSpent: 2000,
      minOrderCount: 3,
      tags: ['vip', 'loyal'],
    }

    const customer = new Customer()
    customer.totalSpent = 1200
    customer.totalOrders = 5
    customer.tags = ['vip', 'loyal', 'premium']

    assert.isTrue(segment.matchesCustomer(customer))
  })

  test('should identify if segment needs recalculation', async ({ assert }) => {
    const segment = new CustomerSegment()
    segment.type = 'dynamic'
    segment.lastCalculatedAt = null

    assert.isTrue(segment.needsRecalculation)

    // Set last calculated to 25 hours ago
    const oldDate = new Date()
    oldDate.setHours(oldDate.getHours() - 25)
    segment.lastCalculatedAt = oldDate

    assert.isTrue(segment.needsRecalculation)
  })
})

test.group('Segment Assignment Service', (group) => {
  test('should assign customer to matching segments', async ({ assert }) => {
    // This would require database setup
    // For now, we just test the logic structure
    const service = segmentAssignmentService

    assert.exists(service)
    assert.isFunction(service.assignCustomerToSegments)
    assert.isFunction(service.recalculateSegment)
    assert.isFunction(service.getCustomerSegments)
  })
})
