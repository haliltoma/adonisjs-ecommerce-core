/**
 * Customer Repository Implementation
 *
 * Concrete implementation of customer data access using Lucid ORM.
 */

import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import Customer from '#models/customer'
import type ICustomerRepository, {
  CreateCustomerData,
  UpdateCustomerData,
  CustomerFilters,
  TransactionCallback,
} from '../interfaces/i_customer_repository'

export default class CustomerRepository implements ICustomerRepository {
  /**
   * Find customer by ID
   */
  async findById(id: string, trx?: any): Promise<Customer | null> {
    const query = Customer.query(trx ? { client: trx } : undefined)

    return await query.where('id', id).first()
  }

  /**
   * Find customer by email
   */
  async findByEmail(email: string, storeId: string, trx?: any): Promise<Customer | null> {
    const query = Customer.query(trx ? { client: trx } : undefined)

    return await query.where('email', email).where('storeId', storeId).first()
  }

  /**
   * Find or create customer by email
   */
  async findOrCreateByEmail(email: string, storeId: string): Promise<Customer> {
    let customer = await this.findByEmail(email, storeId)

    if (!customer) {
      customer = await this.create({
        storeId,
        email,
        acceptsMarketing: false,
      })
    }

    return customer
  }

  /**
   * Create new customer
   */
  async create(data: CreateCustomerData, trx?: any): Promise<Customer> {
    return await Customer.create(data, trx ? { client: trx } : undefined)
  }

  /**
   * Update customer
   */
  async update(id: string, data: UpdateCustomerData, trx?: any): Promise<Customer> {
    const customer = await this.findById(id, trx)

    if (!customer) {
      throw new Error(`Customer not found: ${id}`)
    }

    customer.merge(data)
    await customer.save(trx ? { client: trx } : undefined)

    return customer
  }

  /**
   * Delete customer
   */
  async delete(id: string, trx?: any): Promise<void> {
    const customer = await this.findById(id, trx)

    if (!customer) {
      throw new Error(`Customer not found: ${id}`)
    }

    await customer.delete(trx ? { client: trx } : undefined)
  }

  /**
   * List customers with filters and pagination
   */
  async list(filters: CustomerFilters): Promise<any> {
    const query = Customer.query()

    // Store filter is always required
    query.where('storeId', filters.storeId)

    // Search filter
    if (filters.search) {
      query.where((subQuery) => {
        subQuery
          .where('email', 'LIKE', `%${filters.search}%`)
          .orWhere('firstName', 'LIKE', `%${filters.search}%`)
          .orWhere('lastName', 'LIKE', `%${filters.search}%`)
      })
    }

    // Marketing filter
    if (filters.acceptsMarketing !== undefined) {
      query.where('acceptsMarketing', filters.acceptsMarketing)
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filters.tags.forEach((tag) => {
        query.whereJsonSuperset('metadata', { tags: [tag] })
      })
    }

    // Date range filter
    if (filters.dateFrom) {
      query.where('createdAt', '>=', filters.dateFrom.toSQL())
    }

    if (filters.dateTo) {
      query.where('createdAt', '<=', filters.dateTo.toSQL())
    }

    // Sorting
    const sortBy = filters.sortBy || 'createdAt'
    const sortDir = filters.sortDir || 'desc'
    query.orderBy(sortBy, sortDir)

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 20

    return await query.paginate(page, limit)
  }

  /**
   * Execute callback within a transaction
   */
  async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
    return await db.transaction(callback)
  }

  /**
   * Search customers
   */
  async search(
    storeId: string,
    searchTerm: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    return await Customer.query()
      .where('storeId', storeId)
      .where((subQuery) => {
        subQuery
          .where('email', 'LIKE', `%${searchTerm}%`)
          .orWhere('firstName', 'LIKE', `%${searchTerm}%`)
          .orWhere('lastName', 'LIKE', `%${searchTerm}%`)
      })
      .orderBy('createdAt', 'desc')
      .paginate(page, limit)
  }

  /**
   * Get customers by tags
   */
  async findByTags(
    tags: string[],
    storeId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<any> {
    const query = Customer.query().where('storeId', storeId)

    tags.forEach((tag) => {
      query.whereJsonSuperset('metadata', { tags: [tag] })
    })

    return await query.orderBy('createdAt', 'desc').paginate(page, limit)
  }

  /**
   * Get customer statistics
   */
  async getStatistics(
    storeId: string,
    dateFrom?: DateTime,
    dateTo?: DateTime
  ): Promise<{
    total: number
    newCustomers: number
    returningCustomers: number
    averageOrdersPerCustomer: number
    totalLifetimeValue: number
  }> {
    const baseQuery = db.from('customers').where('storeId', storeId)

    if (dateFrom) {
      baseQuery.where('createdAt', '>=', dateFrom.toSQL())
    }

    if (dateTo) {
      baseQuery.where('createdAt', '<=', dateTo.toSQL())
    }

    const [totalResult, newCustomersResult, lifetimeValueResult] = await Promise.all([
      // Total customers
      baseQuery.count('* as count').first(),

      // New customers (in date range)
      db
        .from('customers')
        .count('* as count')
        .where('storeId', storeId)
        .modify((qb) => {
          if (dateFrom) qb.where('createdAt', '>=', dateFrom.toSQL())
          if (dateTo) qb.where('createdAt', '<=', dateTo.toSQL())
        })
        .first(),

      // Total lifetime value
      db
        .from('orders')
        .sum('grandTotal as total')
        .where('storeId', storeId)
        .whereIn('status', ['confirmed', 'processing', 'shipped', 'delivered'])
        .modify((qb) => {
          if (dateFrom) qb.where('createdAt', '>=', dateFrom.toSQL())
          if (dateTo) qb.where('createdAt', '<=', dateTo.toSQL())
        })
        .first(),
    ])

    const total = Number(totalResult?.count || 0)
    const newCustomers = Number(newCustomersResult?.count || 0)
    const returningCustomers = total - newCustomers
    const totalLifetimeValue = Number(lifetimeValueResult[0]?.total || 0)
    const averageOrdersPerCustomer = total > 0 ? newCustomers / total : 0

    return {
      total,
      newCustomers,
      returningCustomers,
      averageOrdersPerCustomer,
      totalLifetimeValue,
    }
  }
}
