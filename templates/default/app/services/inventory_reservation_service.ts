import { DateTime } from 'luxon'
import InventoryReservation from '#models/inventory_reservation'

interface CreateReservationDTO {
  storeId: string
  variantId: string
  locationId?: string
  lineItemId?: string
  type: 'order' | 'cart' | 'transfer'
  quantity: number
  description?: string
  createdBy?: string
  expiresAt?: string
}

export default class InventoryReservationService {
  async create(data: CreateReservationDTO) {
    return InventoryReservation.create({
      storeId: data.storeId,
      variantId: data.variantId,
      locationId: data.locationId || null,
      lineItemId: data.lineItemId || null,
      type: data.type,
      quantity: data.quantity,
      description: data.description || null,
      createdBy: data.createdBy || null,
      expiresAt: data.expiresAt ? DateTime.fromISO(data.expiresAt) : null,
      metadata: {},
    })
  }

  async getByVariant(storeId: string, variantId: string) {
    return InventoryReservation.query()
      .where('storeId', storeId)
      .where('variantId', variantId)
      .preload('location')
      .orderBy('createdAt', 'desc')
  }

  async getByLineItem(lineItemId: string) {
    return InventoryReservation.query()
      .where('lineItemId', lineItemId)
      .preload('variant')
  }

  async getTotalReserved(storeId: string, variantId: string, locationId?: string): Promise<number> {
    const query = InventoryReservation.query()
      .where('storeId', storeId)
      .where('variantId', variantId)

    if (locationId) {
      query.where('locationId', locationId)
    }

    // Exclude expired reservations
    query.where((q) => {
      q.whereNull('expiresAt').orWhere('expiresAt', '>', new Date().toISOString())
    })

    const result = await query.sum('quantity as total')
    return Number((result[0] as InventoryReservation)?.$extras?.total || 0)
  }

  async release(reservationId: string) {
    const reservation = await InventoryReservation.findOrFail(reservationId)
    await reservation.delete()
  }

  async releaseByLineItem(lineItemId: string) {
    await InventoryReservation.query()
      .where('lineItemId', lineItemId)
      .delete()
  }

  async cleanupExpired() {
    await InventoryReservation.query()
      .whereNotNull('expiresAt')
      .where('expiresAt', '<', new Date().toISOString())
      .delete()
  }
}
