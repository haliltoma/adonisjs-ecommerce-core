/**
 * AdonisCommerce Contracts
 *
 * Central export of all provider contracts (abstract classes).
 * These are used for IoC container bindings and dependency injection.
 */

export { PaymentProvider } from './payment_provider.js'
export type {
  CreatePaymentParams,
  PaymentResult,
  RefundResult,
  PaymentDetails,
  WebhookEvent,
} from './payment_provider.js'

export { ShippingProvider } from './shipping_provider.js'
export type {
  ShippingAddress,
  ShippingRateParams,
  ShippingPackage,
  ShippingRate,
  CreateShipmentParams,
  ShipmentResult,
  TrackingInfo,
  TrackingEvent,
  ShippingLabel,
  AddressValidationResult,
} from './shipping_provider.js'

export { NotificationProvider, NotificationManager } from './notification_provider.js'
export type {
  NotificationChannel,
  SendNotificationParams,
  NotificationAttachment,
  NotificationResult,
} from './notification_provider.js'

export { SearchProvider } from './search_provider.js'
export type {
  SearchParams,
  SearchFilters,
  SearchSort,
  SearchResult,
  SearchFacet,
  ProductSearchHit,
  IndexableProduct,
} from './search_provider.js'

export { MediaProvider } from './media_provider.js'
export type {
  UploadParams,
  UploadResult,
  FileMetadata,
  ImageResizeOptions,
  ThumbnailSize,
} from './media_provider.js'

export { CacheProvider, TaggedCache } from './cache_provider.js'

export { QueueProvider } from './queue_provider.js'
export type {
  DispatchJobParams,
  JobStatus,
  JobHandler,
  JobContext,
  QueueMetrics,
} from './queue_provider.js'

export { WebhookDispatcher } from './webhook_provider.js'
export type {
  DispatchWebhookParams,
  WebhookDispatchResult,
} from './webhook_provider.js'

export { CommercePlugin } from './plugin.js'
export type {
  PluginMeta,
  PluginAdminMenuItem,
  CommerceHookName,
  CommerceHookHandler,
} from './plugin.js'

export { IntegrationProvider } from './integration_provider.js'
export type {
  IntegrationCategory,
  ConfigField,
  SyncResult,
  IntegrationStatus,
} from './integration_provider.js'
