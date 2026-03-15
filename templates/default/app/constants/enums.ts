/**
 * Application Enums
 *
 * Centralized enum definitions to avoid "stringly-typed" code
 */

export enum SegmentType {
  MANUAL = 'manual',
  DYNAMIC = 'dynamic',
  BEHAVIORAL = 'behavioral',
  DEMOGRAPHIC = 'demographic',
}

export enum ReturnStatus {
  REQUESTED = 'requested',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RECEIVED = 'received',
  INSPECTED = 'inspected',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ReturnReason {
  DAMAGED = 'damaged',
  DEFECTIVE = 'defective',
  WRONG_ITEM = 'wrong_item',
  NO_LONGER_NEEDED = 'no_longer_needed',
  BETTER_PRICE_AVAILABLE = 'better_price_available',
  OTHER = 'other',
}

export enum ReturnResolution {
  REFUND = 'refund',
  EXCHANGE = 'exchange',
  STORE_CREDIT = 'store_credit',
}

export enum ReturnItemCondition {
  NEW = 'new',
  OPENED = 'opened',
  USED = 'used',
  DAMAGED = 'damaged',
  DEFECTIVE = 'defective',
}

export enum ReservationType {
  CART = 'cart',
  ORDER = 'order',
  BACKORDER = 'backorder',
  TRANSFER = 'transfer',
}

export enum ReservationStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  CONSUMED = 'consumed',
  RELEASED = 'released',
  CANCELLED = 'cancelled',
}

export enum AlertType {
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  OVERSTOCK = 'overstock',
  BACKORDER_THRESHOLD = 'backorder_threshold',
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  CRITICAL = 'critical',
}

export enum AlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}

export enum SearchEventType {
  SEARCH = 'search',
  FILTER = 'filter',
  SORT = 'sort',
}

export enum CurrencyStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
