import {
  ShippingProvider,
  type ShippingRateParams,
  type ShippingRate,
  type CreateShipmentParams,
  type ShipmentResult,
  type TrackingInfo,
  type ShippingLabel,
  type ShippingAddress,
  type AddressValidationResult,
} from '#contracts/shipping_provider'
import { randomUUID } from 'node:crypto'

/**
 * Flat Rate Shipping Provider
 *
 * Default shipping provider with configurable flat rates.
 * Suitable for simple stores or as a fallback provider.
 */
export class FlatRateShippingProvider extends ShippingProvider {
  readonly name = 'flat_rate'
  readonly displayName = 'Flat Rate Shipping'
  readonly supportsTracking = false
  readonly supportsLabels = false

  private rates: { code: string; name: string; price: number; days: number }[] = [
    { code: 'standard', name: 'Standard Shipping', price: 29.99, days: 5 },
    { code: 'express', name: 'Express Shipping', price: 59.99, days: 2 },
    { code: 'free', name: 'Free Shipping', price: 0, days: 7 },
  ]

  async getRates(params: ShippingRateParams): Promise<ShippingRate[]> {
    const currency = params.currency || 'TRY'

    return this.rates.map((rate) => ({
      serviceCode: rate.code,
      serviceName: rate.name,
      price: rate.price,
      currency,
      estimatedDays: rate.days,
      guaranteedDelivery: false,
    }))
  }

  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    const shipmentId = `ship_${randomUUID()}`
    const estimatedDays = this.rates.find((r) => r.code === params.serviceCode)?.days || 5
    const estimatedDelivery = new Date()
    estimatedDelivery.setDate(estimatedDelivery.getDate() + estimatedDays)

    return {
      success: true,
      shipmentId,
      trackingNumber: null,
      trackingUrl: null,
      labelUrl: null,
      estimatedDelivery,
    }
  }

  async getTracking(_trackingNumber: string): Promise<TrackingInfo> {
    return {
      trackingNumber: _trackingNumber,
      status: 'pending',
      estimatedDelivery: null,
      events: [],
    }
  }

  async cancelShipment(_shipmentId: string): Promise<{ success: boolean; message?: string }> {
    return { success: true, message: 'Shipment cancelled' }
  }

  async getLabel(_shipmentId: string): Promise<ShippingLabel> {
    throw new Error('Flat rate shipping does not support label generation')
  }

  async validateAddress(_address: ShippingAddress): Promise<AddressValidationResult> {
    // Basic validation - flat rate accepts all addresses
    return { valid: true }
  }
}
