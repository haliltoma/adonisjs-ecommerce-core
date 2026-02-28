import type { HttpContext } from '@adonisjs/core/http'
import InventoryService from '#services/inventory_service'
import ImportExportService from '#services/import_export_service'
import ProductVariant from '#models/product_variant'
import type InventoryMovement from '#models/inventory_movement'

export default class InventoryController {
  private inventoryService: InventoryService
  private importExportService: ImportExportService

  constructor() {
    this.inventoryService = new InventoryService()
    this.importExportService = new ImportExportService()
  }

  async exportInventory({ inertia, store }: HttpContext) {
    const stats = await this.importExportService.getExportStats(store.id)
    return inertia.render('admin/inventory/Export', { stats })
  }

  async importInventory({ inertia }: HttpContext) {
    return inertia.render('admin/inventory/Import', {})
  }

  async processExport({ request, response, store }: HttpContext) {
    const type = request.input('type', 'inventory') as 'inventory' | 'products' | 'customers' | 'orders'
    const fields = request.input('fields', []) as string[]
    const filters = request.input('filters', {}) as Record<string, string>

    let csv: string
    let filename: string

    switch (type) {
      case 'products':
        csv = await this.importExportService.exportProducts(store.id, { fields, filters })
        filename = `products-export-${Date.now()}.csv`
        break
      case 'customers':
        csv = await this.importExportService.exportCustomers(store.id, { fields, filters })
        filename = `customers-export-${Date.now()}.csv`
        break
      case 'orders':
        csv = await this.importExportService.exportOrders(store.id, { fields, filters })
        filename = `orders-export-${Date.now()}.csv`
        break
      default:
        csv = await this.importExportService.exportInventory(store.id, { fields, filters })
        filename = `inventory-export-${Date.now()}.csv`
    }

    response.header('Content-Type', 'text/csv')
    response.header('Content-Disposition', `attachment; filename="${filename}"`)
    return response.send(csv)
  }

  async processImport({ request, response, session, store }: HttpContext) {
    const file = request.file('file', { size: '10mb', extnames: ['csv'] })

    if (!file || file.hasErrors) {
      session.flash('error', file?.errors?.[0]?.message || 'Invalid file')
      return response.redirect().back()
    }

    const type = request.input('type', 'inventory') as 'inventory' | 'products' | 'customers'
    const content = await import('node:fs/promises').then((fs) => fs.readFile(file.tmpPath!, 'utf-8'))
    const rows = this.importExportService.parseCSV(content)

    let result
    switch (type) {
      case 'products':
        result = await this.importExportService.importProducts(store.id, rows)
        break
      case 'customers':
        result = await this.importExportService.importCustomers(store.id, rows)
        break
      default:
        result = await this.importExportService.importInventory(store.id, rows)
    }

    session.flash('success', `Import complete: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`)
    if (result.errors.length > 0) {
      session.flash('importErrors', JSON.stringify(result.errors.slice(0, 10)))
    }
    return response.redirect().back()
  }

  async downloadTemplate({ request, response }: HttpContext) {
    const type = request.input('type', 'inventory') as 'inventory' | 'products' | 'customers'
    const csv = this.importExportService.generateTemplate(type)

    response.header('Content-Type', 'text/csv')
    response.header('Content-Disposition', `attachment; filename="${type}-template.csv"`)
    return response.send(csv)
  }

