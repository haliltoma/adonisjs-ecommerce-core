/**
 * Service Container
 *
 * Simple IoC container for managing service dependencies.
 * This enables proper dependency injection following SOLID principles.
 * Updated with Factories for OCP
 */

import OrderRepository from '#repositories/implementations/order_repository'
import CartRepository from '#repositories/implementations/cart_repository'
import ProductRepository from '#repositories/implementations/product_repository'
import CustomerRepository from '#repositories/implementations/customer_repository'
import InventoryRepository from '#repositories/implementations/inventory_repository'
import CheckoutService from '#services/checkout_service'
import OrderService from '#services/order_service'
import CartService from '#services/cart_service'
import ProductService from '#services/product_service'
import CategoryService from '#services/category_service'
import DiscountService from '#services/discount_service'
import CustomerService from '#services/customer_service'
import StoreService from '#services/store_service'
import InventoryService from '#services/inventory_service'
import GiftCardService from '#services/gift_card_service'
import DraftOrderService from '#services/draft_order_service'
import PriceListService from '#services/price_list_service'
import AiService from '#services/ai_service'
import AuthService from '#services/auth_service'
import SubscriptionService from '#services/subscription_service'
import BundleService from '#services/bundle_service'
import DigitalProductService from '#services/digital_product_service'
import ImageService from '#services/image_service'
import RegionService from '#services/region_service'
import SalesChannelService from '#services/sales_channel_service'
import CustomerGroupService from '#services/customer_group_service'
import ReturnService from '#services/return_service'
import ApiKeyService from '#services/api_key_service'
import ShippingProfileService from '#services/shipping_profile_service'
import FulfillmentService from '#services/fulfillment_service'
import RefundService from '#services/refund_service'
import InvoiceService from '#services/invoice_service'
import ImportExportService from '#services/import_export_service'
import OrderItemFactory from '#services/order/order_item_factory'
import OrderStatusManager from '#services/order/order_status_manager'
import OrderNumberGenerator from '#services/order/order_number_generator'
import CartTotalsCalculator from '#services/cart/cart_totals_calculator'
import CartDiscountApplicator from '#services/cart/cart_discount_applicator'
import CartTaxCalculator from '#services/cart/cart_tax_calculator'
import CartItemManager from '#services/cart/cart_item_manager'
import CartValidator from '#services/cart/cart_validator'
import ProductSlugGenerator from '#services/product/product_slug_generator'
import ProductVariantManager from '#services/product/product_variant_manager'
import ProductImageManager from '#services/product/product_image_manager'
import ProductCategoryManager from '#services/product/product_category_manager'
import ProductInventoryManager from '#services/product/product_inventory_manager'
import ProductOptionManager from '#services/product/product_option_manager'
import ProductTagManager from '#services/product/product_tag_manager'
import PaymentProviderFactory from '#factories/payment_provider_factory'
import SearchProviderFactory from '#factories/search_provider_factory'

/**
 * Service Container Singleton
 */
class ServiceContainer {
  private static instance: ServiceContainer
  private services: Map<string, any> = new Map()
  private initialized = false

