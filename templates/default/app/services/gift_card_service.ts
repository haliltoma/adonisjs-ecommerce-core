import { DateTime } from 'luxon'
import GiftCard from '#models/gift_card'
import GiftCardTransaction from '#models/gift_card_transaction'
import db from '@adonisjs/lucid/services/db'
import { randomBytes } from 'node:crypto'

interface CreateGiftCardDTO {
  storeId: string
  value: number
  currencyCode?: string
  regionId?: string
  endsAt?: string
  metadata?: Record<string, unknown>
}

interface ListGiftCardsOptions {
  storeId: string
  search?: string
  isDisabled?: boolean
  page?: number
  limit?: number
}

export default class GiftCardService {
  private generateCode(): string {
    const bytes = randomBytes(8)
    const code = bytes.toString('hex').toUpperCase()
    return `${code.slice(0, 4)}-${code.slice(4, 8)}-${code.slice(8, 12)}-${code.slice(12, 16)}`
  }

  async list(options: ListGiftCardsOptions) {
    const { storeId, search, isDisabled, page = 1, limit = 20 } = options

    const query = GiftCard.query()
      .where('storeId', storeId)
      .preload('region')
      .orderBy('createdAt', 'desc')

    if (isDisabled !== undefined) {
      query.where('isDisabled', isDisabled)
    }

    if (search) {
      query.where('code', 'ilike', `%${search}%`)
    }

    return query.paginate(page, limit)
  }

  async findById(storeId: string, giftCardId: string) {
    return GiftCard.query()
      .where('storeId', storeId)
      .where('id', giftCardId)
      .preload('region')
      .preload('order')
      .preload('transactions', (q) => {
        q.preload('order')
        q.orderBy('createdAt', 'desc')
      })
      .firstOrFail()
  }

  async findByCode(storeId: string, code: string) {
    return GiftCard.query()
      .where('storeId', storeId)
      .where('code', code)
      .where('isDisabled', false)
      .firstOrFail()
  }

  async create(data: CreateGiftCardDTO) {
    const code = this.generateCode()

    return GiftCard.create({
      storeId: data.storeId,
      code,
      value: data.value,
      balance: data.value,
      currencyCode: data.currencyCode || 'USD',
      isDisabled: false,
      regionId: data.regionId || null,
      endsAt: data.endsAt ? DateTime.fromISO(data.endsAt) : null,
      metadata: data.metadata || {},
    })
  }

  async redeem(storeId: string, code: string, amount: number, orderId?: string) {
    return db.transaction(async (trx) => {
      const giftCard = await GiftCard.query({ client: trx })
        .where('storeId', storeId)
        .where('code', code)
        .where('isDisabled', false)
        .firstOrFail()

      if (giftCard.endsAt && new Date(giftCard.endsAt.toISO()!) < new Date()) {
        throw new Error('Gift card has expired')
      }

      if (giftCard.balance < amount) {
        throw new Error(`Insufficient balance. Available: ${giftCard.balance}`)
      }

      giftCard.balance = giftCard.balance - amount
      giftCard.useTransaction(trx)
      await giftCard.save()

      await GiftCardTransaction.create(
        {
          giftCardId: giftCard.id,
          orderId: orderId || null,
          amount: -amount,
          type: 'usage',
        },
        { client: trx }
      )

      return giftCard
    })
  }

  async adjustBalance(storeId: string, giftCardId: string, amount: number, note?: string) {
    return db.transaction(async (trx) => {
      const giftCard = await GiftCard.query({ client: trx })
        .where('storeId', storeId)
        .where('id', giftCardId)
        .firstOrFail()

      giftCard.balance = giftCard.balance + amount
      if (giftCard.balance < 0) giftCard.balance = 0
      giftCard.useTransaction(trx)
      await giftCard.save()

      await GiftCardTransaction.create(
        {
          giftCardId: giftCard.id,
          amount,
          type: 'adjustment',
          note: note || null,
        },
        { client: trx }
      )

      return giftCard
    })
  }

  async disable(storeId: string, giftCardId: string) {
    const giftCard = await GiftCard.query()
      .where('storeId', storeId)
      .where('id', giftCardId)
      .firstOrFail()

    giftCard.isDisabled = true
    await giftCard.save()
    return giftCard
  }

  async enable(storeId: string, giftCardId: string) {
    const giftCard = await GiftCard.query()
      .where('storeId', storeId)
      .where('id', giftCardId)
      .firstOrFail()

    giftCard.isDisabled = false
    await giftCard.save()
    return giftCard
  }

  async update(storeId: string, giftCardId: string, data: { regionId?: string | null; endsAt?: string | null; metadata?: Record<string, unknown> }) {
    const giftCard = await GiftCard.query()
      .where('storeId', storeId)
      .where('id', giftCardId)
      .firstOrFail()

    if (data.regionId !== undefined) giftCard.regionId = data.regionId
    if (data.endsAt !== undefined) giftCard.endsAt = data.endsAt ? DateTime.fromISO(data.endsAt) : null
    if (data.metadata) giftCard.metadata = { ...giftCard.metadata, ...data.metadata }
    await giftCard.save()
    return giftCard
  }
}
