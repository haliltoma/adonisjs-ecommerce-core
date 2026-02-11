/**
 * ImportExportService
 *
 * Handles CSV-based import and export of products, customers, orders, and inventory.
 * Uses streaming for large file processing.
 */

import Product from '#models/product'
import ProductVariant from '#models/product_variant'
import Customer from '#models/customer'
import Order from '#models/order'

interface ImportResult {
  total: number
  created: number
  updated: number
  skipped: number
  errors: ImportError[]
}

interface ImportError {
  row: number
  field?: string
  message: string
}

interface ExportOptions {
  fields?: string[]
  filters?: Record<string, string>
  format?: 'csv'
}

interface InventoryImportRow {
  sku: string
  quantity: string | number
  location?: string
}

interface ProductImportRow {
  title: string
  sku?: string
  price?: string | number
  compareAtPrice?: string | number
  description?: string
  status?: string
  type?: string
  vendor?: string
  weight?: string | number
  barcode?: string
}

interface CustomerImportRow {
  email: string
  firstName?: string
  lastName?: string
  phone?: string
  status?: string
}

export default class ImportExportService {
  /**
   * Parse CSV content into rows
   */
  parseCSV(content: string): Record<string, string>[] {
    const lines = content.trim().split('\n')
    if (lines.length < 2) return []

    const headers = this.parseCSVLine(lines[0]).map((h) => h.trim())
    const rows: Record<string, string>[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = this.parseCSVLine(lines[i])
      const row: Record<string, string> = {}
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j]?.trim() || ''
      }
      rows.push(row)
    }

    return rows
  }

  /**
   * Parse a single CSV line handling quoted fields
   */
  private parseCSVLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let inQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"'
          i++
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    result.push(current)
    return result
  }

  /**
   * Generate CSV content from data
   */
  generateCSV(headers: string[], rows: string[][]): string {
    const escapeField = (field: string): string => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`
      }
      return field
    }

    const lines = [headers.map(escapeField).join(',')]
    for (const row of rows) {
      lines.push(row.map((f) => escapeField(f ?? '')).join(','))
    }
    return lines.join('\n')
  }

  // ── Inventory Import/Export ────────────────────────────────

  async importInventory(
    storeId: string,
    rows: InventoryImportRow[]
  ): Promise<ImportResult> {
    const result: ImportResult = { total: rows.length, created: 0, updated: 0, skipped: 0, errors: [] }

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2 // +2 for 1-indexed + header row

      if (!row.sku) {
        result.errors.push({ row: rowNum, field: 'sku', message: 'SKU is required' })
        result.skipped++
        continue
      }

      const quantity = Number(row.quantity)
      if (isNaN(quantity) || quantity < 0) {
        result.errors.push({ row: rowNum, field: 'quantity', message: 'Invalid quantity' })
        result.skipped++
        continue
      }

      try {
        const variant = await ProductVariant.query()
          .where('sku', row.sku)
          .whereHas('product', (q) => q.where('storeId', storeId))
          .first()

        if (!variant) {
          result.errors.push({ row: rowNum, field: 'sku', message: `SKU "${row.sku}" not found` })
          result.skipped++
          continue
        }

        variant.inventoryQuantity = quantity
        variant.stockQuantity = quantity
        await variant.save()
        result.updated++
      } catch (error) {
        result.errors.push({ row: rowNum, message: (error as Error).message })
        result.skipped++
      }
    }

    return result
  }

  async exportInventory(
    storeId: string,
    options: ExportOptions = {}
  ): Promise<string> {
    const fields = options.fields || ['title', 'variantTitle', 'sku', 'quantity', 'price', 'barcode']
    const stockFilter = options.filters?.stock

    const query = ProductVariant.query()
      .whereHas('product', (q) => q.where('storeId', storeId).whereNull('deletedAt'))
      .preload('product')
      .where('trackInventory', true)
      .orderBy('sku', 'asc')

    if (stockFilter === 'in_stock') {
      query.where('inventoryQuantity', '>', 0)
    } else if (stockFilter === 'low_stock') {
      query.where('inventoryQuantity', '>', 0).where('inventoryQuantity', '<=', 10)
    } else if (stockFilter === 'out_of_stock') {
      query.where('inventoryQuantity', '<=', 0)
    }

    const variants = await query

    const headerMap: Record<string, string> = {
      title: 'Product Title',
      variantTitle: 'Variant Title',
      sku: 'SKU',
      quantity: 'Quantity',
      price: 'Price',
      barcode: 'Barcode',
      location: 'Location',
    }

    const headers = fields.map((f) => headerMap[f] || f)
    const rows = variants.map((v) => {
      return fields.map((f) => {
        switch (f) {
          case 'title': return v.product?.title || ''
          case 'variantTitle': return v.title || ''
          case 'sku': return v.sku || ''
          case 'quantity': return String(v.inventoryQuantity || 0)
          case 'price': return String(v.price || 0)
          case 'barcode': return v.barcode || ''
          case 'location': return ''
          default: return ''
        }
      })
    })

    return this.generateCSV(headers, rows)
  }

  // ── Product Import/Export ─────────────────────────────────

  async importProducts(
    storeId: string,
    rows: ProductImportRow[]
  ): Promise<ImportResult> {
    const result: ImportResult = { total: rows.length, created: 0, updated: 0, skipped: 0, errors: [] }
    const { randomUUID } = await import('node:crypto')

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2

      if (!row.title) {
        result.errors.push({ row: rowNum, field: 'title', message: 'Title is required' })
        result.skipped++
        continue
      }

      try {
        const slug = row.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')

        // Check if product already exists by SKU
        let product: Product | null = null
        if (row.sku) {
          product = await Product.query()
            .where('storeId', storeId)
            .where('sku', row.sku)
            .whereNull('deletedAt')
            .first()
        }

        if (product) {
          // Update existing
          product.title = row.title
          product.description = row.description || product.description
          product.status = (row.status as Product['status']) || product.status
          product.vendor = row.vendor || product.vendor
          if (row.price) product.price = Number(row.price)
          if (row.compareAtPrice) product.compareAtPrice = Number(row.compareAtPrice)
          await product.save()
          result.updated++
        } else {
          // Create new
          await Product.create({
            id: randomUUID(),
            storeId,
            title: row.title,
            slug: `${slug}-${randomUUID().slice(0, 8)}`,
            description: row.description || null,
            status: (row.status as Product['status']) || 'draft',
            type: (row.type as Product['type']) || 'simple',
            vendor: row.vendor || null,
            sku: row.sku || null,
            barcode: row.barcode || null,
            price: row.price ? Number(row.price) : 0,
            compareAtPrice: row.compareAtPrice ? Number(row.compareAtPrice) : null,
            costPrice: null,
            isTaxable: true,
            weight: row.weight ? Number(row.weight) : null,
          })
          result.created++
        }
      } catch (error) {
        result.errors.push({ row: rowNum, message: (error as Error).message })
        result.skipped++
      }
    }

    return result
  }

  async exportProducts(storeId: string, options: ExportOptions = {}): Promise<string> {
    const fields = options.fields || ['title', 'sku', 'price', 'status', 'type', 'vendor', 'description']

    const products = await Product.query()
      .where('storeId', storeId)
      .whereNull('deletedAt')
      .orderBy('title', 'asc')

    const headerMap: Record<string, string> = {
      title: 'Title',
      sku: 'SKU',
      price: 'Price',
      compareAtPrice: 'Compare At Price',
      costPrice: 'Cost Price',
      status: 'Status',
      type: 'Type',
      vendor: 'Vendor',
      description: 'Description',
      barcode: 'Barcode',
      weight: 'Weight',
    }

    const headers = fields.map((f) => headerMap[f] || f)
    const rows = products.map((p) => {
      return fields.map((f) => {
        switch (f) {
          case 'title': return p.title || ''
          case 'sku': return p.sku || ''
          case 'price': return String(p.price ?? 0)
          case 'compareAtPrice': return String(p.compareAtPrice ?? '')
          case 'costPrice': return String(p.costPrice ?? '')
          case 'status': return p.status || ''
          case 'type': return p.type || ''
          case 'vendor': return p.vendor || ''
          case 'description': return p.description || ''
          case 'barcode': return p.barcode || ''
          case 'weight': return String(p.weight ?? '')
          default: return ''
        }
      })
    })

    return this.generateCSV(headers, rows)
  }

  // ── Customer Import/Export ────────────────────────────────

  async importCustomers(
    storeId: string,
    rows: CustomerImportRow[]
  ): Promise<ImportResult> {
    const result: ImportResult = { total: rows.length, created: 0, updated: 0, skipped: 0, errors: [] }
    const { randomUUID } = await import('node:crypto')

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      const rowNum = i + 2

      if (!row.email) {
        result.errors.push({ row: rowNum, field: 'email', message: 'Email is required' })
        result.skipped++
        continue
      }

      try {
        let customer = await Customer.query()
          .where('storeId', storeId)
          .where('email', row.email)
          .whereNull('deletedAt')
          .first()

        if (customer) {
          if (row.firstName) customer.firstName = row.firstName
          if (row.lastName) customer.lastName = row.lastName
          if (row.phone) customer.phone = row.phone
          await customer.save()
          result.updated++
        } else {
          await Customer.create({
            id: randomUUID(),
            storeId,
            email: row.email,
            firstName: row.firstName || '',
            lastName: row.lastName || '',
            phone: row.phone || null,
            status: (row.status as Customer['status']) || 'active',
          })
          result.created++
        }
      } catch (error) {
        result.errors.push({ row: rowNum, message: (error as Error).message })
        result.skipped++
      }
    }

    return result
  }

  async exportCustomers(storeId: string, options: ExportOptions = {}): Promise<string> {
    const fields = options.fields || ['email', 'firstName', 'lastName', 'phone', 'status']

    const customers = await Customer.query()
      .where('storeId', storeId)
      .whereNull('deletedAt')
      .orderBy('email', 'asc')

    const headerMap: Record<string, string> = {
      email: 'Email',
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone',
      status: 'Status',
    }

    const headers = fields.map((f) => headerMap[f] || f)
    const rows = customers.map((c) => {
      return fields.map((f) => {
        switch (f) {
          case 'email': return c.email || ''
          case 'firstName': return c.firstName || ''
          case 'lastName': return c.lastName || ''
          case 'phone': return c.phone || ''
          case 'status': return c.status || ''
          default: return ''
        }
      })
    })

    return this.generateCSV(headers, rows)
  }

  // ── Order Export ──────────────────────────────────────────

  async exportOrders(storeId: string, options: ExportOptions = {}): Promise<string> {
    const fields = options.fields || [
      'orderNumber', 'email', 'status', 'paymentStatus',
      'subtotal', 'grandTotal', 'currencyCode', 'placedAt',
    ]

    const query = Order.query()
      .where('storeId', storeId)
      .orderBy('createdAt', 'desc')

    if (options.filters?.status) {
      query.where('status', options.filters.status)
    }

    const orders = await query

    const headerMap: Record<string, string> = {
      orderNumber: 'Order Number',
      email: 'Email',
      status: 'Status',
      paymentStatus: 'Payment Status',
      fulfillmentStatus: 'Fulfillment Status',
      subtotal: 'Subtotal',
      discountTotal: 'Discount',
      shippingTotal: 'Shipping',
      taxTotal: 'Tax',
      grandTotal: 'Grand Total',
      currencyCode: 'Currency',
      placedAt: 'Placed At',
    }

    const headers = fields.map((f) => headerMap[f] || f)
    const rows = orders.map((o) => {
      return fields.map((f) => {
        switch (f) {
          case 'orderNumber': return o.orderNumber || ''
          case 'email': return o.email || ''
          case 'status': return o.status || ''
          case 'paymentStatus': return o.paymentStatus || ''
          case 'fulfillmentStatus': return o.fulfillmentStatus || ''
          case 'subtotal': return String(o.subtotal ?? 0)
          case 'discountTotal': return String(o.discountTotal ?? 0)
          case 'shippingTotal': return String(o.shippingTotal ?? 0)
          case 'taxTotal': return String(o.taxTotal ?? 0)
          case 'grandTotal': return String(o.grandTotal ?? 0)
          case 'currencyCode': return o.currencyCode || ''
          case 'placedAt': return o.placedAt?.toISO() || ''
          default: return ''
        }
      })
    })

    return this.generateCSV(headers, rows)
  }

  // ── Template Generation ───────────────────────────────────

  generateTemplate(type: 'inventory' | 'products' | 'customers'): string {
    switch (type) {
      case 'inventory':
        return this.generateCSV(['SKU', 'Quantity', 'Location'], [['SKU-001', '100', 'Default Warehouse']])
      case 'products':
        return this.generateCSV(
          ['Title', 'SKU', 'Price', 'Compare At Price', 'Description', 'Status', 'Type', 'Vendor', 'Weight', 'Barcode'],
          [['Example Product', 'SKU-001', '29.99', '39.99', 'A great product', 'draft', 'simple', 'My Brand', '0.5', '']]
        )
      case 'customers':
        return this.generateCSV(
          ['Email', 'First Name', 'Last Name', 'Phone', 'Status'],
          [['customer@example.com', 'John', 'Doe', '+1234567890', 'active']]
        )
    }
  }

  // ── Summary Statistics ────────────────────────────────────

  async getExportStats(storeId: string) {
    const [productCount, customerCount, orderCount, variantCount] = await Promise.all([
      Product.query().where('storeId', storeId).whereNull('deletedAt').count('* as total').first(),
      Customer.query().where('storeId', storeId).whereNull('deletedAt').count('* as total').first(),
      Order.query().where('storeId', storeId).count('* as total').first(),
      ProductVariant.query()
        .whereHas('product', (q) => q.where('storeId', storeId).whereNull('deletedAt'))
        .count('* as total')
        .first(),
    ])

    return {
      products: Number(productCount?.$extras.total || 0),
      customers: Number(customerCount?.$extras.total || 0),
      orders: Number(orderCount?.$extras.total || 0),
      variants: Number(variantCount?.$extras.total || 0),
    }
  }
}
