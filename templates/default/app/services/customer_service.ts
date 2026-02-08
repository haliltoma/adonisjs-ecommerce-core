import Customer from '#models/customer'
import CustomerAddress from '#models/customer_address'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { ModelPaginatorContract } from '@adonisjs/lucid/types/model'

interface CreateCustomerDTO {
  storeId: string
  email: string
  password?: string
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
  acceptsMarketing?: boolean
  tags?: string[]
  notes?: string
  groupId?: string
}

interface UpdateCustomerDTO {
  firstName?: string
  lastName?: string
  phone?: string
  avatarUrl?: string
  acceptsMarketing?: boolean
  tags?: string[]
  notes?: string
  groupId?: string
}

interface CustomerFilters {
  storeId: string
  status?: 'active' | 'disabled' | 'banned'
  groupId?: string
  acceptsMarketing?: boolean
  search?: string
  hasOrders?: boolean
  sortBy?: 'firstName' | 'email' | 'createdAt' | 'totalOrders' | 'totalSpent'
  sortDir?: 'asc' | 'desc'
  page?: number
  limit?: number
}

interface AddressDTO {
  type?: 'billing' | 'shipping' | 'both'
  isDefault?: boolean
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  phone?: string
}

export default class CustomerService {
  async create(data: CreateCustomerDTO): Promise<Customer> {
    const passwordHash = data.password ? await hash.make(data.password) : null

    return await Customer.create({
      storeId: data.storeId,
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      status: 'active',
      acceptsMarketing: data.acceptsMarketing ?? false,
      totalOrders: 0,
      totalSpent: 0,
      tags: data.tags || [],
      notes: data.notes,
      groupId: data.groupId,
      metadata: {},
    })
  }

  async update(customerId: string, data: UpdateCustomerDTO): Promise<Customer> {
    const customer = await Customer.findOrFail(customerId)

    customer.merge({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      avatarUrl: data.avatarUrl,
      acceptsMarketing: data.acceptsMarketing,
      tags: data.tags,
      notes: data.notes,
      groupId: data.groupId,
    })

    await customer.save()
    return customer
  }

  async updatePassword(customerId: string, newPassword: string): Promise<void> {
    const customer = await Customer.findOrFail(customerId)
    customer.passwordHash = await hash.make(newPassword)
    await customer.save()
  }

  async updateStatus(
    customerId: string,
    status: 'active' | 'disabled' | 'banned'
  ): Promise<Customer> {
    const customer = await Customer.findOrFail(customerId)
    customer.status = status
    await customer.save()
    return customer
  }

  async delete(customerId: string): Promise<void> {
    const customer = await Customer.findOrFail(customerId)
    customer.deletedAt = DateTime.now()
    await customer.save()
  }

  async findById(customerId: string): Promise<Customer | null> {
    return await Customer.query()
      .where('id', customerId)
      .whereNull('deletedAt')
      .preload('addresses')
      .preload('group')
      .first()
  }

  async findByEmail(storeId: string, email: string): Promise<Customer | null> {
    return await Customer.query()
      .where('storeId', storeId)
      .where('email', email.toLowerCase())
      .whereNull('deletedAt')
      .first()
  }

  async authenticate(
    storeId: string,
    email: string,
    password: string
  ): Promise<Customer | null> {
    const customer = await this.findByEmail(storeId, email)

    if (!customer || !customer.passwordHash) {
      return null
    }

    if (customer.status !== 'active') {
      return null
    }

    const isValid = await hash.verify(customer.passwordHash, password)
    return isValid ? customer : null
  }

  async list(filters: CustomerFilters): Promise<ModelPaginatorContract<Customer>> {
    const query = Customer.query().where('storeId', filters.storeId).whereNull('deletedAt')

    if (filters.status) {
      query.where('status', filters.status)
    }

    if (filters.groupId) {
      query.where('groupId', filters.groupId)
    }

    if (filters.acceptsMarketing !== undefined) {
      query.where('acceptsMarketing', filters.acceptsMarketing)
    }

    if (filters.hasOrders !== undefined) {
      if (filters.hasOrders) {
        query.where('totalOrders', '>', 0)
      } else {
        query.where('totalOrders', 0)
      }
    }

    if (filters.search) {
      query.where((builder) => {
        builder
          .whereILike('email', `%${filters.search}%`)
          .orWhereILike('firstName', `%${filters.search}%`)
          .orWhereILike('lastName', `%${filters.search}%`)
          .orWhereILike('phone', `%${filters.search}%`)
      })
    }

    const sortBy = filters.sortBy || 'createdAt'
    const sortDir = filters.sortDir || 'desc'
    query.orderBy(sortBy, sortDir)

    return await query.paginate(filters.page || 1, filters.limit || 20)
  }

  async addAddress(customerId: string, data: AddressDTO): Promise<CustomerAddress> {
    return await db.transaction(async (trx) => {
      if (data.isDefault) {
        await CustomerAddress.query({ client: trx })
          .where('customerId', customerId)
          .update({ isDefault: false })
      }

      const address = await CustomerAddress.create(
        {
          customerId,
          type: data.type || 'both',
          isDefault: data.isDefault ?? false,
          firstName: data.firstName,
          lastName: data.lastName,
          company: data.company,
          addressLine1: data.address1,
          addressLine2: data.address2,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          countryCode: data.country,
          phone: data.phone,
        },
        { client: trx }
      )

      return address
    })
  }

  async updateAddress(addressId: string, data: Partial<AddressDTO>): Promise<CustomerAddress> {
    return await db.transaction(async (trx) => {
      const address = await CustomerAddress.query({ client: trx })
        .where('id', addressId)
        .firstOrFail()

      if (data.isDefault) {
        await CustomerAddress.query({ client: trx })
          .where('customerId', address.customerId)
          .whereNot('id', addressId)
          .update({ isDefault: false })
      }

      address.merge({
        type: data.type,
        isDefault: data.isDefault,
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        addressLine1: data.address1,
        addressLine2: data.address2,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        countryCode: data.country,
        phone: data.phone,
      })

      await address.useTransaction(trx).save()
      return address
    })
  }

  async deleteAddress(addressId: string): Promise<void> {
    const address = await CustomerAddress.findOrFail(addressId)
    await address.delete()
  }

  async getAddresses(customerId: string): Promise<CustomerAddress[]> {
    return await CustomerAddress.query()
      .where('customerId', customerId)
      .orderBy('isDefault', 'desc')
      .orderBy('createdAt', 'desc')
  }

  async incrementOrderStats(customerId: string, orderTotal: number): Promise<void> {
    const customer = await Customer.findOrFail(customerId)
    customer.totalOrders += 1
    customer.totalSpent += orderTotal
    customer.lastOrderAt = DateTime.now()
    await customer.save()
  }

  async verifyEmail(customerId: string): Promise<void> {
    const customer = await Customer.findOrFail(customerId)
    customer.emailVerifiedAt = DateTime.now()
    await customer.save()
  }
}
