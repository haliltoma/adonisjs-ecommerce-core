/**
 * Customer Repository Interface
 *
 * Defines the contract for customer data access operations.
 */

import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import Customer from '#models/customer'

export interface CreateCustomerData {
  storeId: string
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  acceptsMarketing?: boolean
  metadata?: Record<string, any>
}

export interface UpdateCustomerData {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  acceptsMarketing?: boolean
  metadata?: Record<string, any>
  preferredCurrency?: string
}

export interface CustomerFilters {
  storeId: string
  search?: string
  acceptsMarketing?: boolean
  tags?: string[]
  dateFrom?: DateTime
  dateTo?: DateTime
  sortBy?: 'createdAt' | 'email' | 'lastName'
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export type TransactionCallback<T> = (trx: any) => Promise<T>

export default interface ICustomerRepository {
  /**
   * Find customer by ID
   */
  findById(id: string, trx?: any): Promise<Customer | null>

  /**
   * Find customer by email
   */
  findByEmail(email: string, storeId: string, trx?: any): Promise<Customer | null>

  /**
   * Find or create customer by email
   */
  findOrCreateByEmail(email: string, storeId: string): Promise<Customer>

  /**
   * Create new customer
   */
  create(data: CreateCustomerData, trx?: any): Promise<Customer>

  /**
   * Update customer
   */
  update(id: string, data: UpdateCustomerData, trx?: any): Promise<Customer>

  /**
   * Delete customer
   */
  delete(id: string, trx?: any): Promise<void>

  /**
   * List customers with filters and pagination
   */
  list(filters: CustomerFilters): Promise<ModelPaginatorContract<Customer>>

  /**
   * Execute callback within a transaction
   */
  transaction<T>(callback: TransactionCallback<T>): Promise<T>

  /**
   * Search customers
   */
  search(
    storeId: string,
    searchTerm: string,
    page?: number,
    limit?: number
  ): Promise<ModelPaginatorContract<Customer>>

  /**
   * Get customers by tags
   */
  findByTags(
    tags: string[],
    storeId: string,
    page?: number,
    limit?: number
  ): Promise<ModelPaginatorContract<Customer>>

  /**
   * Get customer statistics
   */
  getStatistics(storeId: string, dateFrom?: DateTime, dateTo?: DateTime): Promise<{
    total: number
    newCustomers: number
    returningCustomers: number
    averageOrdersPerCustomer: number
    totalLifetimeValue: number
  }>
}