  private constructor() {}

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer()
    }
    return ServiceContainer.instance
  }

  /**
   * Initialize all services (lazy initialization)
   */
  private ensureInitialized() {
    if (this.initialized) return

    // Repositories (Singleton)
    this.services.set('OrderRepository', new OrderRepository())
    this.services.set('CartRepository', new CartRepository())
    this.services.set('ProductRepository', new ProductRepository())
    this.services.set('CustomerRepository', new CustomerRepository())
    this.services.set('InventoryRepository', new InventoryRepository())

    // Order Service Components
    this.services.set('OrderItemFactory', new OrderItemFactory())
    this.services.set('OrderStatusManager', new OrderStatusManager())
    this.services.set('OrderNumberGenerator', new OrderNumberGenerator())

    // Cart Service Components
    this.services.set('CartTotalsCalculator', new CartTotalsCalculator())
    this.services.set('CartDiscountApplicator', new CartDiscountApplicator())
    this.services.set('CartTaxCalculator', new CartTaxCalculator())
    this.services.set('CartItemManager', new CartItemManager())
    this.services.set('CartValidator', new CartValidator())

    // Product Service Components
    this.services.set('ProductSlugGenerator', new ProductSlugGenerator())
    this.services.set('ProductVariantManager', new ProductVariantManager())
    this.services.set('ProductImageManager', new ProductImageManager())
    this.services.set('ProductCategoryManager', new ProductCategoryManager())
    this.services.set('ProductInventoryManager', new ProductInventoryManager())
    this.services.set('ProductOptionManager', new ProductOptionManager())
    this.services.set('ProductTagManager', new ProductTagManager())

    // Checkout Service (with dependencies)
    this.services.set(
      'CheckoutService',
      new CheckoutService(
        this.services.get('CartRepository'),
        this.services.get('OrderRepository'),
        this.services.get('InventoryRepository')
      )
    )

    // Order Service (with dependencies)
    const orderRepository = this.services.get('OrderRepository')
    const cartRepository = this.services.get('CartRepository')
    const orderItemFactory = this.services.get('OrderItemFactory')
    const statusManager = this.services.get('OrderStatusManager')
    const numberGenerator = this.services.get('OrderNumberGenerator')
    const productRepository = this.services.get('ProductRepository')

    this.services.set(
      'OrderService',
      new OrderService(
        orderRepository,
        cartRepository,
        orderItemFactory,
        statusManager,
        numberGenerator,
        productRepository
      )
    )

    // Cart Service (with dependencies)
    const totalsCalculator = this.services.get('CartTotalsCalculator')
    const discountApplicator = this.services.get('CartDiscountApplicator')
    const taxCalculator = this.services.get('CartTaxCalculator')
    const itemManager = this.services.get('CartItemManager')
    const validator = this.services.get('CartValidator')

    // Product Service (with dependencies)
    const slugGenerator = this.services.get('ProductSlugGenerator')
    const variantManager = this.services.get('ProductVariantManager')
    const imageManager = this.services.get('ProductImageManager')
    const categoryManager = this.services.get('ProductCategoryManager')
    const inventoryManager = this.services.get('ProductInventoryManager')
    const optionManager = this.services.get('ProductOptionManager')
    const tagManager = this.services.get('ProductTagManager')

    // Get DiscountService instance
    const discountService = this.services.get('DiscountService')

    this.services.set(
      'CartService',
      new CartService(
        cartRepository,
        this.services.get('ProductRepository'),
        totalsCalculator,
        discountApplicator,
        taxCalculator,
        itemManager,
        validator,
        discountService
      )
    )

    // Product Service (with dependencies)
    this.services.set(
      'ProductService',
      new ProductService(
        this.services.get('ProductRepository'),
        slugGenerator,
        variantManager,
        imageManager,
        categoryManager,
        inventoryManager,
        optionManager,
        tagManager
      )
    )

    // Factories (for OCP - Open/Closed Principle)
    this.services.set('PaymentProviderFactory', PaymentProviderFactory)
    this.services.set('SearchProviderFactory', SearchProviderFactory)

    // Additional Services (without complex dependencies)
    this.services.set('CategoryService', new CategoryService())
    this.services.set('DiscountService', new DiscountService())
    this.services.set('CustomerService', new CustomerService())
    this.services.set('StoreService', new StoreService())
    this.services.set('InventoryService', new InventoryService())
    this.services.set('GiftCardService', new GiftCardService())
    this.services.set('DraftOrderService', new DraftOrderService())
    this.services.set('PriceListService', new PriceListService())
    this.services.set('AiService', new AiService())
    this.services.set('AuthService', new AuthService())
    this.services.set('SubscriptionService', new SubscriptionService())
    this.services.set('BundleService', new BundleService())
    this.services.set('DigitalProductService', new DigitalProductService())
    this.services.set('ImageService', new ImageService())
    this.services.set('RegionService', new RegionService())
    this.services.set('SalesChannelService', new SalesChannelService())
    this.services.set('CustomerGroupService', new CustomerGroupService())
    this.services.set('ReturnService', new ReturnService())
    this.services.set('ApiKeyService', new ApiKeyService())
    this.services.set('ShippingProfileService', new ShippingProfileService())
    this.services.set('FulfillmentService', new FulfillmentService())
    this.services.set('RefundService', new RefundService())
    this.services.set('InvoiceService', new InvoiceService())
    this.services.set('ImportExportService', new ImportExportService())

    this.initialized = true
  }

  /**
   * Get service by name
   */
  get<T>(serviceName: string): T {
    this.ensureInitialized()

    const service = this.services.get(serviceName)

    if (!service) {
      throw new Error(`Service not found: ${serviceName}`)
    }

    return service as T
  }

  /**
   * Register a service
   */
  register(serviceName: string, instance: any) {
    this.services.set(serviceName, instance)
  }

  /**
   * Check if service exists
   */
  has(serviceName: string): boolean {
    this.ensureInitialized()
    return this.services.has(serviceName)
  }

  /**
   * Reset container (useful for testing)
   */
  reset() {
    this.services.clear()
    this.initialized = false
  }
}

