import Return from '#models/return'
import ReturnItem from '#models/return_item'
import ReturnReason from '#models/return_reason'
import Order from '#models/order'
import db from '@adonisjs/lucid/services/db'

interface RequestReturnDTO {
  storeId: string
  orderId: string
  items: { orderItemId: string; quantity: number; returnReasonId?: string; note?: string }[]
  shippingMethod?: string
  note?: string
}

interface ReceiveReturnDTO {
  items: { returnItemId: string; receivedQuantity: number }[]
  receivedBy?: string
}

export default class ReturnService {
  async requestReturn(data: RequestReturnDTO) {
    return db.transaction(async (trx) => {
      const order = await Order.query({ client: trx })
        .where('storeId', data.storeId)
        .where('id', data.orderId)
        .firstOrFail()

      const returnRecord = await Return.create(
        {
          storeId: data.storeId,
          orderId: order.id,
          status: 'requested',
          shippingMethod: data.shippingMethod ?? null,
          note: data.note ?? null,
          metadata: {},
        },
        { client: trx }
      )

      await ReturnItem.createMany(
        data.items.map((item) => ({
          returnId: returnRecord.id,
          orderItemId: item.orderItemId,
          returnReasonId: item.returnReasonId ?? null,
          quantity: item.quantity,
          receivedQuantity: 0,
          note: item.note ?? null,
          metadata: {},
        })),
        { client: trx }
      )

      await returnRecord.load('items')
      return returnRecord
    })
  }

  async receiveReturn(storeId: string, returnId: string, data: ReceiveReturnDTO) {
    return db.transaction(async (trx) => {
      const returnRecord = await Return.query({ client: trx })
        .where('storeId', storeId)
        .where('id', returnId)
        .preload('items')
        .firstOrFail()

      for (const item of data.items) {
        const returnItem = returnRecord.items.find((ri) => ri.id === item.returnItemId)
        if (returnItem) {
          returnItem.receivedQuantity = item.receivedQuantity
          returnItem.useTransaction(trx)
          await returnItem.save()
        }
      }

      returnRecord.status = 'received'
      returnRecord.receivedBy = data.receivedBy ?? null
      returnRecord.receivedAt = new Date() as any
      returnRecord.useTransaction(trx)
      await returnRecord.save()

      return returnRecord
    })
  }

  async cancelReturn(storeId: string, returnId: string) {
    const returnRecord = await Return.query()
      .where('storeId', storeId)
      .where('id', returnId)
      .firstOrFail()

    returnRecord.status = 'cancelled'
    await returnRecord.save()
    return returnRecord
  }

  async completeReturn(storeId: string, returnId: string, refundAmount: number) {
    const returnRecord = await Return.query()
      .where('storeId', storeId)
      .where('id', returnId)
      .firstOrFail()

    returnRecord.status = 'completed'
    returnRecord.refundAmount = refundAmount
    await returnRecord.save()
    return returnRecord
  }

  async getByOrder(storeId: string, orderId: string) {
    return Return.query()
      .where('storeId', storeId)
      .where('orderId', orderId)
      .preload('items', (q) => {
        q.preload('orderItem')
        q.preload('reason')
      })
      .orderBy('createdAt', 'desc')
  }

  async findById(storeId: string, returnId: string) {
    return Return.query()
      .where('storeId', storeId)
      .where('id', returnId)
      .preload('items', (q) => {
        q.preload('orderItem')
        q.preload('reason')
      })
      .preload('order')
      .firstOrFail()
  }

  // Return Reasons CRUD
  async listReasons(storeId: string) {
    return ReturnReason.query()
      .where('storeId', storeId)
      .preload('children')
      .whereNull('parentId')
      .orderBy('sortOrder', 'asc')
  }

  async createReason(storeId: string, data: { value: string; label: string; description?: string; parentId?: string }) {
    return ReturnReason.create({
      storeId,
      parentId: data.parentId ?? null,
      value: data.value,
      label: data.label,
      description: data.description ?? null,
      metadata: {},
    })
  }

  async updateReason(storeId: string, reasonId: string, data: { label?: string; description?: string; sortOrder?: number }) {
    const reason = await ReturnReason.query()
      .where('storeId', storeId)
      .where('id', reasonId)
      .firstOrFail()

    reason.merge(data)
    await reason.save()
    return reason
  }

  async deleteReason(storeId: string, reasonId: string) {
    const reason = await ReturnReason.query()
      .where('storeId', storeId)
      .where('id', reasonId)
      .firstOrFail()

    await reason.delete()
  }
}
