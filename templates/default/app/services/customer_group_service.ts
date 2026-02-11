import CustomerGroup from '#models/customer_group'
import Customer from '#models/customer'
import string from '@adonisjs/core/helpers/string'

interface CreateCustomerGroupDTO {
  storeId: string
  name: string
  description?: string
  discountPercentage?: number
  conditions?: Record<string, unknown>
}

interface UpdateCustomerGroupDTO {
  name?: string
  slug?: string
  description?: string | null
  discountPercentage?: number
  isActive?: boolean
  isDefault?: boolean
  conditions?: Record<string, unknown>
}

interface ListCustomerGroupsOptions {
  storeId: string
  search?: string
  isActive?: boolean
  page?: number
  limit?: number
}

export default class CustomerGroupService {
  async list(options: ListCustomerGroupsOptions) {
    const { storeId, search, isActive, page = 1, limit = 20 } = options

    const query = CustomerGroup.query()
      .where('storeId', storeId)
      .withCount('customers')
      .orderBy('name', 'asc')

    if (search) {
      query.where('name', 'ilike', `%${search}%`)
    }

    if (isActive !== undefined) {
      query.where('isActive', isActive)
    }

    return query.paginate(page, limit)
  }

  async findById(storeId: string, groupId: string) {
    return CustomerGroup.query()
      .where('storeId', storeId)
      .where('id', groupId)
      .withCount('customers')
      .firstOrFail()
  }

  async create(data: CreateCustomerGroupDTO) {
    const slug = string.slug(data.name, { lower: true })

    return CustomerGroup.create({
      storeId: data.storeId,
      name: data.name,
      slug,
      description: data.description ?? null,
      discountPercentage: data.discountPercentage ?? 0,
      conditions: data.conditions ?? {},
      isActive: true,
      isDefault: false,
    })
  }

  async update(storeId: string, groupId: string, data: UpdateCustomerGroupDTO) {
    const group = await CustomerGroup.query()
      .where('storeId', storeId)
      .where('id', groupId)
      .firstOrFail()

    if (data.name && !data.slug) {
      data.slug = string.slug(data.name, { lower: true })
    }

    group.merge(data)
    await group.save()
    return group
  }

  async delete(storeId: string, groupId: string) {
    const group = await CustomerGroup.query()
      .where('storeId', storeId)
      .where('id', groupId)
      .firstOrFail()

    // Unassign all customers from this group before deleting
    await Customer.query()
      .where('storeId', storeId)
      .where('groupId', groupId)
      .update({ groupId: null })

    await group.delete()
  }

  async addCustomers(storeId: string, groupId: string, customerIds: string[]) {
    await CustomerGroup.query()
      .where('storeId', storeId)
      .where('id', groupId)
      .firstOrFail()

    await Customer.query()
      .where('storeId', storeId)
      .whereIn('id', customerIds)
      .update({ groupId })
  }

  async removeCustomers(storeId: string, groupId: string, customerIds: string[]) {
    await CustomerGroup.query()
      .where('storeId', storeId)
      .where('id', groupId)
      .firstOrFail()

    await Customer.query()
      .where('storeId', storeId)
      .where('groupId', groupId)
      .whereIn('id', customerIds)
      .update({ groupId: null })
  }

  async getGroupCustomers(storeId: string, groupId: string, page = 1, limit = 20) {
    return Customer.query()
      .where('storeId', storeId)
      .where('groupId', groupId)
      .whereNull('deletedAt')
      .orderBy('firstName', 'asc')
      .paginate(page, limit)
  }

  async getAllForStore(storeId: string) {
    return CustomerGroup.query()
      .where('storeId', storeId)
      .where('isActive', true)
      .orderBy('name', 'asc')
  }
}
