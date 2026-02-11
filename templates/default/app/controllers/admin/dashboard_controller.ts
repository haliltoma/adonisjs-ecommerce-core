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

  async analyticsSales({ inertia, request, store }: HttpContext) {
    const storeId = store.id
    const { period = '30d' } = request.qs()
    const dateFrom = this.getDateFrom(period)

    const salesByDay = await db
      .from('orders')
      .where('store_id', storeId)
      .where('created_at', '>=', dateFrom.toSQL()!)
      .where('payment_status', 'paid')
      .select(db.raw("DATE(created_at) as date"))
      .sum('grand_total as revenue')
      .sum('discount_total as discounts')
      .count('* as orders')
      .groupByRaw('DATE(created_at)')
      .orderBy('date', 'asc')

    const totalRevenue = salesByDay.reduce((s, d) => s + Number(d.revenue || 0), 0)
    const totalOrders = salesByDay.reduce((s, d) => s + Number(d.orders || 0), 0)
    const totalDiscounts = salesByDay.reduce((s, d) => s + Number(d.discounts || 0), 0)

    // Payment methods breakdown
    const paymentMethods = await db
      .from('orders')
      .where('store_id', storeId)
      .where('created_at', '>=', dateFrom.toSQL()!)
      .where('payment_status', 'paid')
      .select('payment_method as method')
      .count('* as count')
      .sum('grand_total as revenue')
      .groupBy('payment_method')
      .orderBy('count', 'desc')

    return inertia.render('admin/analytics/Sales', {
      period,
      data: salesByDay,
      summary: {
        totalRevenue,
        totalOrders,
        totalDiscounts,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      },
      paymentMethods: paymentMethods.map((pm) => ({
        method: pm.method || 'Unknown',
        count: Number(pm.count),
        revenue: Number(pm.revenue || 0),
      })),
    })
  }

  async analyticsProducts({ inertia, request, store }: HttpContext) {
    const storeId = store.id
    const { period = '30d' } = request.qs()
    const dateFrom = this.getDateFrom(period)

    const products = await db
      .from('order_items')
      .join('orders', 'order_items.order_id', 'orders.id')
      .join('products', 'order_items.product_id', 'products.id')
      .where('orders.store_id', storeId)
      .where('orders.created_at', '>=', dateFrom.toSQL()!)
      .where('orders.payment_status', 'paid')
      .select('products.id', 'products.title', 'products.slug')
      .sum('order_items.quantity as total_sold')
      .sum('order_items.total_price as total_revenue')
      .countDistinct('orders.id as order_count')
      .groupBy('products.id', 'products.title', 'products.slug')
      .orderBy('total_revenue', 'desc')
      .limit(50)

    // Category performance
    const categoryPerformance = await db
      .from('order_items')
      .join('orders', 'order_items.order_id', 'orders.id')
      .join('product_categories', 'order_items.product_id', 'product_categories.product_id')
      .join('categories', 'product_categories.category_id', 'categories.id')
      .where('orders.store_id', storeId)
      .where('orders.created_at', '>=', dateFrom.toSQL()!)
      .where('orders.payment_status', 'paid')
      .select('categories.name as category')
      .sum('order_items.quantity as units_sold')
      .sum('order_items.total_price as revenue')
      .groupBy('categories.name')
      .orderBy('revenue', 'desc')
      .limit(10)

    const totalSold = products.reduce((s, p) => s + Number(p.total_sold || 0), 0)
    const totalRevenue = products.reduce((s, p) => s + Number(p.total_revenue || 0), 0)

    return inertia.render('admin/analytics/Products', {
      period,
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        unitsSold: Number(p.total_sold || 0),
        revenue: Number(p.total_revenue || 0),
        orderCount: Number(p.order_count || 0),
      })),
      categoryPerformance: categoryPerformance.map((c) => ({
        category: c.category,
        unitsSold: Number(c.units_sold || 0),
        revenue: Number(c.revenue || 0),
      })),
      summary: {
        totalSold,
        totalRevenue,
      },
    })
  }

  async analyticsCustomers({ inertia, request, store }: HttpContext) {
    const storeId = store.id
    const { period = '30d' } = request.qs()
    const dateFrom = this.getDateFrom(period)

    const totalCustomers = await Customer.query()
      .where('storeId', storeId)
      .count('* as total')

    const newCustomers = await Customer.query()
      .where('storeId', storeId)
      .where('createdAt', '>=', dateFrom.toSQL()!)
      .count('* as total')

    const topCustomers = await db
      .from('orders')
      .join('customers', 'orders.customer_id', 'customers.id')
      .where('orders.store_id', storeId)
      .where('orders.created_at', '>=', dateFrom.toSQL()!)
      .where('orders.payment_status', 'paid')
      .select(
        'customers.id',
        'customers.first_name',
        'customers.last_name',
        'customers.email',
        'customers.created_at as joined_at'
      )
      .sum('orders.grand_total as total_spent')
      .count('* as order_count')
      .max('orders.created_at as last_order_at')
      .groupBy('customers.id', 'customers.first_name', 'customers.last_name', 'customers.email', 'customers.created_at')
      .orderBy('total_spent', 'desc')
      .limit(20)

    const returningCustomers = await db
      .from('orders')
      .where('store_id', storeId)
      .where('created_at', '>=', dateFrom.toSQL()!)
      .whereNotNull('customer_id')
      .select('customer_id')
      .count('* as order_count')
      .groupBy('customer_id')
      .havingRaw('COUNT(*) > 1')

    const totalSpentAll = topCustomers.reduce((s, c) => s + Number(c.total_spent || 0), 0)
    const totalCustomerCount = Number(totalCustomers[0]?.$extras.total || 0)

    return inertia.render('admin/analytics/Customers', {
      period,
      customers: topCustomers.map((c) => ({
        id: c.id,
        name: `${c.first_name} ${c.last_name}`.trim() || c.email,
        email: c.email,
        orderCount: Number(c.order_count || 0),
        totalSpent: Number(c.total_spent || 0),
        avgOrder: Number(c.order_count) > 0 ? Number(c.total_spent) / Number(c.order_count) : 0,
        lastOrder: c.last_order_at,
        joinedAt: c.joined_at,
      })),
      summary: {
        totalCustomers: totalCustomerCount,
        newCustomersCount: Number(newCustomers[0]?.$extras.total || 0),
        returningCustomersCount: returningCustomers.length,
        avgLifetimeValue: totalCustomerCount > 0 ? totalSpentAll / topCustomers.length : 0,
      },
    })
  }

  private getDateFrom(period: string): DateTime {
    const now = DateTime.now()
    switch (period) {
      case '7d': return now.minus({ days: 7 })
      case '30d': return now.minus({ days: 30 })
      case '90d': return now.minus({ days: 90 })
      case '1y': return now.minus({ years: 1 })
      default: return now.minus({ days: 30 })
    }
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
