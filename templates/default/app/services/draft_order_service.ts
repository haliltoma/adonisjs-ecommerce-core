import { DateTime } from 'luxon'
import DraftOrder from '#models/draft_order'
import Order from '#models/order'
import OrderItem from '#models/order_item'
import db from '@adonisjs/lucid/services/db'

interface DraftOrderItem {
  productId: string
  variantId?: string | null
  title: string
  quantity: number
  unitPrice: number
}

interface CreateDraftOrderDTO {
  storeId: string
  customerId?: string
  email?: string
  regionId?: string
  currencyCode?: string
  items: { productId: string; variantId?: string; title: string; quantity: number; unitPrice: number }[]
  shippingAddress?: Record<string, unknown>
  billingAddress?: Record<string, unknown>
  shippingMethod?: string
  shippingTotal?: number
  note?: string
  createdBy?: string
}

interface UpdateDraftOrderDTO {
  customerId?: string | null
  email?: string | null
  items?: { productId: string; variantId?: string; title: string; quantity: number; unitPrice: number }[]
  shippingAddress?: Record<string, unknown> | null
  billingAddress?: Record<string, unknown> | null
  shippingMethod?: string | null
  shippingTotal?: number
  discountTotal?: number
  note?: string | null
}

interface ListDraftOrdersOptions {
  storeId: string
  status?: string
  search?: string
  page?: number
  limit?: number
}

export default class DraftOrderService {
  private async generateDisplayId(storeId: string): Promise<string> {
    const count = await DraftOrder.query().where('storeId', storeId).count('* as total')
    const num = Number(count[0].$extras.total || 0) + 1
    return `DRAFT-${String(num).padStart(4, '0')}`
  }

  async list(options: ListDraftOrdersOptions) {
    const { storeId, status, search, page = 1, limit = 20 } = options

    const query = DraftOrder.query()
      .where('storeId', storeId)
      .preload('customer')
      .orderBy('createdAt', 'desc')

    if (status) {
      query.where('status', status)
    }

    if (search) {
      query.where((q) => {
        q.where('displayId', 'ilike', `%${search}%`)
          .orWhere('email', 'ilike', `%${search}%`)
      })
    }

    return query.paginate(page, limit)
  }

  async findById(storeId: string, draftOrderId: string) {
    return DraftOrder.query()
      .where('storeId', storeId)
      .where('id', draftOrderId)
      .preload('customer')
      .preload('region')
      .firstOrFail()
  }

  async create(data: CreateDraftOrderDTO) {
    const displayId = await this.generateDisplayId(data.storeId)

    const subtotal = data.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
    const shippingTotal = data.shippingTotal ?? 0
    const grandTotal = subtotal + shippingTotal

    return DraftOrder.create({
      storeId: data.storeId,
      displayId,
      status: 'open',
      customerId: data.customerId ?? null,
      email: data.email ?? null,
      regionId: data.regionId ?? null,
      currencyCode: data.currencyCode ?? 'USD',
      items: data.items,
      shippingAddress: data.shippingAddress ?? null,
      billingAddress: data.billingAddress ?? null,
      shippingMethod: data.shippingMethod ?? null,
      shippingTotal,
      discountTotal: 0,
      taxTotal: 0,
      subtotal,
      grandTotal,
      note: data.note ?? null,
      createdBy: data.createdBy ?? null,
      metadata: {},
    })
  }

  async update(storeId: string, draftOrderId: string, data: UpdateDraftOrderDTO) {
    const draftOrder = await DraftOrder.query()
      .where('storeId', storeId)
      .where('id', draftOrderId)
      .where('status', 'open')
      .firstOrFail()

    if (data.items) {
      const subtotal = data.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      draftOrder.items = data.items
      draftOrder.subtotal = subtotal
      draftOrder.grandTotal = subtotal + (data.shippingTotal ?? draftOrder.shippingTotal) - (data.discountTotal ?? draftOrder.discountTotal)
    }

    draftOrder.merge({
      customerId: data.customerId !== undefined ? data.customerId : draftOrder.customerId,
      email: data.email !== undefined ? data.email : draftOrder.email,
      shippingAddress: data.shippingAddress !== undefined ? data.shippingAddress : draftOrder.shippingAddress,
      billingAddress: data.billingAddress !== undefined ? data.billingAddress : draftOrder.billingAddress,
      shippingMethod: data.shippingMethod !== undefined ? data.shippingMethod : draftOrder.shippingMethod,
      note: data.note !== undefined ? data.note : draftOrder.note,
    })

    await draftOrder.save()
    return draftOrder
  }

  async registerPayment(storeId: string, draftOrderId: string) {
    return db.transaction(async (trx) => {
      const draftOrder = await DraftOrder.query({ client: trx })
        .where('storeId', storeId)
        .where('id', draftOrderId)
        .where('status', 'open')
        .firstOrFail()

      // Generate order number
      const orderCount = await Order.query({ client: trx }).where('storeId', storeId).count('* as total')
      const orderNum = Number(orderCount[0].$extras.total || 0) + 1
      const orderNumber = `ORD-${String(orderNum).padStart(6, '0')}`

      // Create real order
      const order = await Order.create(
        {
          storeId,
          orderNumber,
          customerId: draftOrder.customerId,
          email: draftOrder.email || '',
          status: 'confirmed',
          paymentStatus: 'paid',
          fulfillmentStatus: 'unfulfilled',
          currencyCode: draftOrder.currencyCode,
          subtotal: draftOrder.subtotal,
          discountTotal: draftOrder.discountTotal,
          taxTotal: draftOrder.taxTotal,
          shippingTotal: draftOrder.shippingTotal,
          grandTotal: draftOrder.grandTotal,
          totalPaid: draftOrder.grandTotal,
          totalRefunded: 0,
          billingAddress: draftOrder.billingAddress || {},
          shippingAddress: draftOrder.shippingAddress || {},
          shippingMethod: draftOrder.shippingMethod,
          paymentMethod: 'manual',
          paymentMethodTitle: 'Manual Payment',
          regionId: draftOrder.regionId,
          notes: draftOrder.note,
          metadata: { draftOrderId: draftOrder.id },
          placedAt: DateTime.now(),
        },
        { client: trx }
      )

      // Create order items
      for (const item of draftOrder.items as unknown as DraftOrderItem[]) {
        await OrderItem.create(
          {
            orderId: order.id,
            productId: item.productId,
            variantId: item.variantId || null,
            title: item.title,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          },
          { client: trx }
        )
      }

      // Update draft order
      draftOrder.status = 'completed'
      draftOrder.orderId = order.id
      draftOrder.completedAt = DateTime.now()
      draftOrder.useTransaction(trx)
      await draftOrder.save()

      return { draftOrder, order }
    })
  }

  async delete(storeId: string, draftOrderId: string) {
    const draftOrder = await DraftOrder.query()
      .where('storeId', storeId)
      .where('id', draftOrderId)
      .where('status', 'open')
      .firstOrFail()

    await draftOrder.delete()
  }
}
