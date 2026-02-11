/**
 * AdonisCommerce Configuration
 *
 * Main configuration file for the e-commerce platform.
 * Override these settings directly or via environment variables.
 */
const commerceConfig = {
  /*
  |--------------------------------------------------------------------------
  | Store Settings
  |--------------------------------------------------------------------------
  */
  store: {
    name: process.env.STORE_NAME || 'AdonisCommerce Store',
    email: process.env.STORE_EMAIL || 'store@example.com',
    phone: process.env.STORE_PHONE || '',
    address: process.env.STORE_ADDRESS || '',
    currency: process.env.STORE_CURRENCY || 'USD',
    timezone: process.env.STORE_TIMEZONE || 'UTC',
    locale: process.env.STORE_LOCALE || 'en',
  },

  /*
  |--------------------------------------------------------------------------
  | Product Settings
  |--------------------------------------------------------------------------
  */
  products: {
    reviewsEnabled: process.env.PRODUCTS_REVIEWS_ENABLED !== 'false',
    reviewsRequirePurchase: process.env.PRODUCTS_REVIEWS_REQUIRE_PURCHASE !== 'false',
    reviewsAutoApprove: process.env.PRODUCTS_REVIEWS_AUTO_APPROVE === 'true',
    wishlistEnabled: process.env.PRODUCTS_WISHLIST_ENABLED !== 'false',
    compareEnabled: process.env.PRODUCTS_COMPARE_ENABLED !== 'false',
    compareMaxItems: Number(process.env.PRODUCTS_COMPARE_MAX_ITEMS) || 4,
    relatedProductsEnabled: process.env.PRODUCTS_RELATED_ENABLED !== 'false',
    relatedProductsCount: Number(process.env.PRODUCTS_RELATED_COUNT) || 8,
  },

  /*
  |--------------------------------------------------------------------------
  | Inventory Settings
  |--------------------------------------------------------------------------
  */
  inventory: {
    trackInventory: process.env.INVENTORY_TRACK !== 'false',
    allowBackorders: process.env.INVENTORY_ALLOW_BACKORDERS === 'true',
    lowStockThreshold: Number(process.env.INVENTORY_LOW_STOCK_THRESHOLD) || 10,
    outOfStockThreshold: Number(process.env.INVENTORY_OUT_OF_STOCK_THRESHOLD) || 0,
    reserveOnCart: process.env.INVENTORY_RESERVE_ON_CART === 'true',
    reservationTimeout: Number(process.env.INVENTORY_RESERVATION_TIMEOUT) || 15,
  },

  /*
  |--------------------------------------------------------------------------
  | Cart Settings
  |--------------------------------------------------------------------------
  */
  cart: {
    sessionTimeout: Number(process.env.CART_SESSION_TIMEOUT) || 7,
    maxQuantityPerItem: Number(process.env.CART_MAX_QUANTITY_PER_ITEM) || 99,
    guestCheckoutEnabled: process.env.CART_GUEST_CHECKOUT !== 'false',
    mergeOnLogin: process.env.CART_MERGE_ON_LOGIN !== 'false',
  },

  /*
  |--------------------------------------------------------------------------
  | Checkout Settings
  |--------------------------------------------------------------------------
  */
  checkout: {
    requireAccount: process.env.CHECKOUT_REQUIRE_ACCOUNT === 'true',
    onePageCheckout: process.env.CHECKOUT_ONE_PAGE === 'true',
    sameAsShippingEnabled: process.env.CHECKOUT_SAME_AS_SHIPPING !== 'false',
    orderPrefix: process.env.CHECKOUT_ORDER_PREFIX || 'ORD-',
    orderNumberLength: Number(process.env.CHECKOUT_ORDER_NUMBER_LENGTH) || 8,
    orderNotesEnabled: process.env.CHECKOUT_ORDER_NOTES !== 'false',
    termsUrl: process.env.CHECKOUT_TERMS_URL || '/terms',
    requireTerms: process.env.CHECKOUT_REQUIRE_TERMS !== 'false',
  },

  /*
  |--------------------------------------------------------------------------
  | Tax Settings
  |--------------------------------------------------------------------------
  */
  tax: {
    enabled: process.env.TAX_ENABLED !== 'false',
    pricesIncludeTax: process.env.TAX_PRICES_INCLUDE === 'true',
    defaultRate: Number(process.env.TAX_DEFAULT_RATE) || 0,
    basedOn: (process.env.TAX_BASED_ON as 'shipping' | 'billing' | 'store') || 'shipping',
    displayWithTax: process.env.TAX_DISPLAY_WITH !== 'false',
    showBreakdown: process.env.TAX_SHOW_BREAKDOWN !== 'false',
  },

  /*
  |--------------------------------------------------------------------------
  | Shipping Settings
  |--------------------------------------------------------------------------
  */
  shipping: {
    enabled: process.env.SHIPPING_ENABLED !== 'false',
    freeShippingThreshold: process.env.SHIPPING_FREE_THRESHOLD
      ? Number(process.env.SHIPPING_FREE_THRESHOLD)
      : null,
    defaultMethod: process.env.SHIPPING_DEFAULT_METHOD || null,
    calculateBasedOn:
      (process.env.SHIPPING_CALCULATE_ON as 'weight' | 'price' | 'quantity' | 'dimensions') ||
      'weight',
    calculatorEnabled: process.env.SHIPPING_CALCULATOR_ENABLED !== 'false',
    allowedCountries: process.env.SHIPPING_ALLOWED_COUNTRIES || '*',
  },

  /*
  |--------------------------------------------------------------------------
  | Payment Settings
  |--------------------------------------------------------------------------
  */
  payment: {
    defaultMethod: process.env.PAYMENT_DEFAULT_METHOD || null,
    savedMethodsEnabled: process.env.PAYMENT_SAVED_METHODS !== 'false',
    autoCaptureEnabled: process.env.PAYMENT_AUTO_CAPTURE !== 'false',
    timeout: Number(process.env.PAYMENT_TIMEOUT) || 30,
  },

  /*
  |--------------------------------------------------------------------------
  | Discount Settings
  |--------------------------------------------------------------------------
  */
  discounts: {
    enabled: process.env.DISCOUNTS_ENABLED !== 'false',
    maxPerOrder: Number(process.env.DISCOUNTS_MAX_PER_ORDER) || 1,
    stackingEnabled: process.env.DISCOUNTS_STACKING === 'true',
    showApplied: process.env.DISCOUNTS_SHOW_APPLIED !== 'false',
  },

  /*
  |--------------------------------------------------------------------------
  | Media Settings
  |--------------------------------------------------------------------------
  */
  media: {
    disk: process.env.MEDIA_DISK || 'local',
    maxFileSize: Number(process.env.MEDIA_MAX_FILE_SIZE) || 10,
    allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    allowedDocumentTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx'],
    productImageSizes: {
      thumbnail: { width: 150, height: 150 },
      small: { width: 300, height: 300 },
      medium: { width: 600, height: 600 },
      large: { width: 1200, height: 1200 },
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Notification Settings
  |--------------------------------------------------------------------------
  */
  notifications: {
    adminEmail: process.env.NOTIFICATION_ADMIN_EMAIL || '',
    email: {
      orderConfirmation: process.env.NOTIFICATION_ORDER_CONFIRMATION !== 'false',
      shippingConfirmation: process.env.NOTIFICATION_SHIPPING_CONFIRMATION !== 'false',
      orderStatusUpdates: process.env.NOTIFICATION_ORDER_STATUS !== 'false',
      lowStockAlert: process.env.NOTIFICATION_LOW_STOCK !== 'false',
      newOrderAlert: process.env.NOTIFICATION_NEW_ORDER !== 'false',
    },
  },

  /*
  |--------------------------------------------------------------------------
  | SEO Settings
  |--------------------------------------------------------------------------
  */
  seo: {
    defaultTitle: process.env.SEO_DEFAULT_TITLE || 'AdonisCommerce Store',
    titleSeparator: process.env.SEO_TITLE_SEPARATOR || ' | ',
    defaultDescription: process.env.SEO_DEFAULT_DESCRIPTION || '',
    sitemapEnabled: process.env.SEO_SITEMAP_ENABLED !== 'false',
    robotsEnabled: process.env.SEO_ROBOTS_ENABLED !== 'false',
    canonicalEnabled: process.env.SEO_CANONICAL_ENABLED !== 'false',
  },

  /*
  |--------------------------------------------------------------------------
  | Analytics Settings
  |--------------------------------------------------------------------------
  */
  analytics: {
    enabled: process.env.ANALYTICS_ENABLED !== 'false',
    googleAnalyticsId: process.env.ANALYTICS_GA_ID || '',
    facebookPixelId: process.env.ANALYTICS_FB_PIXEL_ID || '',
    trackPageViews: process.env.ANALYTICS_TRACK_PAGEVIEWS !== 'false',
    trackAddToCart: process.env.ANALYTICS_TRACK_ADD_TO_CART !== 'false',
    trackPurchases: process.env.ANALYTICS_TRACK_PURCHASES !== 'false',
  },

  /*
  |--------------------------------------------------------------------------
  | Search Settings
  |--------------------------------------------------------------------------
  */
  search: {
    driver: (process.env.SEARCH_PROVIDER as 'database' | 'meilisearch') || 'database',
    meilisearch: {
      host: process.env.MEILISEARCH_HOST || 'http://127.0.0.1:7700',
      apiKey: process.env.MEILISEARCH_API_KEY || '',
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Admin Settings
  |--------------------------------------------------------------------------
  */
  admin: {
    path: process.env.ADMIN_PATH || '/admin',
    itemsPerPage: Number(process.env.ADMIN_ITEMS_PER_PAGE) || 25,
    twoFactorEnabled: process.env.ADMIN_2FA_ENABLED === 'true',
    sessionTimeout: Number(process.env.ADMIN_SESSION_TIMEOUT) || 120,
  },

  /*
  |--------------------------------------------------------------------------
  | Queue Settings
  |--------------------------------------------------------------------------
  */
  queue: {
    driver: (process.env.QUEUE_DRIVER as 'bullmq' | 'memory') || 'memory',
    connection: {
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      db: Number(process.env.REDIS_QUEUE_DB) || 1,
    },
    concurrency: Number(process.env.QUEUE_CONCURRENCY) || 5,
    queues: {
      default: 'default',
      emails: 'emails',
      orders: 'orders',
      inventory: 'inventory',
      webhooks: 'webhooks',
      imports: 'imports',
      analytics: 'analytics',
      scheduled: 'scheduled',
    },
  },

  /*
  |--------------------------------------------------------------------------
  | Plugin Settings
  |--------------------------------------------------------------------------
  | Register plugins by their package name or module path.
  | Example: ['@adoniscommerce-plugin/blog', '@adoniscommerce-plugin/loyalty']
  */
  plugins: [] as string[],

  /*
  |--------------------------------------------------------------------------
  | Model Overrides
  |--------------------------------------------------------------------------
  | Override default model classes with your own implementations.
  | This allows extending core models without modifying the source.
  | Provide the import path to your custom model class.
  |
  | Example:
  |   modelOverrides: {
  |     Product: () => import('#models/custom_product'),
  |     Order: () => import('#models/custom_order'),
  |   }
  */
  modelOverrides: {} as Record<string, () => Promise<{ default: unknown }>>,

  /*
  |--------------------------------------------------------------------------
  | Service Overrides
  |--------------------------------------------------------------------------
  | Override default service classes with your own implementations.
  | Provide the import path to your custom service class.
  |
  | Example:
  |   serviceOverrides: {
  |     PaymentService: () => import('#services/custom_payment_service'),
  |   }
  */
  serviceOverrides: {} as Record<string, () => Promise<{ default: unknown }>>,
}

export default commerceConfig
export type CommerceConfig = typeof commerceConfig
