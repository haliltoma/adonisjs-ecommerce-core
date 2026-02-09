/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| AdonisCommerce Routes
| - Storefront routes (public)
| - Admin routes (protected)
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'

// Import API routes
import './routes/api.js'

// Health check
const HealthController = () => import('#controllers/health_controller')
router.get('/health', [HealthController, 'check']).as('health')

// SEO Routes (robots.txt, sitemap.xml, web manifest)
const SeoController = () => import('#controllers/seo_controller')
router.get('/robots.txt', [SeoController, 'robots']).as('seo.robots')
router.get('/sitemap.xml', [SeoController, 'sitemap']).as('seo.sitemap')
router.get('/sitemap-index.xml', [SeoController, 'sitemapIndex']).as('seo.sitemapIndex')
router.get('/site.webmanifest', [SeoController, 'webManifest']).as('seo.webManifest')
router.get('/organization.json', [SeoController, 'organizationSchema']).as('seo.organization')

// Lazy load controllers
const HomeController = () => import('#controllers/storefront/home_controller')
const ProductsController = () => import('#controllers/storefront/products_controller')
const CartController = () => import('#controllers/storefront/cart_controller')
const CheckoutController = () => import('#controllers/storefront/checkout_controller')
const AccountController = () => import('#controllers/storefront/account_controller')
const PagesController = () => import('#controllers/storefront/pages_controller')

const AdminAuthController = () => import('#controllers/admin/auth_controller')
const AdminDashboardController = () => import('#controllers/admin/dashboard_controller')
const AdminProductsController = () => import('#controllers/admin/products_controller')
const AdminOrdersController = () => import('#controllers/admin/orders_controller')
const AdminCustomersController = () => import('#controllers/admin/customers_controller')
const AdminCategoriesController = () => import('#controllers/admin/categories_controller')
const AdminDiscountsController = () => import('#controllers/admin/discounts_controller')
const AdminInventoryController = () => import('#controllers/admin/inventory_controller')
const AdminSettingsController = () => import('#controllers/admin/settings_controller')
const AdminContentController = () => import('#controllers/admin/content_controller')

/*
|--------------------------------------------------------------------------
| Storefront Routes
|--------------------------------------------------------------------------
*/

// Home
router.get('/', [HomeController, 'index']).as('storefront.home')
router.get('/search', [HomeController, 'search']).as('storefront.search')

// Static Pages
router.get('/about', [PagesController, 'about']).as('storefront.about')
router.get('/contact', [PagesController, 'contact']).as('storefront.contact')
router.get('/pages/:slug', [PagesController, 'show']).as('storefront.pages.show')
router.get('/shipping', [PagesController, 'shipping']).as('storefront.shipping')
router.get('/returns', [PagesController, 'returns']).as('storefront.returns')
router.get('/faq', [PagesController, 'faq']).as('storefront.faq')
router.get('/privacy', [PagesController, 'privacy']).as('storefront.privacy')
router.get('/terms', [PagesController, 'terms']).as('storefront.terms')

// Products
router.get('/products', [ProductsController, 'index']).as('storefront.products.index')
router.get('/products/:slug', [ProductsController, 'show']).as('storefront.products.show')
router.get('/category/:slug', [ProductsController, 'byCategory']).as('storefront.category')
router.get('/collections', [ProductsController, 'collections']).as('storefront.collections')
router.get('/categories', [ProductsController, 'allCategories']).as('storefront.categories')

// Wishlist
router.get('/wishlist', [AccountController, 'wishlist']).as('storefront.wishlist')

// Cart
router.get('/cart', [CartController, 'index']).as('storefront.cart')
router.post('/cart/add', [CartController, 'add']).as('storefront.cart.add')
router.patch('/cart/item/:itemId', [CartController, 'update']).as('storefront.cart.update')
router.delete('/cart/item/:itemId', [CartController, 'remove']).as('storefront.cart.remove')
router.delete('/cart/clear', [CartController, 'clear']).as('storefront.cart.clear')
router.post('/cart/discount', [CartController, 'applyDiscount']).as('storefront.cart.applyDiscount')
router.delete('/cart/discount', [CartController, 'removeDiscount']).as('storefront.cart.removeDiscount')

// Checkout
router.get('/checkout', [CheckoutController, 'index']).as('storefront.checkout')
router.post('/checkout', [CheckoutController, 'processCheckout']).as('storefront.checkout.process')
router.get('/checkout/payment/:orderId', [CheckoutController, 'payment']).as('storefront.checkout.payment')
router.post('/checkout/payment/:orderId', [CheckoutController, 'processPayment']).as('storefront.checkout.processPayment')
router.get('/checkout/confirmation/:orderId', [CheckoutController, 'confirmation']).as('storefront.checkout.confirmation')

