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
      .use(middleware.auth({ guards: ['web'] }))

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
      .use(middleware.auth({ guards: ['web'] }))

    /*
    |--------------------------------------------------------------------------
    | Store Info API
    |--------------------------------------------------------------------------
    */
    router.get('/store', async ({ request, response }) => {
      const storeId = request.header('X-Store-ID') || 'default'
      const Store = (await import('#models/store')).default
      const store = await Store.find(storeId)

      if (!store) {
        return response.notFound({ error: 'Store not found' })
      }

      const meta = store.meta || {}
      return response.json({
        data: {
          id: store.id,
          name: store.name,
          description: meta.description || null,
          currency: store.defaultCurrency,
          locale: store.defaultLocale,
          timezone: store.timezone,
          logo: store.logoUrl,
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
    | Health Check
    |--------------------------------------------------------------------------
    */
    router.get('/health', async ({ response }) => {
      return response.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
      })
    })
  })
  .prefix('/api')
