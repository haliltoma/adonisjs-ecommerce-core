/**
 * Inventory Repository Interface
 *
 * Defines the contract for inventory data access operations.
 */

import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'
import { DateTime } from 'luxon'
import InventoryMovement from '#models/inventory_movement'
import InventoryLocation from '#models/inventory_location'

export interface CreateMovementData {
  storeId: string
  productId: string
  variantId?: string
  locationId: string
  quantity: number
  type: 'sale' | 'restock' | 'transfer' | 'adjustment' | 'return' | 'fulfillment' | 'manual'
  notes?: string
  userId?: number
}

export interface CreateLocationData {
  storeId: string
  name: string
  address1?: string
  address2?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  isDefault?: boolean
  isActive?: boolean
}

export interface StockLevels {
  productId: string
  variantId?: string
  locationId: string
  quantityOnHand: number
  quantityReserved: number
  quantityAvailable: number
}

export interface InventoryFilters {
  storeId: string
  locationId?: string
  productId?: string
  type?: string
  dateFrom?: DateTime
  dateTo?: DateTime
  page?: number
  limit?: number
}

export type TransactionCallback<T> = (trx: any) => Promise<T>

export default interface IInventoryRepository {
  /**
   * Find movement by ID
   */
  findMovementById(id: string): Promise<InventoryMovement | null>

  /**
   * Find location by ID
   */
  findLocationById(id: string): Promise<InventoryLocation | null>

  /**
   * Get default location for store
   */
  getDefaultLocation(storeId: string): Promise<InventoryLocation | null>

  /**
   * Create inventory movement
   */
  createMovement(data: CreateMovementData, trx?: any): Promise<InventoryMovement>

  /**
   * Create inventory location
   */
  createLocation(data: CreateLocationData): Promise<InventoryLocation>

  /**
   * Get stock levels for product/variant
   */
  getStockLevels(
    productId: string,
    variantId?: string,
    locationId?: string
  ): Promise<StockLevels[]>

  /**
   * List inventory movements
   */
  listMovements(filters: InventoryFilters): Promise<ModelPaginatorContract<InventoryMovement>>

  /**
   * List inventory locations
   */
  listLocations(storeId: string): Promise<InventoryLocation[]>

  /**
   * Execute callback within a transaction
   */
  transaction<T>(callback: TransactionCallback<T>): Promise<T>

  /**
   * Adjust stock quantity
   */
  adjustStock(
    productId: string,
    locationId: string,
    quantity: number,
    type: string,
    notes?: string,
    trx?: any
  ): Promise<InventoryMovement>

  /**
   * Get inventory statistics for store
   */
  getStatistics(storeId: string): Promise<{
    totalLocations: number
    totalMovements: number
    lowStockProducts: number
    outOfStockProducts: number
    totalValue: number
  }>
}
