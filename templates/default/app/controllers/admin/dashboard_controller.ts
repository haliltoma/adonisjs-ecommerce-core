import type { HttpContext } from '@adonisjs/core/http'
import Order from '#models/order'
import Customer from '#models/customer'
import Product from '#models/product'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

export default class DashboardController {
  async index({ inertia, admin, store }: HttpContext) {
    const user = admin!

    const storeId = store.id

    // Date ranges
    const today = DateTime.now().startOf('day')
    const yesterday = today.minus({ days: 1 })
    const thisWeek = today.minus({ days: 7 })
    const thisMonth = today.minus({ days: 30 })

    // Today's stats
    const todayStats = await this.getDateRangeStats(storeId, today, DateTime.now())
    const yesterdayStats = await this.getDateRangeStats(storeId, yesterday, today)

    // Weekly stats
    const weeklyStats = await this.getDateRangeStats(storeId, thisWeek, DateTime.now())

    // Monthly stats
    const monthlyStats = await this.getDateRangeStats(storeId, thisMonth, DateTime.now())

    // Recent orders
    const recentOrders = await Order.query()
      .where('storeId', storeId)
      .preload('customer')
      .orderBy('createdAt', 'desc')
      .limit(10)

    // Low stock products
    const lowStockProducts = await Product.query()
      .where('storeId', storeId)
      .whereHas('variants', (query) => {
        query.where('trackInventory', true).where('inventoryQuantity', '<=', 10)
      })
      .preload('variants')
      .limit(10)

    // Top selling products (this month)
    const topProducts = await db
      .from('order_items')
      .join('orders', 'order_items.order_id', 'orders.id')
      .join('products', 'order_items.product_id', 'products.id')
      .where('orders.store_id', storeId)
      .where('orders.created_at', '>=', thisMonth.toSQL()!)
      .select('products.id', 'products.title')
      .sum('order_items.quantity as total_sold')
      .sum('order_items.total_price as total_revenue')
      .groupBy('products.id', 'products.title')
      .orderBy('total_sold', 'desc')
      .limit(5)

    // Revenue chart data (last 30 days)
    const revenueChart = await db
      .from('orders')
      .where('store_id', storeId)
      .where('created_at', '>=', thisMonth.toSQL()!)
      .where('payment_status', 'paid')
      .select(db.raw("DATE(created_at) as date"))
      .sum('grand_total as revenue')
      .count('* as orders')
      .groupByRaw('DATE(created_at)')
      .orderBy('date', 'asc')

    return inertia.render('admin/Dashboard', {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role?.name,
      },
      stats: {
        today: todayStats,
        yesterday: yesterdayStats,
        weekly: weeklyStats,
        monthly: monthlyStats,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer?.fullName || order.email,
        total: order.grandTotal,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt.toISO(),
      })),
      lowStockProducts: lowStockProducts.map((product) => ({
        id: product.id,
        title: product.title,
        variants: product.variants
          .filter((v) => v.trackInventory && v.inventoryQuantity <= 10)
          .map((v) => ({
            id: v.id,
            title: v.title,
            sku: v.sku,
            quantity: v.inventoryQuantity,
          })),
      })),
      topProducts,
      revenueChart,
    })
  }

  private async getDateRangeStats(storeId: string, from: DateTime, to: DateTime) {
    const orders = await Order.query()
      .where('storeId', storeId)
      .where('createdAt', '>=', from.toSQL()!)
      .where('createdAt', '<', to.toSQL()!)

    const paidOrders = orders.filter((o) => o.paymentStatus === 'paid')

    return {
      orderCount: orders.length,
      revenue: paidOrders.reduce((sum, o) => sum + o.grandTotal, 0),
      averageOrderValue:
        paidOrders.length > 0
          ? paidOrders.reduce((sum, o) => sum + o.grandTotal, 0) / paidOrders.length
          : 0,
    }
  }

  async analyticsSales({ inertia }: HttpContext) {
    return inertia.render('admin/analytics/Sales', { period: '30d', data: [] })
  }

  async analyticsProducts({ inertia }: HttpContext) {
    return inertia.render('admin/analytics/Products', { period: '30d', products: [] })
  }

  async analyticsCustomers({ inertia }: HttpContext) {
    return inertia.render('admin/analytics/Customers', { period: '30d', customers: [] })
  }

  async analytics({ inertia, request, store }: HttpContext) {
    const storeId = store.id
    const { period = '30d' } = request.qs()

    let dateFrom: DateTime
    const dateTo = DateTime.now()

    switch (period) {
      case '7d':
        dateFrom = dateTo.minus({ days: 7 })
        break
      case '30d':
        dateFrom = dateTo.minus({ days: 30 })
        break
      case '90d':
        dateFrom = dateTo.minus({ days: 90 })
        break
      case '1y':
        dateFrom = dateTo.minus({ years: 1 })
        break
      default:
        dateFrom = dateTo.minus({ days: 30 })
    }

    // Sales analytics
    const salesByDay = await db
      .from('orders')
      .where('store_id', storeId)
      .where('created_at', '>=', dateFrom.toSQL()!)
      .where('payment_status', 'paid')
      .select(db.raw("DATE(created_at) as date"))
      .sum('grand_total as revenue')
      .count('* as orders')
      .groupByRaw('DATE(created_at)')
      .orderBy('date', 'asc')

    // Customer analytics
    const newCustomers = await Customer.query()
      .where('storeId', storeId)
      .where('createdAt', '>=', dateFrom.toSQL()!)
      .count('* as total')

    const returningCustomers = await db
      .from('orders')
      .where('store_id', storeId)
      .where('created_at', '>=', dateFrom.toSQL()!)
      .whereNotNull('customer_id')
      .select('customer_id')
      .count('* as order_count')
      .groupBy('customer_id')
      .havingRaw('COUNT(*) > 1')

    // Product analytics
    const topCategories = await db
      .from('order_items')
      .join('orders', 'order_items.order_id', 'orders.id')
      .join('product_categories', 'order_items.product_id', 'product_categories.product_id')
      .join('categories', 'product_categories.category_id', 'categories.id')
      .where('orders.store_id', storeId)
      .where('orders.created_at', '>=', dateFrom.toSQL()!)
      .select('categories.name')
      .sum('order_items.total_price as revenue')
      .groupBy('categories.name')
      .orderBy('revenue', 'desc')
      .limit(10)

    return inertia.render('admin/Analytics', {
      period,
      salesByDay,
      newCustomers: Number(newCustomers[0]?.$extras.total || 0),
      returningCustomers,
      topCategories,
    })
  }
}
