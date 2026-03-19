/**
 * Inventory Repository Implementation
 *
 * Concrete implementation of inventory data access using Lucid ORM.
 */

import { DateTime } from 'luxon'
import db from '@adonisjs/lucid/services/db'
import InventoryMovement from '#models/inventory_movement'
import InventoryLocation from '#models/inventory_location'
import type IInventoryRepository, {
  CreateMovementData,
  CreateLocationData,
  StockLevels,
  InventoryFilters,
  TransactionCallback,
} from '../interfaces/i_inventory_repository'

export default class InventoryRepository implements IInventoryRepository {
  /**
   * Find movement by ID
   */
  async findMovementById(id: string): Promise<InventoryMovement | null> {
    return await InventoryMovement.query()
      .where('id', id)
      .preload('product')
      .preload('variant')
      .preload('location')
      .first()
  }

  /**
   * Find location by ID
   */
  async findLocationById(id: string): Promise<InventoryLocation | null> {
    return await InventoryLocation.query().where('id', id).first()
  }

  /**
   * Get default location for store
   */
  async getDefaultLocation(storeId: string): Promise<InventoryLocation | null> {
    return await InventoryLocation.query()
      .where('storeId', storeId)
      .where('isDefault', true)
      .where('isActive', true)
      .first()
  }

  /**
   * Create inventory movement
   */
  async createMovement(
    data: CreateMovementData,
    trx?: any
  ): Promise<InventoryMovement> {
    return await InventoryMovement.create(data, trx ? { client: trx } : undefined)
  }

  /**
   * Create inventory location
   */
  async createLocation(data: CreateLocationData): Promise<InventoryLocation> {
    // If this is the first location or marked as default, make it default
    const existingLocations = await this.listLocations(data.storeId)
    const shouldMakeDefault = data.isDefault || existingLocations.length === 0

    const location = await InventoryLocation.create({
      ...data,
      isDefault: shouldMakeDefault,
    })

    // If making this default, remove default from others
    if (shouldMakeDefault && existingLocations.length > 0) {
      await InventoryLocation.query()
        .where('storeId', data.storeId)
        .whereNot('id', location.id)
        .update({ isDefault: false })
    }

    return location
  }

  /**
   * Get stock levels for product/variant
   */
  async getStockLevels(
    productId: string,
    variantId?: string,
    locationId?: string
  ): Promise<StockLevels[]> {
    const query = db
      .from('inventory_movements')
      .select('productId', 'variantId', 'locationId')
      .sum('quantity as quantityOnHand')
      .where('productId', productId)

    if (variantId) {
      query.where('variantId', variantId)
    }

    if (locationId) {
      query.where('locationId', locationId)
    }

    query.groupBy('productId', 'variantId', 'locationId')

    const movements = await query

    return movements.map((m) => ({
      productId: m.productId,
      variantId: m.variantId,
      locationId: m.locationId,
      quantityOnHand: Number(m.quantityOnHand || 0),
      quantityReserved: 0, // TODO: Implement reservations
      quantityAvailable: Number(m.quantityOnHand || 0), // TODO: Subtract reservations
    }))
  }

  /**
   * List inventory movements
   */
  async listMovements(filters: InventoryFilters): Promise<any> {
    const query = InventoryMovement.query()

    // Store filter
    query.where('storeId', filters.storeId)

    // Location filter
    if (filters.locationId) {
      query.where('locationId', filters.locationId)
    }

    // Product filter
    if (filters.productId) {
      query.where('productId', filters.productId)
    }

    // Type filter
    if (filters.type) {
      query.where('type', filters.type)
    }

    // Date range filter
    if (filters.dateFrom) {
      query.where('createdAt', '>=', filters.dateFrom.toSQL())
    }

    if (filters.dateTo) {
      query.where('createdAt', '<=', filters.dateTo.toSQL())
    }

    // Preload relationships
    query.preload('product').preload('variant').preload('location')

    // Sorting
    query.orderBy('createdAt', 'desc')

    // Pagination
    const page = filters.page || 1
    const limit = filters.limit || 20

    return await query.paginate(page, limit)
  }

  /**
   * List inventory locations
   */
  async listLocations(storeId: string): Promise<InventoryLocation[]> {
    return await InventoryLocation.query()
      .where('storeId', storeId)
      .orderBy('isDefault', 'desc')
      .orderBy('name', 'asc')
  }

  /**
   * Execute callback within a transaction
   */
  async transaction<T>(callback: TransactionCallback<T>): Promise<T> {
    return await db.transaction(callback)
  }

  /**
   * Adjust stock quantity
   */
  async adjustStock(
    productId: string,
    locationId: string,
    quantity: number,
    type: string,
    notes?: string,
    trx?: any
  ): Promise<InventoryMovement> {
    // Get product info for storeId
    const product = await db
      .from('products')
      .select('storeId')
      .where('id', productId)
      .first()

    if (!product) {
      throw new Error(`Product not found: ${productId}`)
    }

    return await this.createMovement(
      {
        storeId: product.storeId,
        productId,
        locationId,
        quantity,
        type: type as any,
        notes,
      },
      trx
    )
  }

  /**
   * Get inventory statistics for store
   */
  async getStatistics(storeId: string): Promise<{
    totalLocations: number
    totalMovements: number
    lowStockProducts: number
    outOfStockProducts: number
    totalValue: number
  }> {
    const [
      locationsResult,
      movementsResult,
      lowStockResult,
      outOfStockResult,
      valueResult,
    ] = await Promise.all([
      // Total locations
      db
        .from('inventory_locations')
        .count('* as count')
        .where('storeId', storeId)
        .first(),

      // Total movements
      db
        .from('inventory_movements')
        .count('* as count')
        .where('storeId', storeId)
        .first(),

      // Low stock products (below 10)
      db
        .from('products')
        .countDistinct('id as count')
        .where('storeId', storeId)
        .where('track_inventory', true)
        .where('stock_quantity', '>', 0)
        .where('stock_quantity', '<=', 10)
        .first(),

      // Out of stock products
      db
        .from('products')
        .countDistinct('id as count')
        .where('storeId', storeId)
        .where('track_inventory', true)
        .where('stock_quantity', '<=', 0)
        .first(),

      // Total inventory value
      db
        .from('products')
        .sum('cost_per_item * stock_quantity as total_value')
        .where('storeId', storeId)
        .first(),
    ])

    const totalLocations = Number(locationsResult?.count || 0)
    const totalMovements = Number(movementsResult?.count || 0)
    const lowStockProducts = Number(lowStockResult?.count || 0)
    const outOfStockProducts = Number(outOfStockResult?.count || 0)
    const totalValue = Number(valueResult[0]?.totalValue || 0)

    return {
      totalLocations,
      totalMovements,
      lowStockProducts,
      outOfStockProducts,
      totalValue,
    }
  }
}
