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
const SocialAuthController = () => import('#controllers/storefront/social_auth_controller')

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
const AdminReviewsController = () => import('#controllers/admin/reviews_controller')
const AdminMarketingController = () => import('#controllers/admin/marketing_controller')
const PaymentWebhookController = () => import('#controllers/storefront/payment_webhook_controller')
const AdminPriceListsController = () => import('#controllers/admin/price_lists_controller')
const AdminDraftOrdersController = () => import('#controllers/admin/draft_orders_controller')
const AdminGiftCardsController = () => import('#controllers/admin/gift_cards_controller')
const AdminBlogController = () => import('#controllers/admin/blog_controller')
const StorefrontBlogController = () => import('#controllers/storefront/blog_controller')

/*
|--------------------------------------------------------------------------
| Storefront Routes
|--------------------------------------------------------------------------
*/

// Home
router.get('/', [HomeController, 'index']).as('storefront.home')
router.get('/search', [HomeController, 'search']).as('storefront.search')
router.get('/search/suggestions', [HomeController, 'searchSuggestions']).as('storefront.search.suggestions')
router.post('/newsletter/subscribe', [HomeController, 'subscribe']).as('storefront.newsletter.subscribe')

// Static Pages
router.get('/about', [PagesController, 'about']).as('storefront.about')
router.get('/contact', [PagesController, 'contact']).as('storefront.contact')
router.post('/contact', [PagesController, 'submitContact']).as('storefront.contact.submit')
router.get('/pages/:slug', [PagesController, 'show']).as('storefront.pages.show')

// Blog
router.get('/blog', [StorefrontBlogController, 'index']).as('storefront.blog.index')
router.get('/blog/:slug', [StorefrontBlogController, 'show']).as('storefront.blog.show')
router.get('/shipping', [PagesController, 'shipping']).as('storefront.shipping')
router.get('/returns', [PagesController, 'returns']).as('storefront.returns')
router.get('/faq', [PagesController, 'faq']).as('storefront.faq')
router.get('/privacy', [PagesController, 'privacy']).as('storefront.privacy')
router.get('/terms', [PagesController, 'terms']).as('storefront.terms')

// Products
router.get('/products', [ProductsController, 'index']).as('storefront.products.index')
router.get('/products/:slug', [ProductsController, 'show']).as('storefront.products.show')
router.post('/products/:slug/reviews', [ProductsController, 'submitReview']).as('storefront.products.submitReview')
router.get('/category/:slug', [ProductsController, 'byCategory']).as('storefront.category')
router.get('/collections', [ProductsController, 'collections']).as('storefront.collections')
router.get('/collections/:slug', [ProductsController, 'showCollection']).as('storefront.collections.show')
router.get('/categories', [ProductsController, 'allCategories']).as('storefront.categories')

// Compare
router.get('/compare', [ProductsController, 'compare']).as('storefront.compare')

// Order Tracking
router.get('/order-tracking', [AccountController, 'orderTracking']).as('storefront.orderTracking')

// Wishlist
router.get('/wishlist', [AccountController, 'wishlist']).as('storefront.wishlist')
router.post('/wishlist', [AccountController, 'addToWishlist']).as('storefront.wishlist.add')
router.delete('/wishlist/:id', [AccountController, 'removeFromWishlist']).as('storefront.wishlist.remove')

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

// Payment Webhooks (CSRF-exempt via shield config)
router.post('/webhooks/stripe', [PaymentWebhookController, 'stripe']).as('webhooks.stripe')
router.post('/webhooks/iyzico', [PaymentWebhookController, 'iyzico']).as('webhooks.iyzico')

