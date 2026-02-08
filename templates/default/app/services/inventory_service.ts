import InventoryLocation from '#models/inventory_location'
import InventoryItem from '#models/inventory_item'
import InventoryMovement from '#models/inventory_movement'
import ProductVariant from '#models/product_variant'
import db from '@adonisjs/lucid/services/db'

interface CreateLocationDTO {
  storeId: string
  name: string
  code: string
  address?: {
    street?: string
    city?: string
    state?: string
    country?: string
    postalCode?: string
  }
  isActive?: boolean
  isFulfillmentCenter?: boolean
  priority?: number
}

interface StockAdjustmentDTO {
  variantId: string
  locationId: string
  quantity: number
  type: 'received' | 'sold' | 'returned' | 'adjusted' | 'transferred' | 'reserved' | 'released'
  reason?: string
  referenceType?: string
  referenceId?: string
}

interface TransferStockDTO {
  variantId: string
  fromLocationId: string
  toLocationId: string
  quantity: number
  reason?: string
}

export default class InventoryService {
  // Location Management
  async createLocation(data: CreateLocationDTO): Promise<InventoryLocation> {
    return await InventoryLocation.create({
      storeId: data.storeId,
      name: data.name,
      code: data.code,
      address: data.address || {},
      isActive: data.isActive ?? true,
      isFulfillmentCenter: data.isFulfillmentCenter ?? false,
      priority: data.priority ?? 0,
    })
  }

  async updateLocation(
    locationId: string,
    data: Partial<CreateLocationDTO>
  ): Promise<InventoryLocation> {
    const location = await InventoryLocation.findOrFail(locationId)

    location.merge({
      name: data.name,
      code: data.code,
      address: data.address,
      isActive: data.isActive,
      isFulfillmentCenter: data.isFulfillmentCenter,
      priority: data.priority,
    })

    await location.save()
    return location
  }

  async getLocations(storeId: string): Promise<InventoryLocation[]> {
    return await InventoryLocation.query()
      .where('storeId', storeId)
      .orderBy('priority', 'desc')
      .orderBy('name', 'asc')
  }

  async getDefaultLocation(storeId: string): Promise<InventoryLocation | null> {
    return await InventoryLocation.query()
      .where('storeId', storeId)
      .where('isFulfillmentCenter', true)
      .orderBy('priority', 'desc')
      .first()
  }

  // Stock Management
  async getStock(variantId: string, locationId?: string): Promise<number> {
    const query = InventoryItem.query().where('variantId', variantId)

    if (locationId) {
      query.where('locationId', locationId)
    }

    const items = await query

    return items.reduce((total, item) => total + item.quantity, 0)
  }

  async getAvailableStock(variantId: string, locationId?: string): Promise<number> {
    const query = InventoryItem.query().where('variantId', variantId)

    if (locationId) {
      query.where('locationId', locationId)
    }

    const items = await query

    return items.reduce((total, item) => total + item.quantity - item.reservedQuantity, 0)
  }

  async getStockByLocation(variantId: string): Promise<{ locationId: string; quantity: number; reserved: number }[]> {
    const items = await InventoryItem.query()
      .where('variantId', variantId)
      .preload('location')

    return items.map((item) => ({
      locationId: item.locationId,
      quantity: item.quantity,
      reserved: item.reservedQuantity,
    }))
  }

  async setStock(variantId: string, locationId: string, quantity: number): Promise<void> {
    await db.transaction(async (trx) => {
      let item = await InventoryItem.query({ client: trx })
        .where('variantId', variantId)
        .where('locationId', locationId)
        .first()

      const previousQuantity = item?.quantity || 0
      const adjustment = quantity - previousQuantity

      if (!item) {
        item = await InventoryItem.create(
          {
            variantId,
            locationId,
            quantity,
            reservedQuantity: 0,
          },
          { client: trx }
        )
      } else {
        item.quantity = quantity
        await item.useTransaction(trx).save()
      }

      // Log movement
      if (adjustment !== 0) {
        await InventoryMovement.create(
          {
            inventoryItemId: item.id,
            type: 'adjusted',
            quantity: adjustment,
            reason: 'Manual stock set',
          },
          { client: trx }
        )
      }

      // Update variant total
      await this.updateVariantTotal(variantId, trx)
    })
  }

