/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| REST API routes for the e-commerce platform.
| All routes are prefixed with /api.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const ProductsController = () => import('#controllers/api/products_controller')
const CartController = () => import('#controllers/api/cart_controller')
const OrdersController = () => import('#controllers/api/orders_controller')
const CategoriesController = () => import('#controllers/api/categories_controller')
const CustomersController = () => import('#controllers/api/customers_controller')
const DigitalProductsController = () => import('#controllers/api/digital_products_controller')
const SubscriptionsController = () => import('#controllers/api/subscriptions_controller')
const BundlesController = () => import('#controllers/api/bundles_controller')
const ImagesController = () => import('#controllers/api/images_controller')
const BackupsController = () => import('#controllers/api/backups_controller')

router
  .group(() => {
    /*
    |--------------------------------------------------------------------------
    | Products API
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/', [ProductsController, 'index'])
        router.get('/search', [ProductsController, 'search'])
        router.get('/featured', [ProductsController, 'featured'])
        router.get('/new', [ProductsController, 'newArrivals'])
        router.get('/:id', [ProductsController, 'show'])
        router.get('/:id/variants', [ProductsController, 'variants'])
        router.get('/:id/related', [ProductsController, 'related'])
      })
      .prefix('/products')

    /*
    |--------------------------------------------------------------------------
    | Categories API
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/', [CategoriesController, 'index'])
        router.get('/tree', [CategoriesController, 'tree'])
        router.get('/:id', [CategoriesController, 'show'])
        router.get('/:id/breadcrumb', [CategoriesController, 'breadcrumb'])
      })
      .prefix('/categories')

    /*
    |--------------------------------------------------------------------------
    | Cart API
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/', [CartController, 'show'])
        router.delete('/', [CartController, 'clear'])
        router.post('/items', [CartController, 'addItem'])
        router.patch('/items/:id', [CartController, 'updateItem'])
        router.delete('/items/:id', [CartController, 'removeItem'])
        router.post('/discount', [CartController, 'applyDiscount'])
        router.delete('/discount', [CartController, 'removeDiscount'])
      })
      .prefix('/cart')

    /*
    |--------------------------------------------------------------------------
    | Customer Authentication API
    |--------------------------------------------------------------------------
    */
    router.post('/customers/register', [CustomersController, 'register'])
    router.post('/customers/login', [CustomersController, 'login'])

    /*
    |--------------------------------------------------------------------------
    | Customer Account API (Authenticated)
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.post('/logout', [CustomersController, 'logout'])
        router.get('/me', [CustomersController, 'me'])
        router.patch('/me', [CustomersController, 'update'])

        // Addresses
        router.get('/me/addresses', [CustomersController, 'addresses'])
        router.post('/me/addresses', [CustomersController, 'addAddress'])
        router.patch('/me/addresses/:id', [CustomersController, 'updateAddress'])
        router.delete('/me/addresses/:id', [CustomersController, 'deleteAddress'])

        // Wishlist
        router.get('/me/wishlist', [CustomersController, 'wishlist'])
        router.post('/me/wishlist', [CustomersController, 'addToWishlist'])
        router.delete('/me/wishlist/:productId', [CustomersController, 'removeFromWishlist'])
      })
      .prefix('/customers')
      .use(middleware.customerAuth())

    /*
    |--------------------------------------------------------------------------
    | Orders API
    |--------------------------------------------------------------------------
    */
    router.post('/orders', [OrdersController, 'store'])
    router.get('/orders/:id/track', [OrdersController, 'track'])

    router
      .group(() => {
        router.get('/', [OrdersController, 'index'])
        router.get('/:id', [OrdersController, 'show'])
        router.post('/:id/cancel', [OrdersController, 'cancel'])
      })
      .prefix('/orders')
      .use(middleware.customerAuth())

    /*
    |--------------------------------------------------------------------------
    | Store Info API
    |--------------------------------------------------------------------------
    */
    router.get('/store', async ({ response, store: currentStore }) => {
      if (!currentStore) {
        return response.notFound({ error: 'Store not found' })
      }

      const meta = (currentStore as any).meta || {}
      return response.json({
        data: {
          id: currentStore.id,
          name: currentStore.name,
          description: meta.description || null,
          currency: currentStore.defaultCurrency,
          locale: currentStore.defaultLocale,
          timezone: currentStore.timezone,
          logo: currentStore.logoUrl,
          contact: {
            email: meta.contactEmail || null,
            phone: meta.contactPhone || null,
            address: meta.address || null,
          },
          social: meta.socialLinks || null,
        },
      })
    })

    /*
    |--------------------------------------------------------------------------
    | Health Checks & Diagnostics API
    |--------------------------------------------------------------------------
    */
    const HealthChecksController = () => import('#controllers/api/health_checks_controller')

    router
      .group(() => {
        router.get('/live', [HealthChecksController, 'live'])
        router.get('/ready', [HealthChecksController, 'ready'])
        router.get('/detailed', [HealthChecksController, 'detailed'])
      })
      .prefix('/health')

    // Diagnostics endpoints
    router
      .group(() => {
        router.get('/version', [HealthChecksController, 'version'])
        router.get('/config', [HealthChecksController, 'config'])
        router.get('/metrics', [HealthChecksController, 'metrics'])
        router.get('/routes', [HealthChecksController, 'routes'])
        router.get('/cache', [HealthChecksController, 'cache'])
      })
      .prefix('/diagnostics')

    /*
    |--------------------------------------------------------------------------
    | Digital Products API
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.post('/upload', [DigitalProductsController, 'upload'])
        router.get('/downloads/:id', [DigitalProductsController, 'getDownloadLink'])
        router.post('/downloads/:id/record', [DigitalProductsController, 'recordDownload'])
        router.delete('/downloads/:id', [DigitalProductsController, 'revokeDownload'])
        router.get('/customer/:customerId/downloads', [DigitalProductsController, 'getCustomerDownloads'])

        // Licenses
        router.post('/licenses/validate', [DigitalProductsController, 'validateLicense'])
        router.post('/licenses/activate', [DigitalProductsController, 'activateLicense'])
        router.post('/licenses/deactivate', [DigitalProductsController, 'deactivateLicense'])
        router.get('/licenses/:id/suspend', [DigitalProductsController, 'suspendLicense'])
        router.get('/customer/:customerId/licenses', [DigitalProductsController, 'getCustomerLicenses'])
      })
      .prefix('/digital-products')

    /*
    |--------------------------------------------------------------------------
    | Subscriptions API
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.post('/', [SubscriptionsController, 'create'])
        router.get('/:id', [SubscriptionsController, 'show'])
        router.patch('/:id', [SubscriptionsController, 'update'])
        router.post('/:id/pause', [SubscriptionsController, 'pause'])
        router.post('/:id/resume', [SubscriptionsController, 'resume'])
        router.post('/:id/cancel', [SubscriptionsController, 'cancel'])
        router.post('/:id/renew', [SubscriptionsController, 'renew'])
        router.get('/customer/:customerId', [SubscriptionsController, 'getCustomerSubscriptions'])

        // Subscription items
        router.post('/:id/items', [SubscriptionsController, 'addItem'])
        router.patch('/items/:itemId', [SubscriptionsController, 'updateItem'])
        router.delete('/items/:itemId', [SubscriptionsController, 'removeItem'])

        // Webhooks
        router.post('/webhook/stripe', [SubscriptionsController, 'stripeWebhook'])
      })
      .prefix('/subscriptions')

    /*
    |--------------------------------------------------------------------------
    | Bundles API
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.post('/', [BundlesController, 'create'])
        router.get('/', [BundlesController, 'index'])
        router.get('/available', [BundlesController, 'available'])
        router.get('/:id', [BundlesController, 'show'])
        router.patch('/:id', [BundlesController, 'update'])
        router.delete('/:id', [BundlesController, 'destroy'])
        router.get('/:id/pricing', [BundlesController, 'pricing'])
        router.post('/:id/duplicate', [BundlesController, 'duplicate'])
        router.get('/:id/stock/:quantity', [BundlesController, 'validateStock'])
        router.get('/product/:productId', [BundlesController, 'getByProduct'])

        // Bundle items
        router.post('/:id/items', [BundlesController, 'addItem'])
        router.patch('/items/:itemId', [BundlesController, 'updateItem'])
        router.delete('/items/:itemId', [BundlesController, 'removeItem'])
        router.post('/:id/reorder', [BundlesController, 'reorderItems'])
      })
      .prefix('/bundles')

    /*
    |--------------------------------------------------------------------------
    | Images API
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.post('/upload', [ImagesController, 'upload'])
        router.post('/batch-upload', [ImagesController, 'batchUpload'])
        router.post('/optimize', [ImagesController, 'optimize'])
        router.post('/convert-webp', [ImagesController, 'convertToWebP'])
        router.get('/urls', [ImagesController, 'getImageUrls'])
        router.get('/dimensions', [ImagesController, 'getDimensions'])
        router.get('/metadata', [ImagesController, 'getMetadata'])
      })
      .prefix('/images')

    /*
    |--------------------------------------------------------------------------
    | Backups API (Admin Only)
    |--------------------------------------------------------------------------
    */
    router
      .group(() => {
        router.get('/', [BackupsController, 'index'])
        router.get('/:id', [BackupsController, 'show'])

        // Create backups
        router.post('/database', [BackupsController, 'createDatabaseBackup'])
        router.post('/media', [BackupsController, 'createMediaBackup'])
        router.post('/full', [BackupsController, 'createFullBackup'])

        // Backup actions
        router.post('/:id/restore', [BackupsController, 'restore'])
        router.delete('/:id', [BackupsController, 'destroy'])
        router.post('/:id/retain', [BackupsController, 'retain'])
        router.post('/:id/release', [BackupsController, 'release'])
        router.get('/:id/download', [BackupsController, 'download'])

        // Statistics and cleanup
        router.get('/stats', [BackupsController, 'stats'])
        router.post('/cleanup', [BackupsController, 'cleanup'])

        // Recovery
        router.post('/recovery/plan', [BackupsController, 'createRecoveryPlan'])
        router.post('/recovery/execute', [BackupsController, 'executeRecovery'])
        router.get('/recovery/status', [BackupsController, 'recoveryStatus'])
        router.post('/recovery/cancel', [BackupsController, 'cancelRecovery'])
      })
      .prefix('/backups')
      .use(middleware.adminAuth())
  })
  .prefix('/api')
