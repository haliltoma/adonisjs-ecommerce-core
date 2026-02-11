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
 * A shipping zone definition.
 */
interface ShippingZone {
  id: string
  name: string
  /** ISO 3166-1 alpha-2 country codes in this zone */
  countries: string[]
  /** Optional: specific state/province codes (e.g. 'US-CA', 'TR-34') */
  regions?: string[]
  rates: ZoneRate[]
}

/**
 * A rate within a shipping zone.
 */
interface ZoneRate {
  serviceCode: string
  serviceName: string
  price: number
  estimatedDays: number
  /** Optional: weight limit in kg for this rate */
  maxWeight?: number
  /** Optional: order value threshold for free shipping */
  freeAbove?: number
}

/**
 * Zone-Based Shipping Provider
 *
 * Calculates shipping costs based on the destination zone.
 * Zones can be defined by country codes and optionally regions.
 *
 * Flow:
 * 1. Determine which zone the destination belongs to
 * 2. Return all rates available for that zone
 * 3. Apply weight limits and free shipping thresholds
 */
export class ZoneBasedShippingProvider extends ShippingProvider {
  readonly name = 'zone_based'
  readonly displayName = 'Zone-Based Shipping'
  readonly supportsTracking = false
  readonly supportsLabels = false

  private zones: ShippingZone[]
  private baseCurrency: string
  private fallbackZone: ShippingZone | null

  constructor(config?: {
    zones?: ShippingZone[]
    currency?: string
  }) {
    super()
    this.baseCurrency = config?.currency || 'USD'

    this.zones = config?.zones || this.getDefaultZones()
    this.fallbackZone = this.zones.find((z) => z.id === 'rest_of_world') || null
  }

  async getRates(params: ShippingRateParams): Promise<ShippingRate[]> {
    const zone = this.resolveZone(params.destination)
    if (!zone) {
      return [] // No shipping available to this destination
    }

    const totalWeightKg = this.calculateTotalWeight(params)
    const totalValue = params.packages.reduce((sum, pkg) => sum + (pkg.declaredValue || 0), 0)
    const currency = params.currency || this.baseCurrency

    const rates: ShippingRate[] = []

    for (const rate of zone.rates) {
      // Skip if package exceeds weight limit
      if (rate.maxWeight && totalWeightKg > rate.maxWeight) {
        continue
      }

      let price = rate.price

      // Free shipping above threshold
      if (rate.freeAbove && totalValue >= rate.freeAbove) {
        price = 0
      }

      rates.push({
        serviceCode: rate.serviceCode,
        serviceName: rate.serviceName,
        price,
        currency,
        estimatedDays: rate.estimatedDays,
        guaranteedDelivery: false,
        metadata: {
          zoneId: zone.id,
          zoneName: zone.name,
          totalWeight: totalWeightKg,
        },
      })
    }

    return rates
  }

  async createShipment(params: CreateShipmentParams): Promise<ShipmentResult> {
    const shipmentId = `ZB-${randomUUID().slice(0, 8).toUpperCase()}`
    const trackingNumber = `ZB${Date.now()}`
    const zone = this.resolveZone(params.destination)
    const rate = zone?.rates.find((r) => r.serviceCode === params.serviceCode)
    const days = rate?.estimatedDays || 7

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
    throw new Error('Label generation not supported for zone-based shipping')
  }

  async validateAddress(address: ShippingAddress): Promise<AddressValidationResult> {
    const zone = this.resolveZone(address)
    if (!zone) {
      return {
        valid: false,
        errors: [`Shipping is not available to ${address.countryCode}`],
      }
    }
    return { valid: true }
  }

  // ── Zone Resolution ────────────────────────────────────

  private resolveZone(destination: ShippingAddress): ShippingZone | null {
    const country = destination.countryCode?.toUpperCase()
    const regionKey = destination.state ? `${country}-${destination.state}` : null

    // First try to match by region (more specific)
    if (regionKey) {
      const regionMatch = this.zones.find(
        (z) => z.regions?.some((r) => r.toUpperCase() === regionKey.toUpperCase())
      )
      if (regionMatch) return regionMatch
    }

    // Then match by country
    const countryMatch = this.zones.find(
      (z) => z.countries.some((c) => c.toUpperCase() === country)
    )
    if (countryMatch) return countryMatch

    // Fallback zone
    return this.fallbackZone
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

  /**
   * Default zones covering common shipping destinations.
   * These should be overridden via store settings.
   */
  private getDefaultZones(): ShippingZone[] {
    return [
      {
        id: 'domestic_tr',
        name: 'Turkey (Domestic)',
        countries: ['TR'],
        rates: [
          { serviceCode: 'standard', serviceName: 'Standard Kargo', price: 29.99, estimatedDays: 3, freeAbove: 500 },
          { serviceCode: 'express', serviceName: 'Hizli Kargo', price: 49.99, estimatedDays: 1 },
        ],
      },
      {
        id: 'domestic_us',
        name: 'United States (Domestic)',
        countries: ['US'],
        rates: [
          { serviceCode: 'standard', serviceName: 'Standard Shipping', price: 7.99, estimatedDays: 5, freeAbove: 100 },
          { serviceCode: 'express', serviceName: 'Express Shipping', price: 14.99, estimatedDays: 2 },
          { serviceCode: 'overnight', serviceName: 'Overnight', price: 29.99, estimatedDays: 1 },
        ],
      },
      {
        id: 'europe',
        name: 'Europe',
        countries: [
          'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR',
          'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL',
          'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE', 'GB', 'NO', 'CH',
        ],
        rates: [
          { serviceCode: 'standard', serviceName: 'Standard International', price: 14.99, estimatedDays: 7, maxWeight: 30 },
          { serviceCode: 'express', serviceName: 'Express International', price: 29.99, estimatedDays: 3, maxWeight: 30 },
        ],
      },
      {
        id: 'rest_of_world',
        name: 'Rest of World',
        countries: [], // Catch-all (matched via fallback)
        rates: [
          { serviceCode: 'standard', serviceName: 'International Shipping', price: 24.99, estimatedDays: 14, maxWeight: 20 },
          { serviceCode: 'express', serviceName: 'Express International', price: 49.99, estimatedDays: 5, maxWeight: 20 },
        ],
      },
    ]
  }
}
