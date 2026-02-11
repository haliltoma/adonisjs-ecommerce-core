/**
 * Shipping Provider Contract
 *
 * Abstract class that all shipping/cargo providers must implement.
 * Providers: Yurtici, Aras, MNG, UPS, DHL, FedEx, etc.
 */
export abstract class ShippingProvider {
  /**
   * Unique identifier for the shipping provider
   */
  abstract readonly name: string

  /**
   * Human-readable display name
   */
  abstract readonly displayName: string

  /**
   * Whether the provider supports tracking
   */
  abstract readonly supportsTracking: boolean

  /**
   * Whether the provider supports label generation
   */
  abstract readonly supportsLabels: boolean

  /**
   * Calculate shipping rates for given parameters
   */
  abstract getRates(params: ShippingRateParams): Promise<ShippingRate[]>

  /**
   * Create a shipment and get tracking number
   */
  abstract createShipment(params: CreateShipmentParams): Promise<ShipmentResult>

  /**
   * Get tracking info for a shipment
   */
  abstract getTracking(trackingNumber: string): Promise<TrackingInfo>

  /**
   * Cancel a shipment
   */
  abstract cancelShipment(shipmentId: string): Promise<{ success: boolean; message?: string }>

  /**
   * Generate shipping label (PDF URL or base64)
   */
  abstract getLabel(shipmentId: string): Promise<ShippingLabel>

  /**
   * Validate a delivery address
   */
  abstract validateAddress(address: ShippingAddress): Promise<AddressValidationResult>
}

export interface ShippingAddress {
  firstName: string
  lastName: string
  company?: string
  addressLine1: string
  addressLine2?: string
  city: string
  state?: string
  postalCode: string
  countryCode: string
  phone?: string
}

export interface ShippingRateParams {
  origin: ShippingAddress
  destination: ShippingAddress
  packages: ShippingPackage[]
  currency?: string
}

export interface ShippingPackage {
  weight: number
  weightUnit: 'g' | 'kg' | 'lb' | 'oz'
  length?: number
  width?: number
  height?: number
  dimensionUnit?: 'cm' | 'in'
  declaredValue?: number
}

export interface ShippingRate {
  serviceCode: string
  serviceName: string
  price: number
  currency: string
  estimatedDays: number | null
  guaranteedDelivery: boolean
  metadata?: Record<string, unknown>
}

export interface CreateShipmentParams {
  orderId: string
  origin: ShippingAddress
  destination: ShippingAddress
  packages: ShippingPackage[]
  serviceCode: string
  labelFormat?: 'pdf' | 'png' | 'zpl'
  metadata?: Record<string, unknown>
}

export interface ShipmentResult {
  success: boolean
  shipmentId: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  labelUrl: string | null
  estimatedDelivery: Date | null
  errorMessage?: string
}

export interface TrackingInfo {
  trackingNumber: string
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'failed' | 'returned'
  estimatedDelivery: Date | null
  events: TrackingEvent[]
}

export interface TrackingEvent {
  status: string
  description: string
  location?: string
  timestamp: Date
}

export interface ShippingLabel {
  format: 'pdf' | 'png' | 'zpl'
  url?: string
  data?: string
}

export interface AddressValidationResult {
  valid: boolean
  suggestions?: ShippingAddress[]
  errors?: string[]
}