  async adjustStock(data: StockAdjustmentDTO): Promise<InventoryMovement> {
    return await db.transaction(async (trx) => {
      let item = await InventoryItem.query({ client: trx })
        .where('variantId', data.variantId)
        .where('locationId', data.locationId)
        .first()

      if (!item) {
        if (data.quantity < 0) {
          throw new Error('Cannot reduce stock below zero')
        }

        item = await InventoryItem.create(
          {
            variantId: data.variantId,
            locationId: data.locationId,
            quantity: data.quantity,
            reservedQuantity: 0,
          },
          { client: trx }
        )
      } else {
        const newQuantity = item.quantity + data.quantity
        if (newQuantity < 0) {
          throw new Error('Cannot reduce stock below zero')
        }
        item.quantity = newQuantity
        await item.useTransaction(trx).save()
      }

      const movement = await InventoryMovement.create(
        {
          inventoryItemId: item.id,
          type: data.type,
          quantity: data.quantity,
          reason: data.reason,
          referenceType: data.referenceType,
          referenceId: data.referenceId,
        },
        { client: trx }
      )

      // Update variant total
      await this.updateVariantTotal(data.variantId, trx)

      return movement
    })
  }

  async reserveStock(variantId: string, locationId: string, quantity: number): Promise<boolean> {
    return await db.transaction(async (trx) => {
      const item = await InventoryItem.query({ client: trx })
        .where('variantId', variantId)
        .where('locationId', locationId)
        .first()

      if (!item) {
        return false
      }

      const available = item.quantity - item.reservedQuantity
      if (available < quantity) {
        return false
      }

      item.reservedQuantity += quantity
      await item.useTransaction(trx).save()

      await InventoryMovement.create(
        {
          inventoryItemId: item.id,
          type: 'reserved',
          quantity: quantity,
          reason: 'Stock reserved for order',
        },
        { client: trx }
      )

      return true
    })
  }

  async releaseReservation(variantId: string, locationId: string, quantity: number): Promise<void> {
    await db.transaction(async (trx) => {
      const item = await InventoryItem.query({ client: trx })
        .where('variantId', variantId)
        .where('locationId', locationId)
        .firstOrFail()

      item.reservedQuantity = Math.max(0, item.reservedQuantity - quantity)
      await item.useTransaction(trx).save()

      await InventoryMovement.create(
        {
          inventoryItemId: item.id,
          type: 'released',
          quantity: quantity,
          reason: 'Reservation released',
        },
        { client: trx }
      )
    })
  }

  async transferStock(data: TransferStockDTO): Promise<void> {
    await db.transaction(async () => {
      // Reduce from source
      await this.adjustStock({
        variantId: data.variantId,
        locationId: data.fromLocationId,
        quantity: -data.quantity,
        type: 'transferred',
        reason: data.reason || `Transfer to ${data.toLocationId}`,
      })

      // Add to destination
      await this.adjustStock({
        variantId: data.variantId,
        locationId: data.toLocationId,
        quantity: data.quantity,
        type: 'transferred',
        reason: data.reason || `Transfer from ${data.fromLocationId}`,
      })
    })
  }

  async getMovementHistory(
    variantId: string,
    options?: { locationId?: string; limit?: number; page?: number }
  ) {
    const items = await InventoryItem.query().where('variantId', variantId)
    const itemIds = items.map((item) => item.id)

    const query = InventoryMovement.query()
      .whereIn('inventoryItemId', itemIds)
      .preload('inventoryItem', (q) => q.preload('location'))
      .orderBy('createdAt', 'desc')

    if (options?.locationId) {
      const item = items.find((i) => i.locationId === options.locationId)
      if (item) {
        query.where('inventoryItemId', item.id)
      }
    }

    return await query.paginate(options?.page || 1, options?.limit || 50)
  }

  async getLowStockVariants(storeId: string, threshold: number = 10) {
    return await ProductVariant.query()
      .whereHas('product', (query) => {
        query.where('storeId', storeId)
      })
      .where('trackInventory', true)
      .where('inventoryQuantity', '<=', threshold)
      .where('inventoryQuantity', '>', 0)
      .preload('product')
      .orderBy('inventoryQuantity', 'asc')
  }

  async getOutOfStockVariants(storeId: string) {
    return await ProductVariant.query()
      .whereHas('product', (query) => {
        query.where('storeId', storeId)
      })
      .where('trackInventory', true)
      .where('inventoryQuantity', '<=', 0)
      .preload('product')
  }

  private async updateVariantTotal(variantId: string, trx: any): Promise<void> {
    const items = await InventoryItem.query({ client: trx }).where('variantId', variantId)

    const total = items.reduce((sum, item) => sum + item.quantity, 0)

    await ProductVariant.query({ client: trx })
      .where('id', variantId)
      .update({ inventoryQuantity: total })
  }
}
