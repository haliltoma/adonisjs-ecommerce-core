import { DateTime } from 'luxon'
import ApiKey from '#models/api_key'
import { createHash, randomBytes } from 'node:crypto'

interface CreateApiKeyDTO {
  storeId: string
  title: string
  type: 'publishable' | 'secret'
  createdBy?: string
  salesChannelIds?: string[]
}

export default class ApiKeyService {
  private generateToken(type: 'publishable' | 'secret'): string {
    const prefix = type === 'publishable' ? 'pk_' : 'sk_'
    const token = randomBytes(32).toString('hex')
    return `${prefix}${token}`
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex')
  }

  async list(storeId: string) {
    return ApiKey.query()
      .where('storeId', storeId)
      .preload('creator')
      .preload('salesChannels')
      .orderBy('createdAt', 'desc')
  }

  async create(data: CreateApiKeyDTO): Promise<{ apiKey: ApiKey; rawToken: string }> {
    const rawToken = this.generateToken(data.type)
    const tokenHash = this.hashToken(rawToken)
    const last4 = rawToken.slice(-4)
    const prefix = data.type === 'publishable' ? 'pk_' : 'sk_'

    const apiKey = await ApiKey.create({
      storeId: data.storeId,
      title: data.title,
      type: data.type,
      tokenHash,
      last4,
      prefix,
      createdBy: data.createdBy || null,
      metadata: {},
    })

    if (data.salesChannelIds && data.salesChannelIds.length > 0) {
      await apiKey.related('salesChannels').attach(data.salesChannelIds)
    }

    return { apiKey, rawToken }
  }

  async revoke(storeId: string, apiKeyId: string) {
    const apiKey = await ApiKey.query()
      .where('storeId', storeId)
      .where('id', apiKeyId)
      .whereNull('revokedAt')
      .firstOrFail()

    apiKey.revokedAt = DateTime.now()
    await apiKey.save()
    return apiKey
  }

  async updateTitle(storeId: string, apiKeyId: string, title: string) {
    const apiKey = await ApiKey.query()
      .where('storeId', storeId)
      .where('id', apiKeyId)
      .firstOrFail()

    apiKey.title = title
    await apiKey.save()
    return apiKey
  }

  async updateSalesChannels(storeId: string, apiKeyId: string, salesChannelIds: string[]) {
    const apiKey = await ApiKey.query()
      .where('storeId', storeId)
      .where('id', apiKeyId)
      .firstOrFail()

    await apiKey.related('salesChannels').sync(salesChannelIds)
    return apiKey
  }

  async verifyToken(storeId: string, rawToken: string): Promise<ApiKey | null> {
    const tokenHash = this.hashToken(rawToken)

    const apiKey = await ApiKey.query()
      .where('storeId', storeId)
      .where('tokenHash', tokenHash)
      .whereNull('revokedAt')
      .first()

    if (apiKey) {
      apiKey.lastUsedAt = DateTime.now()
      await apiKey.save()
    }

    return apiKey
  }

  async delete(storeId: string, apiKeyId: string) {
    const apiKey = await ApiKey.query()
      .where('storeId', storeId)
      .where('id', apiKeyId)
      .firstOrFail()

    await apiKey.related('salesChannels').detach()
    await apiKey.delete()
  }
}
