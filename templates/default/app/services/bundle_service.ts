import BundleProduct from '#models/bundle_product'
import BundleItem from '#models/bundle_item'
import Product from '#models/product'
import Application from '@adonisjs/core/app'

interface CreateBundleDTO {
  productId: string
  pricingType: 'fixed' | 'discount_percentage' | 'discount_fixed'
  fixedPrice?: number
  discountPercentage?: number
  discountFixed?: number
  trackInventory?: boolean
  stockQuantity?: number
  isVisible?: boolean
  items: {
    componentProductId: string
    quantity: number
    required?: boolean
    minQuantity?: number
    maxQuantity?: number
    overridePrice?: number
    useOverridePrice?: boolean
    position?: number
    variantSelection?: Record<string, any>
  }[]
}

interface UpdateBundleDTO {
  pricingType?: 'fixed' | 'discount_percentage' | 'discount_fixed'
  fixedPrice?: number
  discountPercentage?: number
  discountFixed?: number
  trackInventory?: boolean
  stockQuantity?: number
  isVisible?: boolean
}

interface AddBundleItemDTO {
  componentProductId: string
  quantity: number
  required?: boolean
  minQuantity?: number
  maxQuantity?: number
  overridePrice?: number
  useOverridePrice?: boolean
  position?: number
  variantSelection?: Record<string, any>
}

export default class BundleService {
  constructor(protected app: Application) {}

  /**
   * Create bundle product
   */
  async createBundle(data: CreateBundleDTO): Promise<BundleProduct> {
    // Create bundle
    const bundle = await BundleProduct.create({
      productId: data.productId,
      pricingType: data.pricingType,
      fixedPrice: data.fixedPrice || null,
      discountPercentage: data.discountPercentage || null,
      discountFixed: data.discountFixed || null,
      trackInventory: data.trackInventory ?? true,
      stockQuantity: data.stockQuantity || 0,
      isVisible: data.isVisible ?? true,
      metadata: {},
    })

    // Create bundle items
    for (const itemData of data.items) {
      await BundleItem.create({
        bundleProductId: bundle.id,
        componentProductId: itemData.componentProductId,
        quantity: itemData.quantity,
        required: itemData.required ?? true,
        minQuantity: itemData.minQuantity || 1,
        maxQuantity: itemData.maxQuantity || null,
        overridePrice: itemData.overridePrice || null,
        useOverridePrice: itemData.useOverridePrice || false,
        position: itemData.position || 0,
        variantSelection: itemData.variantSelection || null,
        metadata: {},
      })
    }

    return bundle
  }

  /**
   * Update bundle
   */
  async updateBundle(bundleId: string, data: UpdateBundleDTO): Promise<BundleProduct> {
    const bundle = await BundleProduct.findOrFail(bundleId)

    if (data.pricingType) bundle.pricingType = data.pricingType
    if (data.fixedPrice !== undefined) bundle.fixedPrice = data.fixedPrice
    if (data.discountPercentage !== undefined) bundle.discountPercentage = data.discountPercentage
    if (data.discountFixed !== undefined) bundle.discountFixed = data.discountFixed
    if (data.trackInventory !== undefined) bundle.trackInventory = data.trackInventory
    if (data.stockQuantity !== undefined) bundle.stockQuantity = data.stockQuantity
    if (data.isVisible !== undefined) bundle.isVisible = data.isVisible

    await bundle.save()
    return bundle
  }

  /**
   * Add item to bundle
   */
  async addBundleItem(bundleId: string, data: AddBundleItemDTO): Promise<BundleItem> {
    // Get current max position
    const currentItems = await BundleItem.query().where('bundleProductId', bundleId)
    const maxPosition = currentItems.reduce((max, item) => Math.max(max, item.position), 0)

    const item = await BundleItem.create({
      bundleProductId: bundleId,
      componentProductId: data.componentProductId,
      quantity: data.quantity,
      required: data.required ?? true,
      minQuantity: data.minQuantity || 1,
      maxQuantity: data.maxQuantity || null,
      overridePrice: data.overridePrice || null,
      useOverridePrice: data.useOverridePrice || false,
      position: data.position ?? maxPosition + 1,
      variantSelection: data.variantSelection || null,
      metadata: {},
    })

    return item
  }

  /**
   * Update bundle item
   */
  async updateBundleItem(itemId: string, data: Partial<AddBundleItemDTO>): Promise<BundleItem> {
    const item = await BundleItem.findOrFail(itemId)

    if (data.quantity !== undefined) item.quantity = data.quantity
    if (data.required !== undefined) item.required = data.required
    if (data.minQuantity !== undefined) item.minQuantity = data.minQuantity
    if (data.maxQuantity !== undefined) item.maxQuantity = data.maxQuantity
    if (data.overridePrice !== undefined) item.overridePrice = data.overridePrice
    if (data.useOverridePrice !== undefined) item.useOverridePrice = data.useOverridePrice
    if (data.position !== undefined) item.position = data.position
    if (data.variantSelection !== undefined) item.variantSelection = data.variantSelection

    await item.save()
    return item
  }

  /**
   * Remove item from bundle
   */
  async removeBundleItem(itemId: string): Promise<void> {
    const item = await BundleItem.findOrFail(itemId)
    await item.delete()
  }