// Social Auth
router.get('/auth/:provider/redirect', [SocialAuthController, 'redirect']).as('auth.social.redirect')
router.get('/auth/:provider/callback', [SocialAuthController, 'callback']).as('auth.social.callback')

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
router.get('/account/reviews', [AccountController, 'reviews']).as('storefront.account.reviews')
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
  router.post('/login', [AdminAuthController, 'login']).as('admin.auth.login.post').use(middleware.rateLimit({ maxAttempts: 5, windowSeconds: 60 }))
  router.get('/2fa', [AdminAuthController, 'show2FA']).as('admin.auth.2fa')
  router.post('/2fa', [AdminAuthController, 'verify2FA']).as('admin.auth.2fa.verify').use(middleware.rateLimit({ maxAttempts: 5, windowSeconds: 60 }))
  router.get('/forgot-password', [AdminAuthController, 'showForgotPassword']).as('admin.auth.forgotPassword')
  router.post('/forgot-password', [AdminAuthController, 'forgotPassword']).as('admin.auth.forgotPassword.post').use(middleware.rateLimit({ maxAttempts: 3, windowSeconds: 300 }))
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
    router.get('/products/import', [AdminProductsController, 'importPage']).as('admin.products.importPage')
    router.post('/products/import/process', [AdminProductsController, 'processImport']).as('admin.products.import.process')
    router.get('/products/export', [AdminProductsController, 'exportPage']).as('admin.products.exportPage')
    router.post('/products/export/download', [AdminProductsController, 'processExport']).as('admin.products.export.download')
    router.get('/products/template', [AdminProductsController, 'downloadTemplate']).as('admin.products.template')
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

    // Order Returns
    router.post('/orders/:id/returns', [AdminOrdersController, 'createReturn']).as('admin.orders.returns.create')
    router.post('/orders/:id/returns/:returnId/receive', [AdminOrdersController, 'receiveReturn']).as('admin.orders.returns.receive')
    router.post('/orders/:id/returns/:returnId/cancel', [AdminOrdersController, 'cancelReturn']).as('admin.orders.returns.cancel')
    router.post('/orders/:id/returns/:returnId/complete', [AdminOrdersController, 'completeReturn']).as('admin.orders.returns.complete')

    // Order Claims
    router.post('/orders/:id/claims', [AdminOrdersController, 'createClaim']).as('admin.orders.claims.create')
    router.patch('/orders/:id/claims/:claimId', [AdminOrdersController, 'updateClaimStatus']).as('admin.orders.claims.update')

    // Order Exchanges
    router.post('/orders/:id/exchanges', [AdminOrdersController, 'createExchange']).as('admin.orders.exchanges.create')
    router.patch('/orders/:id/exchanges/:exchangeId', [AdminOrdersController, 'updateExchangeStatus']).as('admin.orders.exchanges.update')

    // Order Edits
    router.post('/orders/:id/edits', [AdminOrdersController, 'createOrderEdit']).as('admin.orders.edits.create')
    router.post('/orders/:id/edits/:editId/request', [AdminOrdersController, 'requestOrderEdit']).as('admin.orders.edits.request')
    router.post('/orders/:id/edits/:editId/confirm', [AdminOrdersController, 'confirmOrderEdit']).as('admin.orders.edits.confirm')
    router.post('/orders/:id/edits/:editId/decline', [AdminOrdersController, 'declineOrderEdit']).as('admin.orders.edits.decline')

    // Draft Orders
    router.get('/draft-orders', [AdminDraftOrdersController, 'index']).as('admin.draftOrders.index')
    router.get('/draft-orders/create', [AdminDraftOrdersController, 'create']).as('admin.draftOrders.create')
    router.post('/draft-orders', [AdminDraftOrdersController, 'store']).as('admin.draftOrders.store')
    router.get('/draft-orders/:id', [AdminDraftOrdersController, 'show']).as('admin.draftOrders.show')
    router.patch('/draft-orders/:id', [AdminDraftOrdersController, 'update']).as('admin.draftOrders.update')
    router.delete('/draft-orders/:id', [AdminDraftOrdersController, 'destroy']).as('admin.draftOrders.destroy')
    router.post('/draft-orders/:id/register-payment', [AdminDraftOrdersController, 'registerPayment']).as('admin.draftOrders.registerPayment')

    // Gift Cards
    router.get('/gift-cards', [AdminGiftCardsController, 'index']).as('admin.giftCards.index')
    router.get('/gift-cards/create', [AdminGiftCardsController, 'create']).as('admin.giftCards.create')
    router.post('/gift-cards', [AdminGiftCardsController, 'store']).as('admin.giftCards.store')
    router.get('/gift-cards/:id', [AdminGiftCardsController, 'show']).as('admin.giftCards.show')
    router.patch('/gift-cards/:id', [AdminGiftCardsController, 'update']).as('admin.giftCards.update')
    router.post('/gift-cards/:id/adjust', [AdminGiftCardsController, 'adjustBalance']).as('admin.giftCards.adjust')
    router.post('/gift-cards/:id/toggle', [AdminGiftCardsController, 'toggleStatus']).as('admin.giftCards.toggle')

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

    // Price Lists
    router.get('/price-lists', [AdminPriceListsController, 'index']).as('admin.priceLists.index')
    router.get('/price-lists/create', [AdminPriceListsController, 'create']).as('admin.priceLists.create')
    router.post('/price-lists', [AdminPriceListsController, 'store']).as('admin.priceLists.store')
    router.get('/price-lists/:id/edit', [AdminPriceListsController, 'edit']).as('admin.priceLists.edit')
    router.patch('/price-lists/:id', [AdminPriceListsController, 'update']).as('admin.priceLists.update')
    router.delete('/price-lists/:id', [AdminPriceListsController, 'destroy']).as('admin.priceLists.destroy')
    router.patch('/price-lists/:id/rules', [AdminPriceListsController, 'updateRules']).as('admin.priceLists.rules')
    router.post('/price-lists/:id/prices', [AdminPriceListsController, 'addPrices']).as('admin.priceLists.prices.add')
    router.delete('/price-lists/:id/prices', [AdminPriceListsController, 'removePrices']).as('admin.priceLists.prices.remove')

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
    router.get('/content/pages/create', [AdminContentController, 'createPage']).as('admin.content.pages.create')
    router.post('/content/pages', [AdminContentController, 'storePage']).as('admin.content.pages.store')
    router.get('/content/pages/:id/edit', [AdminContentController, 'editPage']).as('admin.content.pages.edit')
    router.patch('/content/pages/:id', [AdminContentController, 'updatePage']).as('admin.content.pages.update')
    router.delete('/content/pages/:id', [AdminContentController, 'destroyPage']).as('admin.content.pages.destroy')
    router.get('/content/menus', [AdminContentController, 'menus']).as('admin.content.menus')
    router.post('/content/menus', [AdminContentController, 'storeMenu']).as('admin.content.menus.store')
    router.patch('/content/menus/:id', [AdminContentController, 'updateMenu']).as('admin.content.menus.update')
    router.delete('/content/menus/:id', [AdminContentController, 'destroyMenu']).as('admin.content.menus.destroy')
    router.post('/content/menus/:menuId/items', [AdminContentController, 'storeMenuItem']).as('admin.content.menus.items.store')
    router.patch('/content/menus/:menuId/items/:itemId', [AdminContentController, 'updateMenuItem']).as('admin.content.menus.items.update')
    router.delete('/content/menus/:menuId/items/:itemId', [AdminContentController, 'destroyMenuItem']).as('admin.content.menus.items.destroy')
    router.get('/content/banners', [AdminContentController, 'banners']).as('admin.content.banners')
    router.post('/content/banners', [AdminContentController, 'storeBanner']).as('admin.content.banners.store')
    router.patch('/content/banners/:id', [AdminContentController, 'updateBanner']).as('admin.content.banners.update')
    router.delete('/content/banners/:id', [AdminContentController, 'destroyBanner']).as('admin.content.banners.destroy')

    // Blog
    router.get('/blog', [AdminBlogController, 'index']).as('admin.blog.index')
    router.get('/blog/create', [AdminBlogController, 'create']).as('admin.blog.create')
    router.post('/blog', [AdminBlogController, 'store']).as('admin.blog.store')
    router.get('/blog/:id/edit', [AdminBlogController, 'edit']).as('admin.blog.edit')
    router.patch('/blog/:id', [AdminBlogController, 'update']).as('admin.blog.update')
    router.delete('/blog/:id', [AdminBlogController, 'destroy']).as('admin.blog.destroy')
    router.get('/blog/categories', [AdminBlogController, 'categories']).as('admin.blog.categories')
    router.post('/blog/categories', [AdminBlogController, 'storeCategory']).as('admin.blog.categories.store')
    router.patch('/blog/categories/:id', [AdminBlogController, 'updateCategory']).as('admin.blog.categories.update')
    router.delete('/blog/categories/:id', [AdminBlogController, 'destroyCategory']).as('admin.blog.categories.destroy')

    // Reviews
    router.get('/reviews', [AdminReviewsController, 'index']).as('admin.reviews.index')
    router.patch('/reviews/:id/status', [AdminReviewsController, 'updateStatus']).as('admin.reviews.updateStatus')
    router.delete('/reviews/:id', [AdminReviewsController, 'destroy']).as('admin.reviews.destroy')

    // Marketing
    router.get('/marketing', [AdminMarketingController, 'index']).as('admin.marketing.index')
    router.get('/marketing/abandoned-carts', [AdminMarketingController, 'abandonedCarts']).as('admin.marketing.abandonedCarts')
    router.get('/marketing/email-campaigns', [AdminMarketingController, 'emailCampaigns']).as('admin.marketing.emailCampaigns')

    // Settings - Webhooks
    router.get('/settings/webhooks', [AdminSettingsController, 'webhooks']).as('admin.settings.webhooks')
    router.post('/settings/webhooks', [AdminSettingsController, 'createWebhook']).as('admin.settings.webhooks.create')
    router.patch('/settings/webhooks/:id', [AdminSettingsController, 'updateWebhook']).as('admin.settings.webhooks.update')
    router.delete('/settings/webhooks/:id', [AdminSettingsController, 'destroyWebhook']).as('admin.settings.webhooks.destroy')
    router.post('/settings/webhooks/:id/test', [AdminSettingsController, 'testWebhook']).as('admin.settings.webhooks.test')
    router.get('/settings/webhooks/:id/logs', [AdminSettingsController, 'webhookLogs']).as('admin.settings.webhooks.logs')

    // Settings - Users
    router.get('/settings/users', [AdminSettingsController, 'users']).as('admin.settings.users')
    router.post('/settings/users', [AdminSettingsController, 'createUser']).as('admin.settings.users.create')
    router.patch('/settings/users/:id', [AdminSettingsController, 'updateUser']).as('admin.settings.users.update')
    router.delete('/settings/users/:id', [AdminSettingsController, 'destroyUser']).as('admin.settings.users.destroy')

    // Settings - Roles & Permissions
    router.get('/settings/roles', [AdminSettingsController, 'roles']).as('admin.settings.roles')
    router.post('/settings/roles', [AdminSettingsController, 'createRole']).as('admin.settings.roles.create')
    router.patch('/settings/roles/:id', [AdminSettingsController, 'updateRole']).as('admin.settings.roles.update')
    router.delete('/settings/roles/:id', [AdminSettingsController, 'destroyRole']).as('admin.settings.roles.destroy')

    // Settings - URL Redirects
    router.get('/settings/redirects', [AdminSettingsController, 'redirects']).as('admin.settings.redirects')
    router.post('/settings/redirects', [AdminSettingsController, 'createRedirect']).as('admin.settings.redirects.create')
    router.patch('/settings/redirects/:id', [AdminSettingsController, 'updateRedirect']).as('admin.settings.redirects.update')
    router.delete('/settings/redirects/:id', [AdminSettingsController, 'destroyRedirect']).as('admin.settings.redirects.destroy')

    // Settings - SEO
    router.get('/settings/seo', [AdminSettingsController, 'seo']).as('admin.settings.seo')
    router.patch('/settings/seo', [AdminSettingsController, 'updateSeo']).as('admin.settings.seo.update')

    // Settings - Store
    router.get('/settings/store', [AdminSettingsController, 'store']).as('admin.settings.store')
    router.patch('/settings/store', [AdminSettingsController, 'updateStore']).as('admin.settings.store.update')

    // Settings - Attributes
    router.get('/settings/attributes', [AdminSettingsController, 'attributes']).as('admin.settings.attributes')
    router.post('/settings/attributes', [AdminSettingsController, 'createAttribute']).as('admin.settings.attributes.create')
    router.patch('/settings/attributes/:id', [AdminSettingsController, 'updateAttribute']).as('admin.settings.attributes.update')
    router.delete('/settings/attributes/:id', [AdminSettingsController, 'destroyAttribute']).as('admin.settings.attributes.destroy')

    // Settings - Regions
    router.get('/settings/regions', [AdminSettingsController, 'regions']).as('admin.settings.regions')
    router.post('/settings/regions', [AdminSettingsController, 'createRegion']).as('admin.settings.regions.create')
    router.patch('/settings/regions/:id', [AdminSettingsController, 'updateRegion']).as('admin.settings.regions.update')
    router.delete('/settings/regions/:id', [AdminSettingsController, 'destroyRegion']).as('admin.settings.regions.destroy')
    router.post('/settings/regions/:id/countries', [AdminSettingsController, 'addRegionCountries']).as('admin.settings.regions.countries.add')
    router.delete('/settings/regions/:id/countries/:countryCode', [AdminSettingsController, 'removeRegionCountry']).as('admin.settings.regions.countries.remove')

    // Settings - Sales Channels
    router.get('/settings/sales-channels', [AdminSettingsController, 'salesChannels']).as('admin.settings.salesChannels')
    router.post('/settings/sales-channels', [AdminSettingsController, 'createSalesChannel']).as('admin.settings.salesChannels.create')
    router.patch('/settings/sales-channels/:id', [AdminSettingsController, 'updateSalesChannel']).as('admin.settings.salesChannels.update')
    router.delete('/settings/sales-channels/:id', [AdminSettingsController, 'destroySalesChannel']).as('admin.settings.salesChannels.destroy')
    router.post('/settings/sales-channels/:id/products', [AdminSettingsController, 'addSalesChannelProducts']).as('admin.settings.salesChannels.products.add')
    router.delete('/settings/sales-channels/:id/products', [AdminSettingsController, 'removeSalesChannelProducts']).as('admin.settings.salesChannels.products.remove')

    // Settings - Customer Groups
    router.get('/settings/customer-groups', [AdminSettingsController, 'customerGroups']).as('admin.settings.customerGroups')
    router.post('/settings/customer-groups', [AdminSettingsController, 'createCustomerGroup']).as('admin.settings.customerGroups.create')
    router.patch('/settings/customer-groups/:id', [AdminSettingsController, 'updateCustomerGroup']).as('admin.settings.customerGroups.update')
    router.delete('/settings/customer-groups/:id', [AdminSettingsController, 'destroyCustomerGroup']).as('admin.settings.customerGroups.destroy')
    router.post('/settings/customer-groups/:id/customers', [AdminSettingsController, 'addCustomersToGroup']).as('admin.settings.customerGroups.customers.add')
    router.delete('/settings/customer-groups/:id/customers', [AdminSettingsController, 'removeCustomersFromGroup']).as('admin.settings.customerGroups.customers.remove')

    // Settings - Shipping Profiles
    router.get('/settings/shipping-profiles', [AdminSettingsController, 'shippingProfiles']).as('admin.settings.shippingProfiles')
    router.post('/settings/shipping-profiles', [AdminSettingsController, 'createShippingProfile']).as('admin.settings.shippingProfiles.create')
    router.patch('/settings/shipping-profiles/:id', [AdminSettingsController, 'updateShippingProfile']).as('admin.settings.shippingProfiles.update')
    router.delete('/settings/shipping-profiles/:id', [AdminSettingsController, 'destroyShippingProfile']).as('admin.settings.shippingProfiles.destroy')

    // Settings - API Keys
    router.get('/settings/api-keys', [AdminSettingsController, 'apiKeys']).as('admin.settings.apiKeys')
    router.post('/settings/api-keys', [AdminSettingsController, 'createApiKey']).as('admin.settings.apiKeys.create')
    router.post('/settings/api-keys/:id/revoke', [AdminSettingsController, 'revokeApiKey']).as('admin.settings.apiKeys.revoke')
    router.delete('/settings/api-keys/:id', [AdminSettingsController, 'destroyApiKey']).as('admin.settings.apiKeys.destroy')

    // Settings - Return Reasons
    router.get('/settings/return-reasons', [AdminSettingsController, 'returnReasons']).as('admin.settings.returnReasons')
    router.post('/settings/return-reasons', [AdminSettingsController, 'createReturnReason']).as('admin.settings.returnReasons.create')
    router.patch('/settings/return-reasons/:id', [AdminSettingsController, 'updateReturnReason']).as('admin.settings.returnReasons.update')
    router.delete('/settings/return-reasons/:id', [AdminSettingsController, 'destroyReturnReason']).as('admin.settings.returnReasons.destroy')

    // Settings - Integrations
    router.get('/settings/integrations', [AdminSettingsController, 'integrations']).as('admin.settings.integrations')

    // Settings - Payment Provider Config
    router.patch('/settings/payments/provider', [AdminSettingsController, 'updatePaymentProvider']).as('admin.settings.payments.provider')

    // Settings - Shipping Method Config
    router.patch('/settings/shipping/method', [AdminSettingsController, 'updateShippingMethod']).as('admin.settings.shipping.method')

    // Settings - Cache Management
    router.post('/settings/cache/clear', [AdminSettingsController, 'clearCache']).as('admin.settings.cache.clear')

    // Plugins
    router.get('/plugins', [AdminSettingsController, 'plugins']).as('admin.plugins.index')

    // Analytics Sub-Pages
    router.get('/analytics/sales', [AdminDashboardController, 'analyticsSales']).as('admin.analytics.sales')
    router.get('/analytics/products', [AdminDashboardController, 'analyticsProducts']).as('admin.analytics.products')
    router.get('/analytics/customers', [AdminDashboardController, 'analyticsCustomers']).as('admin.analytics.customers')

    // Collections
    router.get('/collections', [AdminCategoriesController, 'collections']).as('admin.collections')
    router.get('/collections/create', [AdminCategoriesController, 'createCollection']).as('admin.collections.create')
    router.post('/collections', [AdminCategoriesController, 'storeCollection']).as('admin.collections.store')
    router.get('/collections/:id/edit', [AdminCategoriesController, 'editCollection']).as('admin.collections.edit')
    router.patch('/collections/:id', [AdminCategoriesController, 'updateCollection']).as('admin.collections.update')
    router.delete('/collections/:id', [AdminCategoriesController, 'destroyCollection']).as('admin.collections.destroy')

    // Inventory Export/Import
    router.get('/inventory/export', [AdminInventoryController, 'exportInventory']).as('admin.inventory.export')
    router.get('/inventory/import', [AdminInventoryController, 'importInventory']).as('admin.inventory.importPage')
    router.post('/inventory/export/download', [AdminInventoryController, 'processExport']).as('admin.inventory.export.download')
    router.post('/inventory/import/process', [AdminInventoryController, 'processImport']).as('admin.inventory.import.process')
    router.get('/inventory/template', [AdminInventoryController, 'downloadTemplate']).as('admin.inventory.template')
  }).use(middleware.adminAuth())
}).prefix('/admin')
