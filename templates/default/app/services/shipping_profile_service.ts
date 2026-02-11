import ShippingProfile from '#models/shipping_profile'
import Product from '#models/product'

export default class ShippingProfileService {
  async list(storeId: string) {
    return ShippingProfile.query()
      .where('storeId', storeId)
      .withCount('products')
      .orderBy('createdAt', 'asc')
  }

  async findById(storeId: string, profileId: string) {
    return ShippingProfile.query()
      .where('storeId', storeId)
      .where('id', profileId)
      .preload('products')
      .firstOrFail()
  }

  async create(storeId: string, data: { name: string; type?: string }) {
    return ShippingProfile.create({
      storeId,
      name: data.name,
      type: (data.type as any) || 'custom',
      metadata: {},
    })
  }

  async update(storeId: string, profileId: string, data: { name?: string; type?: string }) {
    const profile = await ShippingProfile.query()
      .where('storeId', storeId)
      .where('id', profileId)
      .firstOrFail()

    if (data.name) profile.name = data.name
    if (data.type) profile.type = data.type as any
    await profile.save()
    return profile
  }

  async delete(storeId: string, profileId: string) {
    const profile = await ShippingProfile.query()
      .where('storeId', storeId)
      .where('id', profileId)
      .firstOrFail()

    // Unassign products first
    await Product.query()
      .where('shippingProfileId', profileId)
      .update({ shippingProfileId: null })

    await profile.delete()
  }

  async assignProducts(storeId: string, profileId: string, productIds: string[]) {
    // Verify profile exists
    await ShippingProfile.query()
      .where('storeId', storeId)
      .where('id', profileId)
      .firstOrFail()

    await Product.query()
      .where('storeId', storeId)
      .whereIn('id', productIds)
      .update({ shippingProfileId: profileId })
  }

  async unassignProducts(productIds: string[]) {
    await Product.query()
      .whereIn('id', productIds)
      .update({ shippingProfileId: null })
  }

  async getAllForStore(storeId: string) {
    return ShippingProfile.query()
      .where('storeId', storeId)
      .orderBy('name', 'asc')
  }
}