/**
 * Export singleton instance getter
 */
export const getServiceContainer = () => ServiceContainer.getInstance()

/**
 * Convenience function to get a service
 */
export const useService = <T>(serviceName: string): T => {
  return getServiceContainer().get<T>(serviceName)
}

/**
 * Export specific service getters for type safety
 */
export const useOrderService = (): OrderService => useService<OrderService>('OrderService')
export const useCartService = (): CartService => useService<CartService>('CartService')
export const useProductService = (): ProductService => useService<ProductService>('ProductService')
export const useCheckoutService = (): CheckoutService => useService<CheckoutService>('CheckoutService')
export const useOrderRepository = (): OrderRepository => useService<OrderRepository>('OrderRepository')
export const useCartRepository = (): CartRepository => useService<CartRepository>('CartRepository')
export const useProductRepository = (): ProductRepository =>
  useService<ProductRepository>('ProductRepository')
export const useCustomerRepository = (): CustomerRepository =>
  useService<CustomerRepository>('CustomerRepository')
export const useInventoryRepository = (): InventoryRepository =>
  useService<InventoryRepository>('InventoryRepository')
export const usePaymentProvider = (): PaymentProviderFactory =>
  useService<PaymentProviderFactory>('PaymentProviderFactory')
export const useSearchProvider = (): SearchProviderFactory =>
  useService<SearchProviderFactory>('SearchProviderFactory')
export const useCategoryService = (): CategoryService =>
  useService<CategoryService>('CategoryService')
export const useDiscountService = (): DiscountService =>
  useService<DiscountService>('DiscountService')
export const useCustomerService = (): CustomerService =>
  useService<CustomerService>('CustomerService')
export const useStoreService = (): StoreService => useService<StoreService>('StoreService')
export const useInventoryService = (): InventoryService =>
  useService<InventoryService>('InventoryService')
export const useGiftCardService = (): GiftCardService =>
  useService<GiftCardService>('GiftCardService')
export const useDraftOrderService = (): DraftOrderService =>
  useService<DraftOrderService>('DraftOrderService')
export const usePriceListService = (): PriceListService =>
  useService<PriceListService>('PriceListService')
export const useAiService = (): AiService => useService<AiService>('AiService')
export const useAuthService = (): AuthService => useService<AuthService>('AuthService')
export const useSubscriptionService = (): SubscriptionService =>
  useService<SubscriptionService>('SubscriptionService')
export const useBundleService = (): BundleService => useService<BundleService>('BundleService')
export const useDigitalProductService = (): DigitalProductService =>
  useService<DigitalProductService>('DigitalProductService')
export const useImageService = (): ImageService => useService<ImageService>('ImageService')
export const useRegionService = (): RegionService => useService<RegionService>('RegionService')
export const useSalesChannelService = (): SalesChannelService =>
  useService<SalesChannelService>('SalesChannelService')
export const useCustomerGroupService = (): CustomerGroupService =>
  useService<CustomerGroupService>('CustomerGroupService')
export const useReturnService = (): ReturnService => useService<ReturnService>('ReturnService')
export const useApiKeyService = (): ApiKeyService => useService<ApiKeyService>('ApiKeyService')
export const useShippingProfileService = (): ShippingProfileService =>
  useService<ShippingProfileService>('ShippingProfileService')
export const useFulfillmentService = (): FulfillmentService =>
  useService<FulfillmentService>('FulfillmentService')
export const useRefundService = (): RefundService => useService<RefundService>('RefundService')
export const useInvoiceService = (): InvoiceService => useService<InvoiceService>('InvoiceService')
export const useImportExportService = (): ImportExportService =>
  useService<ImportExportService>('ImportExportService')
