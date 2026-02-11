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
import { DateTime } from 'luxon'

/**
 * Weight range rule for rate calculation.
 */
interface WeightRule {
  minWeight: number // kg
  maxWeight: number // kg
  price: number
}

/**
 * Service tier configuration.
 */
interface ServiceTier {
  code: string
  name: string
  estimatedDays: number
  priceMultiplier: number // e.g. 1.0 for standard, 1.5 for express
  rules: WeightRule[]
}

/**
 * Weight-Based Shipping Provider
 *
 * Calculates shipping costs based on total package weight.
 * Supports configurable weight ranges and multiple service tiers.
 *
 * Configuration is loaded from store settings (group: 'shipping')
 * or can be passed to the constructor for testing.
 */
export class WeightBasedShippingProvider extends ShippingProvider {
  readonly name = 'weight_based'
  readonly displayName = 'Weight-Based Shipping'
  readonly supportsTracking = false
  readonly supportsLabels = false

  private services: ServiceTier[]
  private baseCurrency: string
  private freeShippingThreshold: number | null

  constructor(config?: {
    services?: ServiceTier[]
    currency?: string
    freeShippingThreshold?: number | null
  }) {
    super()
    this.baseCurrency = config?.currency || 'USD'
    this.freeShippingThreshold = config?.freeShippingThreshold ?? null

    this.services = config?.services || [
      {
        code: 'standard',
        name: 'Standard Shipping',
        estimatedDays: 5,
        priceMultiplier: 1.0,
        rules: [
          { minWeight: 0, maxWeight: 0.5, price: 4.99 },
          { minWeight: 0.5, maxWeight: 1, price: 6.99 },
          { minWeight: 1, maxWeight: 3, price: 9.99 },
          { minWeight: 3, maxWeight: 5, price: 14.99 },
          { minWeight: 5, maxWeight: 10, price: 19.99 },
          { minWeight: 10, maxWeight: 20, price: 29.99 },
          { minWeight: 20, maxWeight: 50, price: 49.99 },
          { minWeight: 50, maxWeight: Infinity, price: 79.99 },
        ],
      },
      {
        code: 'express',
        name: 'Express Shipping',
        estimatedDays: 2,
        priceMultiplier: 1.8,
        rules: [
          { minWeight: 0, maxWeight: 0.5, price: 4.99 },
          { minWeight: 0.5, maxWeight: 1, price: 6.99 },
          { minWeight: 1, maxWeight: 3, price: 9.99 },
          { minWeight: 3, maxWeight: 5, price: 14.99 },
          { minWeight: 5, maxWeight: 10, price: 19.99 },
          { minWeight: 10, maxWeight: 20, price: 29.99 },
          { minWeight: 20, maxWeight: 50, price: 49.99 },
          { minWeight: 50, maxWeight: Infinity, price: 79.99 },
        ],
      },
    ]
  }

  async getRates(params: ShippingRateParams): Promise<ShippingRate[]> {
    const totalWeightKg = this.calculateTotalWeight(params)
    const currency = params.currency || this.baseCurrency

    const rates: ShippingRate[] = []

    for (const service of this.services) {
      const basePrice = this.findPriceForWeight(service.rules, totalWeightKg)
      if (basePrice === null) continue

      let price = Math.round(basePrice * service.priceMultiplier * 100) / 100

      // Apply free shipping threshold (based on declared value)
      if (this.freeShippingThreshold !== null) {
        const totalValue = params.packages.reduce((sum, pkg) => sum + (pkg.declaredValue || 0), 0)
        if (totalValue >= this.freeShippingThreshold) {
          price = 0
        }
      }

      rates.push({
        serviceCode: service.code,
        serviceName: service.name,
        price,
        currency,
        estimatedDays: service.estimatedDays,
        guaranteedDelivery: false,
        metadata: {
          totalWeight: totalWeightKg,
          weightUnit: 'kg',
        },
      })
    }

    return rates
  }

  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    const shipmentId = `WB-${randomUUID().slice(0, 8).toUpperCase()}`
    const trackingNumber = `WB${Date.now()}`
    const service = this.services.find((s) => s.code === params.serviceCode)
    const days = service?.estimatedDays || 5

    return {
      success: true,
      shipmentId,
      trackingNumber,
      trackingUrl: null,
      labelUrl: null,
      estimatedDelivery: DateTime.now().plus({ days }).toJSDate(),
    }
  }

  async getTracking(trackingNumber: string): Promise<TrackingInfo> {
    return {
      trackingNumber,
      status: 'pending',
      estimatedDelivery: null,
      events: [],
    }
  }

  async cancelShipment(_shipmentId: string): Promise<{ success: boolean; message?: string }> {
    return { success: true, message: 'Shipment cancelled' }
  }

  async getLabel(_shipmentId: string): Promise<ShippingLabel> {
    throw new Error('Label generation not supported for weight-based shipping')
  }

  async validateAddress(_address: ShippingAddress): Promise<AddressValidationResult> {
    return { valid: true }
  }

  // ── Helpers ──────────────────────────────────────────────

  private calculateTotalWeight(params: ShippingRateParams): number {
    return params.packages.reduce((total, pkg) => {
      let weightKg = pkg.weight
      switch (pkg.weightUnit) {
        case 'g':
          weightKg = pkg.weight / 1000
          break
        case 'lb':
          weightKg = pkg.weight * 0.453592
          break
        case 'oz':
          weightKg = pkg.weight * 0.0283495
          break
        case 'kg':
        default:
          break
      }
      return total + weightKg
    }, 0)
  }

  private findPriceForWeight(rules: WeightRule[], weightKg: number): number | null {
    for (const rule of rules) {
      if (weightKg >= rule.minWeight && weightKg < rule.maxWeight) {
        return rule.price
      }
    }
    // If weight exceeds all rules, use the last rule
    if (rules.length > 0 && weightKg >= rules[rules.length - 1].maxWeight) {
      return rules[rules.length - 1].price
    }
    return null
  }
}