  /**
   * Reorder bundle items
   */
  async reorderBundleItems(bundleId: string, itemOrders: { itemId: string; position: number }[]): Promise<void> {
    for (const { itemId, position } of itemOrders) {
      await BundleItem.query().where('id', itemId).update({ position })
    }
  }

  /**
   * Delete bundle
   */
  async deleteBundle(bundleId: string): Promise<void> {
    const bundle = await BundleProduct.findOrFail(bundleId)
    await bundle.delete()
  }

  /**
   * Get bundle with items
   */
  async getBundleWithItems(bundleId: string): Promise<BundleProduct | null> {
    const bundle = await BundleProduct.find(bundleId)
    if (!bundle) return null

    await bundle.load('items')
    for (const item of bundle.items) {
      await item.load('componentProduct')
    }

    return bundle
  }

  /**
   * Get all bundles
   */
  async getAllBundles(): Promise<BundleProduct[]> {
    const bundles = await BundleProduct.query()
      .orderBy('createdAt', 'desc')
      .preload('items', (itemsQuery) => {
        itemsQuery.orderBy('position')
      })

    return bundles
  }

  /**
   * Get available bundles (in stock and visible)
   */
  async getAvailableBundles(): Promise<BundleProduct[]> {
    const bundles = await BundleProduct.query()
      .where('isVisible', true)
      .orderBy('createdAt', 'desc')
      .preload('items', (itemsQuery) => {
        itemsQuery.orderBy('position')
      })

    // Filter by stock
    const availableBundles: BundleProduct[] = []

    for (const bundle of bundles) {
      if (await bundle.isInStock()) {
        availableBundles.push(bundle)
      }
    }

    return availableBundles
  }

  /**
   * Check if product is part of any bundle
   */
  async getProductBundles(productId: string): Promise<BundleProduct[]> {
    const bundleItems = await BundleItem.query().where('componentProductId', productId)
    const bundleIds = bundleItems.map((item) => item.bundleProductId)

    return await BundleProduct.query().whereIn('id', bundleIds).where('isVisible', true)
  }

  /**
   * Calculate bundle price with items
   */
  async calculateBundlePrice(bundleId: string): Promise<number> {
    const bundle = await BundleProduct.findOrFail(bundleId)
    return await bundle.calculatePrice()
  }

  /**
   * Calculate bundle savings
   */
  async calculateBundleSavings(bundleId: string): Promise<number> {
    const bundle = await BundleProduct.findOrFail(bundleId)
    return await bundle.calculateSavings()
  }

  /**
   * Duplicate bundle
   */
  async duplicateBundle(bundleId: string, newProductId: string): Promise<BundleProduct> {
    const originalBundle = await BundleProduct.findOrFail(bundleId)
    const originalItems = await BundleItem.query().where('bundleProductId', bundleId)

    // Create new bundle
    const newBundle = await BundleProduct.create({
      productId: newProductId,
      pricingType: originalBundle.pricingType,
      fixedPrice: originalBundle.fixedPrice,
      discountPercentage: originalBundle.discountPercentage,
      discountFixed: originalBundle.discountFixed,
      trackInventory: originalBundle.trackInventory,
      stockQuantity: originalBundle.stockQuantity,
      isVisible: originalBundle.isVisible,
      metadata: { ...originalBundle.metadata },
    })

    // Copy bundle items
    for (const originalItem of originalItems) {
      await BundleItem.create({
        bundleProductId: newBundle.id,
        componentProductId: originalItem.componentProductId,
        quantity: originalItem.quantity,
        required: originalItem.required,
        minQuantity: originalItem.minQuantity,
        maxQuantity: originalItem.maxQuantity,
        overridePrice: originalItem.overridePrice,
        useOverridePrice: originalItem.useOverridePrice,
        position: originalItem.position,
        variantSelection: originalItem.variantSelection,
        metadata: { ...originalItem.metadata },
      })
    }

    return newBundle
  }

  /**
   * Validate bundle stock
   */
  async validateBundleStock(bundleId: string, quantity: number = 1): Promise<boolean> {
    const bundle = await BundleProduct.findOrFail(bundleId)

    if (!bundle.trackInventory) {
      // Check component products
      const items = await bundle.items()
      for (const item of items) {
        const product = await item.componentProduct()
        if (product && product.trackInventory && product.stockQuantity < item.quantity * quantity) {
          return false
        }
      }
      return true
    }

    return bundle.stockQuantity >= quantity
  }

  /**
   * Get bundle pricing summary
   */
  async getPricingSummary(bundleId: string): Promise<{
    originalPrice: number
    bundlePrice: number
    savings: number
    savingsPercentage: number
    pricingType: string
  }> {
    const bundle = await BundleProduct.findOrFail(bundleId)
    const items = await bundle.items()
    const products = await bundle.componentProducts()
    const priceMap = new Map(products.map((p) => [p.id, p.price]))

    let originalPrice = 0

    for (const item of items) {
      if (item.useOverridePrice && item.overridePrice !== null) {
        originalPrice += item.overridePrice * item.quantity
      } else {
        const productPrice = priceMap.get(item.componentProductId) || 0
        originalPrice += productPrice * item.quantity
      }
    }

    const bundlePrice = await bundle.calculatePrice()
    const savings = originalPrice - bundlePrice
    const savingsPercentage = originalPrice > 0 ? Math.round((savings / originalPrice) * 100) : 0

    return {
      originalPrice,
      bundlePrice,
      savings,
      savingsPercentage,
      pricingType: bundle.pricingType,
    }
  }
}
