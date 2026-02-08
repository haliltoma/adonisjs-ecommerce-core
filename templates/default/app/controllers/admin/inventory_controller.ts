import type { HttpContext } from '@adonisjs/core/http'
import InventoryService from '#services/inventory_service'
import ProductVariant from '#models/product_variant'
import type InventoryMovement from '#models/inventory_movement'

export default class InventoryController {
  private inventoryService: InventoryService

  constructor() {
    this.inventoryService = new InventoryService()
  }

  async index({ inertia, request, store }: HttpContext) {
    const storeId = store.id
    const view = request.input('view', 'all') // all, low, out
    const search = request.input('search')
    const locationId = request.input('location')
    const page = request.input('page', 1)
    const limit = request.input('limit', 50)

    let variants: ProductVariant[]

    if (view === 'low') {
      variants = await this.inventoryService.getLowStockVariants(storeId, 10)
    } else if (view === 'out') {
      variants = await this.inventoryService.getOutOfStockVariants(storeId)
    } else {
      const query = ProductVariant.query()
        .whereHas('product', (q) => {
          q.where('storeId', storeId).whereNull('deletedAt')
        })
        .preload('product')
        .where('trackInventory', true)
        .orderBy('inventoryQuantity', 'asc')

      if (search) {
        query.where((builder) => {
          builder
            .whereILike('sku', `%${search}%`)
            .orWhereHas('product', (q) => {
              q.whereILike('title', `%${search}%`)
            })
        })
      }

      variants = await query.limit(limit).offset((page - 1) * limit)
    }

    const locations = await this.inventoryService.getLocations(storeId)

    return inertia.render('admin/inventory/Index', {
      variants: variants.map((v) => ({
        id: v.id,
        productId: v.productId,
        productTitle: v.product?.title,
        title: v.title,
        sku: v.sku,
        inventoryQuantity: v.inventoryQuantity,
        trackInventory: v.trackInventory,
        allowBackorder: v.allowBackorder,
      })),
      locations: locations.map((l) => ({
        id: l.id,
        name: l.name,
        code: l.code,
        priority: l.priority,
      })),
      filters: { view, search, locationId },
    })
  }

  async locations({ inertia, store }: HttpContext) {
    const storeId = store.id
    const locations = await this.inventoryService.getLocations(storeId)

    return inertia.render('admin/inventory/Locations', {
      locations: locations.map((l) => ({
        id: l.id,
        name: l.name,
        code: l.code,
        address: l.address,
        isActive: l.isActive,
        isFulfillmentCenter: l.isFulfillmentCenter,
        priority: l.priority,
        createdAt: l.createdAt.toISO(),
      })),
    })
  }

  async createLocation({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const data = request.only([
      'name',
      'code',
      'address',
      'isActive',
      'isFulfillmentCenter',
      'priority',
    ])

    try {
      await this.inventoryService.createLocation({
        storeId,
        ...data,
      })

      session.flash('success', 'Location created')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async updateLocation({ params, request, response, session }: HttpContext) {
    const data = request.only([
      'name',
      'code',
      'address',
      'isActive',
      'isFulfillmentCenter',
      'priority',
    ])

    try {
      await this.inventoryService.updateLocation(params.id, data)
      session.flash('success', 'Location updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async variantInventory({ params, inertia, store }: HttpContext) {
    const variant = await ProductVariant.query()
      .where('id', params.id)
      .preload('product')
      .firstOrFail()

    const stockByLocation = await this.inventoryService.getStockByLocation(params.id)
    const movements = await this.inventoryService.getMovementHistory(params.id, { limit: 50 })

    const locations = await this.inventoryService.getLocations(store.id)

    return inertia.render('admin/inventory/Variant', {
      variant: {
        id: variant.id,
        productId: variant.productId,
        productTitle: variant.product.title,
        title: variant.title,
        sku: variant.sku,
        inventoryQuantity: variant.inventoryQuantity,
        trackInventory: variant.trackInventory,
        allowBackorder: variant.allowBackorder,
      },
      stockByLocation: stockByLocation.map((s) => ({
        ...s,
        locationName: locations.find((l) => l.id === s.locationId)?.name,
      })),
      movements: movements.all().map((m: InventoryMovement) => ({
        id: m.id,
        type: m.type,
        quantity: m.quantity,
        reason: m.reason,
        locationName: m.inventoryItem?.location?.name,
        createdAt: m.createdAt.toISO(),
      })),
      locations: locations.map((l) => ({
        id: l.id,
        name: l.name,
        code: l.code,
      })),
    })
  }

  async adjustStock({ params, request, response, session }: HttpContext) {
    const { locationId, quantity, type, reason } = request.only([
      'locationId',
      'quantity',
      'type',
      'reason',
    ])

    try {
      await this.inventoryService.adjustStock({
        variantId: params.id,
        locationId,
        quantity: Number(quantity),
        type: type || 'adjustment',
        reason,
      })

      session.flash('success', 'Stock adjusted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async setStock({ params, request, response, session }: HttpContext) {
    const { locationId, quantity } = request.only(['locationId', 'quantity'])

    try {
      await this.inventoryService.setStock(params.id, locationId, Number(quantity))
      session.flash('success', 'Stock updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async transfer({ request, response, session }: HttpContext) {
    const { variantId, fromLocationId, toLocationId, quantity, reason } = request.only([
      'variantId',
      'fromLocationId',
      'toLocationId',
      'quantity',
      'reason',
    ])

    try {
      await this.inventoryService.transferStock({
        variantId,
        fromLocationId,
        toLocationId,
        quantity: Number(quantity),
        reason,
      })

      session.flash('success', 'Stock transferred')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async bulkUpdate({ request, response, session }: HttpContext) {
    const { updates } = request.only(['updates'])

    try {
      for (const update of updates) {
        await this.inventoryService.setStock(update.variantId, update.locationId, update.quantity)
      }

      session.flash('success', 'Inventory updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }
}
