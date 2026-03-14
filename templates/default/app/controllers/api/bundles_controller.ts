import type { HttpContext } from '@adonisjs/core/http'
import BundleService from '#services/bundle_service'

export default class BundlesController {
  protected bundleService: BundleService

  constructor() {
    this.bundleService = new BundleService()
  }

  /**
   * Create bundle
   * POST /api/bundles
   */
  async create({ request, response }: HttpContext) {
    try {
      const data = request.only([
        'productId',
        'pricingType',
        'fixedPrice',
        'discountPercentage',
        'discountFixed',
        'trackInventory',
        'stockQuantity',
        'isVisible',
        'items',
      ])

      const bundle = await this.bundleService.createBundle(data)

      return response.status(201).json({
        data: bundle,
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Get all bundles
   * GET /api/bundles
   */
  async index({ response }: HttpContext) {
    try {
      const bundles = await this.bundleService.getAllBundles()

      return response.json({
        data: bundles,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }

  /**
   * Get available bundles
   * GET /api/bundles/available
   */
  async available({ response }: HttpContext) {
    try {
      const bundles = await this.bundleService.getAvailableBundles()

      return response.json({
        data: bundles,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }

  /**
   * Get bundle with items
   * GET /api/bundles/:id
   */
  async show({ params, response }: HttpContext) {
    try {
      const bundle = await this.bundleService.getBundleWithItems(params.id)

      if (!bundle) {
        return response.status(404).json({
          error: 'Bundle not found',
        })
      }

      return response.json({
        data: bundle,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }

  /**
   * Update bundle
   * PATCH /api/bundles/:id
   */
  async update({ params, request, response }: HttpContext) {
    try {
      const data = request.only([
        'pricingType',
        'fixedPrice',
        'discountPercentage',
        'discountFixed',
        'trackInventory',
        'stockQuantity',
        'isVisible',
      ])

      const bundle = await this.bundleService.updateBundle(params.id, data)

      return response.json({
        data: bundle,
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Delete bundle
   * DELETE /api/bundles/:id
   */
  async destroy({ params, response }: HttpContext) {
    try {
      await this.bundleService.deleteBundle(params.id)

      return response.status(204)
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Add item to bundle
   * POST /api/bundles/:id/items
   */
  async addItem({ params, request, response }: HttpContext) {
    try {
      const data = request.only([
        'componentProductId',
        'quantity',
        'required',
        'minQuantity',
        'maxQuantity',
        'overridePrice',
        'useOverridePrice',
        'position',
        'variantSelection',
      ])

      const item = await this.bundleService.addBundleItem(params.id, data)

      return response.status(201).json({
        data: item,
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Update bundle item
   * PATCH /api/bundles/items/:itemId
   */
  async updateItem({ params, request, response }: HttpContext) {
    try {
      const data = request.only([
        'quantity',
        'required',
        'minQuantity',
        'maxQuantity',
        'overridePrice',
        'useOverridePrice',
        'position',
        'variantSelection',
      ])

      const item = await this.bundleService.updateBundleItem(params.itemId, data)

      return response.json({
        data: item,
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Remove bundle item
   * DELETE /api/bundles/items/:itemId
   */
  async removeItem({ params, response }: HttpContext) {
    try {
      await this.bundleService.removeBundleItem(params.itemId)

      return response.status(204)
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Reorder bundle items
   * POST /api/bundles/:id/reorder
   */
  async reorderItems({ params, request, response }: HttpContext) {
    try {
      const { itemOrders } = request.only(['itemOrders'])

      await this.bundleService.reorderBundleItems(params.id, itemOrders)

      return response.json({
        data: {
          message: 'Items reordered successfully',
        },
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Duplicate bundle
   * POST /api/bundles/:id/duplicate
   */
  async duplicate({ params, request, response }: HttpContext) {
    try {
      const { newProductId } = request.only(['newProductId'])

      const newBundle = await this.bundleService.duplicateBundle(params.id, newProductId)

      return response.status(201).json({
        data: newBundle,
      })
    } catch (error) {
      return response.status(400).json({
        error: error.message,
      })
    }
  }

  /**
   * Get bundle pricing summary
   * GET /api/bundles/:id/pricing
   */
  async pricing({ params, response }: HttpContext) {
    try {
      const pricing = await this.bundleService.getPricingSummary(params.id)

      return response.json({
        data: pricing,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }

  /**
   * Get product bundles
   * GET /api/bundles/product/:productId
   */
  async getByProduct({ params, response }: HttpContext) {
    try {
      const bundles = await this.bundleService.getProductBundles(params.productId)

      return response.json({
        data: bundles,
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }

  /**
   * Validate bundle stock
   * GET /api/bundles/:id/stock/:quantity
   */
  async validateStock({ params, response }: HttpContext) {
    try {
      const quantity = params.quantity || 1
      const isValid = await this.bundleService.validateBundleStock(params.id, Number(quantity))

      return response.json({
        data: {
          isValid,
          available: isValid,
        },
      })
    } catch (error) {
      return response.status(500).json({
        error: error.message,
      })
    }
  }
}
