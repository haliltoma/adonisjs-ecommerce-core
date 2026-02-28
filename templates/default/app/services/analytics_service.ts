import AnalyticsEvent from '#models/analytics_event'
import DailyAnalytics from '#models/daily_analytics'
import Order from '#models/order'
import Customer from '#models/customer'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { randomUUID } from 'node:crypto'

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  totalCustomers: number
  averageOrderValue: number
  revenueChange: number
  ordersChange: number
  customersChange: number
}

interface RevenueByPeriod {
  date: string
  revenue: number
  orders: number
}

interface TopProduct {
  id: string
  title: string
  slug: string
  totalSold: number
  totalRevenue: number
}

interface DateRange {
  from: DateTime
  to: DateTime
}

export default class AnalyticsService {
  async getDashboardStats(storeId: string, period: DateRange): Promise<DashboardStats> {
    const periodDays = period.to.diff(period.from, 'days').days
    const previousPeriod: DateRange = {
      from: period.from.minus({ days: periodDays }),
      to: period.from,
    }

    const [current, previous] = await Promise.all([
      this.getPeriodStats(storeId, period),
      this.getPeriodStats(storeId, previousPeriod),
    ])

    const totalCustomers = await Customer.query()
      .where('storeId', storeId)
      .whereNull('deletedAt')
      .count('* as total')
      .first()

    const previousCustomers = await Customer.query()
      .where('storeId', storeId)
      .whereNull('deletedAt')
      .where('createdAt', '<', period.from.toISO()!)
      .count('* as total')
      .first()

    return {
      totalRevenue: current.revenue,
      totalOrders: current.orders,
      totalCustomers: Number(totalCustomers?.$extras.total || 0),
      averageOrderValue: current.orders > 0 ? current.revenue / current.orders : 0,
      revenueChange: this.calculateChange(previous.revenue, current.revenue),
      ordersChange: this.calculateChange(previous.orders, current.orders),
      customersChange: this.calculateChange(
        Number(previousCustomers?.$extras.total || 0),
        Number(totalCustomers?.$extras.total || 0)
      ),
    }
  }