// Account - Guest routes
router.get('/account/login', [AccountController, 'showLogin']).as('storefront.account.login')
router.post('/account/login', [AccountController, 'login']).as('storefront.account.login.post')
router.get('/account/register', [AccountController, 'showRegister']).as('storefront.account.register')
router.post('/account/register', [AccountController, 'register']).as('storefront.account.register.post')
router.post('/account/logout', [AccountController, 'logout']).as('storefront.account.logout')
router.get('/account/forgot-password', [AccountController, 'showForgotPassword']).as('storefront.account.forgotPassword')
router.post('/account/forgot-password', [AccountController, 'forgotPassword']).as('storefront.account.forgotPassword.post')
router.get('/account/reset-password/:token', [AccountController, 'showResetPassword']).as('storefront.account.resetPassword')
router.post('/account/reset-password', [AccountController, 'resetPassword']).as('storefront.account.resetPassword.post')

// Account - Protected routes
router.get('/account', [AccountController, 'dashboard']).as('storefront.account.dashboard')
router.get('/account/orders', [AccountController, 'orders']).as('storefront.account.orders')
router.get('/account/orders/:id', [AccountController, 'orderDetail']).as('storefront.account.orders.show')
router.get('/account/profile', [AccountController, 'profile']).as('storefront.account.profile')
router.patch('/account/profile', [AccountController, 'updateProfile']).as('storefront.account.profile.update')
router.patch('/account/password', [AccountController, 'updatePassword']).as('storefront.account.password.update')
router.get('/account/addresses', [AccountController, 'addresses']).as('storefront.account.addresses')
router.post('/account/addresses', [AccountController, 'addAddress']).as('storefront.account.addresses.add')
router.patch('/account/addresses/:id', [AccountController, 'updateAddress']).as('storefront.account.addresses.update')
router.delete('/account/addresses/:id', [AccountController, 'deleteAddress']).as('storefront.account.addresses.delete')

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
*/