  /**
   * Resolve a locationId for stock operations.
   * Finds the default fulfillment center, falls back to first location,
   * or creates one if none exist.
   */
  private async resolveLocationId(
    inventoryService: InventoryService,
    storeId: string,
    locationId?: string
  ): Promise<string> {
    if (locationId) return locationId

    const defaultLocation = await inventoryService.getDefaultLocation(storeId)
    if (defaultLocation) return defaultLocation.id

    const locations = await inventoryService.getLocations(storeId)
    if (locations.length > 0) return locations[0].id

    const loc = await inventoryService.createLocation({
      storeId,
      name: 'Default Warehouse',
      code: 'DEFAULT',
      isFulfillmentCenter: true,
    })
    return loc.id
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

    // Get accurate count for pagination
    const countQuery = ProductVariant.query()
      .whereHas('product', (q) => {
        q.where('storeId', storeId).whereNull('deletedAt')
      })
      .where('trackInventory', true)

    if (search) {
      countQuery.where((builder) => {
        builder
          .whereILike('sku', `%${search}%`)
          .orWhereHas('product', (q) => {
            q.whereILike('title', `%${search}%`)
          })
      })
    }

    const totalCount =
      view === 'all'
        ? (await countQuery.count('* as total').first())?.$extras.total || 0
        : variants.length

    return inertia.render('admin/inventory/Index', {
      inventory: {
        data: variants.map((v) => ({
          id: v.id,
          productId: v.productId,
          variantId: v.id,
          productTitle: v.product?.title || '',
          variantTitle: v.title,
          sku: v.sku,
          thumbnail: null,
          quantity: v.inventoryQuantity || 0,
          trackInventory: v.trackInventory,
          allowBackorder: v.allowBackorder,
        })),
        meta: {
          total: Number(totalCount),
          perPage: Number(limit),
          currentPage: Number(page),
          lastPage: Math.max(1, Math.ceil(Number(totalCount) / Number(limit))),
        },
      },
      locations: locations.map((l) => ({
        id: l.id,
        name: l.name,
        code: l.code,
      })),
      filters: { search, locationId, lowStock: view === 'low' },
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
    const raw = request.only([
      'name',
      'code',
      'address',
      'isActive',
      'isFulfillmentCenter',
      'priority',
    ])

    const data = {
      ...raw,
      address: raw.address || undefined,
      priority: raw.priority !== '' && raw.priority != null ? Number(raw.priority) : undefined,
    }

    try {
      await this.inventoryService.createLocation({
        storeId,
        ...data,
      })

      session.flash('success', 'Location created')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async updateLocation({ params, request, response, session }: HttpContext) {
    const raw = request.only([
      'name',
      'code',
      'address',
      'isActive',
      'isFulfillmentCenter',
      'priority',
    ])

    const data = {
      ...raw,
      address: raw.address || undefined,
      priority: raw.priority !== '' && raw.priority != null ? Number(raw.priority) : undefined,
    }

    try {
      await this.inventoryService.updateLocation(params.id, data)
      session.flash('success', 'Location updated')
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
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

  async adjustStock({ params, request, response, session, store }: HttpContext) {
    let { locationId, quantity, type, reason } = request.only([
      'locationId',
      'quantity',
      'type',
      'reason',
    ])

    try {
      locationId = await this.resolveLocationId(this.inventoryService, store.id, locationId)

      const adjustQuantity = type === 'subtraction' ? -Math.abs(Number(quantity)) : Math.abs(Number(quantity))

      // Pre-check: prevent negative stock at the variant level
      if (adjustQuantity < 0) {
        const variant = await ProductVariant.find(params.id)
        const currentStock = variant?.inventoryQuantity || 0
        if (currentStock + adjustQuantity < 0) {
          session.flash('error', `Insufficient stock. Current: ${currentStock}, trying to remove: ${Math.abs(adjustQuantity)}`)
          return response.redirect().back()
        }
      }

      // Map frontend types to valid service types
      const typeMap: Record<string, 'received' | 'adjusted'> = {
        addition: 'received',
        subtraction: 'adjusted',
      }
      const mappedType = typeMap[type] || 'adjusted'

      await this.inventoryService.adjustStock({
        variantId: params.id,
        locationId,
        quantity: adjustQuantity,
        type: mappedType,
        reason: reason || (type === 'subtraction' ? 'Manual removal' : 'Manual addition'),
      })

      session.flash('success', `Stock ${type === 'subtraction' ? 'decreased' : 'increased'} by ${Math.abs(adjustQuantity)}`)
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }

  async setStock({ params, request, response, session, store }: HttpContext) {
    let { locationId, quantity } = request.only(['locationId', 'quantity'])

    try {
      locationId = await this.resolveLocationId(this.inventoryService, store.id, locationId)

      const newQuantity = Number(quantity)
      if (newQuantity < 0) {
        session.flash('error', 'Stock cannot be negative')
        return response.redirect().back()
      }

      await this.inventoryService.setStock(params.id, locationId, newQuantity)
      session.flash('success', `Stock set to ${newQuantity}`)
      return response.redirect().back()
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
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
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
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
    } catch (error: unknown) {
      session.flash('error', (error as Error).message)
      return response.redirect().back()
    }
  }
}