  async getRevenueByPeriod(
    storeId: string,
    period: DateRange,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<RevenueByPeriod[]> {
    let dateFormat: string
    switch (groupBy) {
      case 'week':
        dateFormat = 'IYYY-IW'
        break
      case 'month':
        dateFormat = 'YYYY-MM'
        break
      default:
        dateFormat = 'YYYY-MM-DD'
    }

    const results = await Order.query()
      .where('storeId', storeId)
      .where('placedAt', '>=', period.from.toISO()!)
      .where('placedAt', '<=', period.to.toISO()!)
      .whereNotIn('status', ['cancelled', 'refunded'])
      .select(
        db.raw(`to_char(placed_at, '${dateFormat}') as date`),
        db.raw('COALESCE(SUM(grand_total), 0) as revenue'),
        db.raw('COUNT(*) as orders')
      )
      .groupByRaw(`to_char(placed_at, '${dateFormat}')`)
      .orderByRaw(`to_char(placed_at, '${dateFormat}')`)

    return results.map((r) => ({
      date: r.$extras.date,
      revenue: Number(r.$extras.revenue),
      orders: Number(r.$extras.orders),
    }))
  }

  async getTopProducts(storeId: string, period: DateRange, limit: number = 10): Promise<TopProduct[]> {
    const results = await db
      .from('order_items')
      .join('orders', 'order_items.order_id', 'orders.id')
      .join('products', 'order_items.product_id', 'products.id')
      .where('orders.store_id', storeId)
      .where('orders.placed_at', '>=', period.from.toISO()!)
      .where('orders.placed_at', '<=', period.to.toISO()!)
      .whereNotIn('orders.status', ['cancelled', 'refunded'])
      .select(
        'products.id',
        'products.title',
        'products.slug',
        db.raw('SUM(order_items.quantity) as total_sold'),
        db.raw('SUM(order_items.total_price) as total_revenue')
      )
      .groupBy('products.id', 'products.title', 'products.slug')
      .orderBy('total_revenue', 'desc')
      .limit(limit)

    return results.map((r) => ({
      id: r.id,
      title: r.title,
      slug: r.slug,
      totalSold: Number(r.total_sold),
      totalRevenue: Number(r.total_revenue),
    }))
  }

  async getConversionRate(storeId: string, period: DateRange): Promise<number> {
    const [visitors, orders] = await Promise.all([
      AnalyticsEvent.query()
        .where('storeId', storeId)
        .where('eventType', 'page_view')
        .where('createdAt', '>=', period.from.toISO()!)
        .where('createdAt', '<=', period.to.toISO()!)
        .countDistinct('sessionId as total')
        .first(),
      Order.query()
        .where('storeId', storeId)
        .where('placedAt', '>=', period.from.toISO()!)
        .where('placedAt', '<=', period.to.toISO()!)
        .whereNotIn('status', ['cancelled'])
        .count('* as total')
        .first(),
    ])

    const visitorCount = Number(visitors?.$extras.total || 0)
    const orderCount = Number(orders?.$extras.total || 0)

    return visitorCount > 0 ? (orderCount / visitorCount) * 100 : 0
  }

  async trackEvent(params: {
    storeId: string
    eventType: string
    sessionId?: string
    customerId?: string
    eventData?: Record<string, unknown>
    pageUrl?: string
    referrer?: string
    userAgent?: string
    ipAddress?: string
  }): Promise<void> {
    await AnalyticsEvent.create({
      id: randomUUID(),
      storeId: params.storeId,
      eventType: params.eventType,
      sessionId: params.sessionId || null,
      customerId: params.customerId || null,
      eventData: params.eventData || {},
      pageUrl: params.pageUrl,
      referrer: params.referrer,
      userAgent: params.userAgent,
      ipAddress: params.ipAddress,
    })
  }

  async aggregateDailyAnalytics(storeId: string, date: DateTime): Promise<void> {
    const dateStr = date.toFormat('yyyy-MM-dd')
    const startOfDay = date.startOf('day')
    const endOfDay = date.endOf('day')

    const [orderStats, visitorStats, newCustomerCount] = await Promise.all([
      Order.query()
        .where('storeId', storeId)
        .where('placedAt', '>=', startOfDay.toISO()!)
        .where('placedAt', '<=', endOfDay.toISO()!)
        .whereNotIn('status', ['cancelled', 'refunded'])
        .select(
          db.raw('COUNT(*) as total_orders'),
          db.raw('COALESCE(SUM(grand_total), 0) as total_revenue'),
          db.raw('COALESCE(AVG(grand_total), 0) as avg_order_value')
        )
        .first(),
      AnalyticsEvent.query()
        .where('storeId', storeId)
        .where('eventType', 'page_view')
        .where('createdAt', '>=', startOfDay.toISO()!)
        .where('createdAt', '<=', endOfDay.toISO()!)
        .select(
          db.raw('COUNT(*) as page_views'),
          db.raw('COUNT(DISTINCT session_id) as unique_visitors')
        )
        .first(),
      Customer.query()
        .where('storeId', storeId)
        .where('createdAt', '>=', startOfDay.toISO()!)
        .where('createdAt', '<=', endOfDay.toISO()!)
        .count('* as count')
        .first(),
    ])

    const existing = await DailyAnalytics.query()
      .where('storeId', storeId)
      .where('date', dateStr)
      .first()

    const data = {
      storeId,
      date: DateTime.fromFormat(dateStr, 'yyyy-MM-dd'),
      totalOrders: Number(orderStats?.$extras.total_orders || 0),
      totalRevenue: Number(orderStats?.$extras.total_revenue || 0),
      averageOrderValue: Number(orderStats?.$extras.avg_order_value || 0),
      pageViews: Number(visitorStats?.$extras.page_views || 0),
      uniqueVisitors: Number(visitorStats?.$extras.unique_visitors || 0),
      newCustomers: Number(newCustomerCount?.$extras.count || 0),
      returningCustomers: 0,
      conversionRate: 0,
      cartAbandonment: 0,
    }

    if (data.uniqueVisitors > 0) {
      data.conversionRate = (data.totalOrders / data.uniqueVisitors) * 100
    }

    if (existing) {
      existing.merge(data)
      await existing.save()
    } else {
      await DailyAnalytics.create(data)
    }
  }

  private async getPeriodStats(storeId: string, period: DateRange) {
    const result = await Order.query()
      .where('storeId', storeId)
      .where('placedAt', '>=', period.from.toISO()!)
      .where('placedAt', '<=', period.to.toISO()!)
      .whereNotIn('status', ['cancelled', 'refunded'])
      .select(
        db.raw('COALESCE(SUM(grand_total), 0) as revenue'),
        db.raw('COUNT(*) as orders')
      )
      .first()

    return {
      revenue: Number(result?.$extras.revenue || 0),
      orders: Number(result?.$extras.orders || 0),
    }
  }

  private calculateChange(previous: number, current: number): number {
    if (previous === 0) return current > 0 ? 100 : 0
    return ((current - previous) / previous) * 100
  }
}