router.group(() => {
  // Auth - Guest routes
  router.get('/login', [AdminAuthController, 'showLogin']).as('admin.auth.login')
  router.post('/login', [AdminAuthController, 'login']).as('admin.auth.login.post')
  router.get('/2fa', [AdminAuthController, 'show2FA']).as('admin.auth.2fa')
  router.post('/2fa', [AdminAuthController, 'verify2FA']).as('admin.auth.2fa.verify')
  router.get('/forgot-password', [AdminAuthController, 'showForgotPassword']).as('admin.auth.forgotPassword')
  router.post('/forgot-password', [AdminAuthController, 'forgotPassword']).as('admin.auth.forgotPassword.post')
  router.get('/reset-password/:token', [AdminAuthController, 'showResetPassword']).as('admin.auth.resetPassword')
  router.post('/reset-password', [AdminAuthController, 'resetPassword']).as('admin.auth.resetPassword.post')

  // Protected routes
  router.group(() => {
    router.post('/logout', [AdminAuthController, 'logout']).as('admin.auth.logout')

    // Dashboard
    router.get('/', [AdminDashboardController, 'index']).as('admin.dashboard')
    router.get('/dashboard', [AdminDashboardController, 'index']).as('admin.dashboard.alias')
    router.get('/analytics', [AdminDashboardController, 'analytics']).as('admin.analytics')

    // Profile
    router.get('/profile', [AdminAuthController, 'showProfile']).as('admin.profile')
    router.patch('/profile', [AdminAuthController, 'updateProfile']).as('admin.profile.update')
    router.patch('/profile/password', [AdminAuthController, 'updatePassword']).as('admin.profile.password')
    router.post('/profile/2fa/enable', [AdminAuthController, 'enable2FA']).as('admin.profile.2fa.enable')
    router.post('/profile/2fa/confirm', [AdminAuthController, 'confirm2FA']).as('admin.profile.2fa.confirm')
    router.post('/profile/2fa/disable', [AdminAuthController, 'disable2FA']).as('admin.profile.2fa.disable')

    // Products
    router.get('/products', [AdminProductsController, 'index']).as('admin.products.index')
    router.get('/products/create', [AdminProductsController, 'create']).as('admin.products.create')
    router.post('/products', [AdminProductsController, 'store']).as('admin.products.store')
    router.get('/products/:id', [AdminProductsController, 'show']).as('admin.products.show')
    router.get('/products/:id/edit', [AdminProductsController, 'edit']).as('admin.products.edit')
    router.patch('/products/:id', [AdminProductsController, 'update']).as('admin.products.update')
    router.delete('/products/:id', [AdminProductsController, 'destroy']).as('admin.products.destroy')
    router.post('/products/:id/duplicate', [AdminProductsController, 'duplicate']).as('admin.products.duplicate')
    router.post('/products/bulk', [AdminProductsController, 'bulkAction']).as('admin.products.bulk')

    // Categories
    router.get('/categories', [AdminCategoriesController, 'index']).as('admin.categories.index')
    router.get('/categories/create', [AdminCategoriesController, 'create']).as('admin.categories.create')
    router.post('/categories', [AdminCategoriesController, 'store']).as('admin.categories.store')
    router.get('/categories/:id/edit', [AdminCategoriesController, 'edit']).as('admin.categories.edit')
    router.patch('/categories/:id', [AdminCategoriesController, 'update']).as('admin.categories.update')
    router.delete('/categories/:id', [AdminCategoriesController, 'destroy']).as('admin.categories.destroy')
    router.post('/categories/reorder', [AdminCategoriesController, 'reorder']).as('admin.categories.reorder')

    // Orders
    router.get('/orders', [AdminOrdersController, 'index']).as('admin.orders.index')
    router.get('/orders/export', [AdminOrdersController, 'export']).as('admin.orders.export')
    router.get('/orders/:id', [AdminOrdersController, 'show']).as('admin.orders.show')
    router.patch('/orders/:id/status', [AdminOrdersController, 'updateStatus']).as('admin.orders.updateStatus')
    router.post('/orders/:id/cancel', [AdminOrdersController, 'cancel']).as('admin.orders.cancel')
    router.post('/orders/:id/note', [AdminOrdersController, 'addNote']).as('admin.orders.addNote')
    router.post('/orders/:id/fulfillments', [AdminOrdersController, 'createFulfillment']).as('admin.orders.fulfillments.create')
    router.post('/orders/:id/fulfillments/:fulfillmentId/ship', [AdminOrdersController, 'shipFulfillment']).as('admin.orders.fulfillments.ship')
    router.post('/orders/:id/fulfillments/:fulfillmentId/deliver', [AdminOrdersController, 'deliverFulfillment']).as('admin.orders.fulfillments.deliver')
    router.delete('/orders/:id/fulfillments/:fulfillmentId', [AdminOrdersController, 'cancelFulfillment']).as('admin.orders.fulfillments.cancel')
    router.post('/orders/:id/refunds', [AdminOrdersController, 'createRefund']).as('admin.orders.refunds.create')

    // Customers
    router.get('/customers', [AdminCustomersController, 'index']).as('admin.customers.index')
    router.get('/customers/create', [AdminCustomersController, 'create']).as('admin.customers.create')
    router.post('/customers', [AdminCustomersController, 'store']).as('admin.customers.store')
    router.get('/customers/:id', [AdminCustomersController, 'show']).as('admin.customers.show')
    router.get('/customers/:id/edit', [AdminCustomersController, 'edit']).as('admin.customers.edit')
    router.patch('/customers/:id', [AdminCustomersController, 'update']).as('admin.customers.update')
    router.delete('/customers/:id', [AdminCustomersController, 'destroy']).as('admin.customers.destroy')
    router.patch('/customers/:id/status', [AdminCustomersController, 'updateStatus']).as('admin.customers.updateStatus')
    router.patch('/customers/:id/password', [AdminCustomersController, 'updatePassword']).as('admin.customers.updatePassword')
    router.post('/customers/:id/addresses', [AdminCustomersController, 'addAddress']).as('admin.customers.addresses.add')
    router.patch('/customers/:id/addresses/:addressId', [AdminCustomersController, 'updateAddress']).as('admin.customers.addresses.update')
    router.delete('/customers/:id/addresses/:addressId', [AdminCustomersController, 'deleteAddress']).as('admin.customers.addresses.delete')

    // Discounts
    router.get('/discounts', [AdminDiscountsController, 'index']).as('admin.discounts.index')
    router.get('/discounts/create', [AdminDiscountsController, 'create']).as('admin.discounts.create')
    router.post('/discounts', [AdminDiscountsController, 'store']).as('admin.discounts.store')
    router.get('/discounts/:id/edit', [AdminDiscountsController, 'edit']).as('admin.discounts.edit')
    router.patch('/discounts/:id', [AdminDiscountsController, 'update']).as('admin.discounts.update')
    router.delete('/discounts/:id', [AdminDiscountsController, 'destroy']).as('admin.discounts.destroy')
    router.post('/discounts/:id/toggle', [AdminDiscountsController, 'toggleStatus']).as('admin.discounts.toggle')

    // Inventory
    router.get('/inventory', [AdminInventoryController, 'index']).as('admin.inventory.index')
    router.get('/inventory/locations', [AdminInventoryController, 'locations']).as('admin.inventory.locations')
    router.post('/inventory/locations', [AdminInventoryController, 'createLocation']).as('admin.inventory.locations.create')
    router.patch('/inventory/locations/:id', [AdminInventoryController, 'updateLocation']).as('admin.inventory.locations.update')
    router.get('/inventory/variants/:id', [AdminInventoryController, 'variantInventory']).as('admin.inventory.variant')
    router.post('/inventory/variants/:id/adjust', [AdminInventoryController, 'adjustStock']).as('admin.inventory.adjust')
    router.post('/inventory/variants/:id/set', [AdminInventoryController, 'setStock']).as('admin.inventory.set')
    router.post('/inventory/transfer', [AdminInventoryController, 'transfer']).as('admin.inventory.transfer')
    router.post('/inventory/bulk', [AdminInventoryController, 'bulkUpdate']).as('admin.inventory.bulk')

    // Settings
    router.get('/settings', [AdminSettingsController, 'index']).as('admin.settings.index')
    router.patch('/settings/general', [AdminSettingsController, 'updateGeneral']).as('admin.settings.general')
    router.patch('/settings', [AdminSettingsController, 'updateSettings']).as('admin.settings.update')
    router.get('/settings/taxes', [AdminSettingsController, 'taxes']).as('admin.settings.taxes')
    router.post('/settings/taxes/classes', [AdminSettingsController, 'createTaxClass']).as('admin.settings.taxes.classes.create')
    router.patch('/settings/taxes/classes/:id', [AdminSettingsController, 'updateTaxClass']).as('admin.settings.taxes.classes.update')
    router.delete('/settings/taxes/classes/:id', [AdminSettingsController, 'deleteTaxClass']).as('admin.settings.taxes.classes.delete')
    router.post('/settings/taxes/classes/:classId/rates', [AdminSettingsController, 'createTaxRate']).as('admin.settings.taxes.rates.create')
    router.patch('/settings/taxes/rates/:id', [AdminSettingsController, 'updateTaxRate']).as('admin.settings.taxes.rates.update')
    router.delete('/settings/taxes/rates/:id', [AdminSettingsController, 'deleteTaxRate']).as('admin.settings.taxes.rates.delete')
    router.get('/settings/currencies', [AdminSettingsController, 'currencies']).as('admin.settings.currencies')
    router.post('/settings/currencies', [AdminSettingsController, 'createCurrency']).as('admin.settings.currencies.create')
    router.patch('/settings/currencies/:id', [AdminSettingsController, 'updateCurrency']).as('admin.settings.currencies.update')
    router.get('/settings/locales', [AdminSettingsController, 'locales']).as('admin.settings.locales')
    router.post('/settings/locales', [AdminSettingsController, 'createLocale']).as('admin.settings.locales.create')
    router.patch('/settings/locales/:id', [AdminSettingsController, 'updateLocale']).as('admin.settings.locales.update')
    router.get('/settings/payments', [AdminSettingsController, 'payments']).as('admin.settings.payments')
    router.get('/settings/shipping', [AdminSettingsController, 'shipping']).as('admin.settings.shipping')

    // Content Management
    router.get('/content/pages', [AdminContentController, 'pages']).as('admin.content.pages')
    router.get('/content/menus', [AdminContentController, 'menus']).as('admin.content.menus')
    router.get('/content/banners', [AdminContentController, 'banners']).as('admin.content.banners')

    // Analytics Sub-Pages
    router.get('/analytics/sales', [AdminDashboardController, 'analyticsSales']).as('admin.analytics.sales')
    router.get('/analytics/products', [AdminDashboardController, 'analyticsProducts']).as('admin.analytics.products')
    router.get('/analytics/customers', [AdminDashboardController, 'analyticsCustomers']).as('admin.analytics.customers')

    // Collections
    router.get('/collections', [AdminCategoriesController, 'collections']).as('admin.collections')

    // Inventory Export/Import
    router.get('/inventory/export', [AdminInventoryController, 'exportInventory']).as('admin.inventory.export')
    router.get('/inventory/import', [AdminInventoryController, 'importInventory']).as('admin.inventory.importPage')
  }).use(middleware.adminAuth())
}).prefix('/admin')
