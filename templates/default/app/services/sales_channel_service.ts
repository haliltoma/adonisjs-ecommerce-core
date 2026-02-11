import SalesChannel from '#models/sales_channel'

interface CreateSalesChannelDTO {
  storeId: string
  name: string
  description?: string
  metadata?: Record<string, unknown>
}

interface UpdateSalesChannelDTO {
  name?: string
  description?: string | null
  isActive?: boolean
  metadata?: Record<string, unknown>
}

interface ListSalesChannelsOptions {
  storeId: string
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export default class SalesChannelService {
  async list(options: ListSalesChannelsOptions) {
    const { storeId, search, isActive, page = 1, limit = 20 } = options

    const query = SalesChannel.query()
      .where('storeId', storeId)
      .withCount('products')
      .orderBy('name', 'asc')

    if (search) {
      query.where('name', 'ilike', `%${search}%`)
    }

    if (isActive !== undefined) {
      query.where('isActive', isActive)
    }

    return query.paginate(page, limit)
  }

  async findById(storeId: string, channelId: string) {
    return SalesChannel.query()
      .where('storeId', storeId)
      .where('id', channelId)
      .withCount('products')
      .firstOrFail()
  }

  async create(data: CreateSalesChannelDTO) {
    return SalesChannel.create({
      storeId: data.storeId,
      name: data.name,
      description: data.description ?? null,
      metadata: data.metadata ?? {},
    })
  }

  async update(storeId: string, channelId: string, data: UpdateSalesChannelDTO) {
    const channel = await SalesChannel.query()
      .where('storeId', storeId)
      .where('id', channelId)
      .firstOrFail()

    channel.merge(data)
    await channel.save()
    return channel
  }

  async delete(storeId: string, channelId: string) {
    const channel = await SalesChannel.query()
      .where('storeId', storeId)
      .where('id', channelId)
      .firstOrFail()

    await channel.delete()
  }

  async addProducts(storeId: string, channelId: string, productIds: string[]) {
    const channel = await SalesChannel.query()
      .where('storeId', storeId)
      .where('id', channelId)
      .firstOrFail()

    await channel.related('products').attach(productIds)
    return channel
  }

  async removeProducts(storeId: string, channelId: string, productIds: string[]) {
    const channel = await SalesChannel.query()
      .where('storeId', storeId)
      .where('id', channelId)
      .firstOrFail()

    await channel.related('products').detach(productIds)
    return channel
  }

  async getProductChannels(storeId: string, productId: string) {
    return SalesChannel.query()
      .where('storeId', storeId)
      .whereHas('products', (query) => {
        query.where('products.id', productId)
      })
  }

  async getAllForStore(storeId: string) {
    return SalesChannel.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .orderBy('name', 'asc')
  }
}
