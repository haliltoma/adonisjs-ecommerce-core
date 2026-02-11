import type { HttpContext } from '@adonisjs/core/http'
import CustomerService from '#services/customer_service'
import OrderService from '#services/order_service'
import Customer from '#models/customer'
import CustomerGroup from '#models/customer_group'

export default class CustomersController {
  private customerService: CustomerService
  private orderService: OrderService

  constructor() {
    this.customerService = new CustomerService()
    this.orderService = new OrderService()
  }

  async index({ inertia, request, store }: HttpContext) {
    const storeId = store.id
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const status = request.input('status')
    const groupId = request.input('group')
    const acceptsMarketing = request.input('acceptsMarketing')
    const hasOrders = request.input('hasOrders')
    const search = request.input('search')
    const sortBy = request.input('sortBy', 'createdAt')
    const sortDir = request.input('sortDir', 'desc')

    const customers = await this.customerService.list({
      storeId,
      status,
      groupId,
      acceptsMarketing: acceptsMarketing === 'true' ? true : acceptsMarketing === 'false' ? false : undefined,
      hasOrders: hasOrders === 'true' ? true : hasOrders === 'false' ? false : undefined,
      search,
      sortBy,
      sortDir,
      page,
      limit,
    })

    const groups = await CustomerGroup.query().where('storeId', storeId)

    return inertia.render('admin/customers/Index', {
      customers: {
        data: customers.all().map((c) => ({
          id: c.id,
          email: c.email,
          firstName: c.firstName,
          lastName: c.lastName,
          fullName: c.fullName,
          phone: c.phone,
          status: c.status,
          acceptsMarketing: c.acceptsMarketing,
          totalOrders: c.totalOrders,
          totalSpent: c.totalSpent,
          lastOrderAt: c.lastOrderAt?.toISO(),
          createdAt: c.createdAt.toISO(),
        })),
        meta: customers.getMeta(),
      },
      filters: { status, groupId, acceptsMarketing, hasOrders, search, sortBy, sortDir },
      groups: groups.map((g) => ({ id: g.id, name: g.name })),
    })
  }

  async create({ inertia, store }: HttpContext) {
    const storeId = store.id
    const groups = await CustomerGroup.query().where('storeId', storeId)

    return inertia.render('admin/customers/Create', {
      groups: groups.map((g) => ({ id: g.id, name: g.name })),
    })
  }

  async store({ request, response, session, store }: HttpContext) {
    const storeId = store.id
    const raw = request.only([
      'email',
      'password',
      'firstName',
      'lastName',
      'phone',
      'acceptsMarketing',
      'tags',
      'notes',
      'groupId',
    ])

    const data = {
      ...raw,
      phone: raw.phone || undefined,
      notes: raw.notes || undefined,
      groupId: raw.groupId || undefined,
    }

    try {
      const customer = await this.customerService.create({
        storeId,
        ...data,
      })

      session.flash('success', 'Customer created successfully')
      return response.redirect().toRoute('admin.customers.show', { id: customer.id })
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async show({ params, inertia }: HttpContext) {
    const customer = await this.customerService.findById(params.id)

    if (!customer) {
      return inertia.render('admin/errors/NotFound', { resource: 'Customer' })
    }

    const orders = await this.orderService.getCustomerOrders(customer.id, 1, 10)
    const addresses = await this.customerService.getAddresses(customer.id)

    return inertia.render('admin/customers/Show', {
      customer: this.serializeCustomer(customer),
      orders: {
        data: orders.all().map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          total: o.grandTotal,
          status: o.status,
          paymentStatus: o.paymentStatus,
          createdAt: o.createdAt.toISO(),
        })),
        meta: orders.getMeta(),
      },
      addresses: addresses.map((a) => ({
        id: a.id,
        type: a.type,
        isDefault: a.isDefault,
        firstName: a.firstName,
        lastName: a.lastName,
        company: a.company,
        address1: a.addressLine1,
        address2: a.addressLine2,
        city: a.city,
        state: a.state,
        postalCode: a.postalCode,
        country: a.countryCode,
        phone: a.phone,
      })),
    })
  }

  async edit({ params, inertia, store }: HttpContext) {
    const storeId = store.id
    const customer = await this.customerService.findById(params.id)

    if (!customer) {
      return inertia.render('admin/errors/NotFound', { resource: 'Customer' })
    }

    const groups = await CustomerGroup.query().where('storeId', storeId)

    return inertia.render('admin/customers/Edit', {
      customer: this.serializeCustomer(customer),
      groups: groups.map((g) => ({ id: g.id, name: g.name })),
    })
  }

  async update({ params, request, response, session }: HttpContext) {
    const raw = request.only([
      'firstName',
      'lastName',
      'phone',
      'acceptsMarketing',
      'tags',
      'notes',
      'groupId',
    ])

    const data = {
      ...raw,
      phone: raw.phone || undefined,
      notes: raw.notes || undefined,
      groupId: raw.groupId || undefined,
    }

    try {
      await this.customerService.update(params.id, data)
      session.flash('success', 'Customer updated successfully')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async updateStatus({ params, request, response, session }: HttpContext) {
    const { status } = request.only(['status'])

    try {
      await this.customerService.updateStatus(params.id, status)
      session.flash('success', 'Customer status updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async updatePassword({ params, request, response, session }: HttpContext) {
    const { password } = request.only(['password'])

    try {
      await this.customerService.updatePassword(params.id, password)
      session.flash('success', 'Password updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async destroy({ params, response, session }: HttpContext) {
    try {
      await this.customerService.delete(params.id)
      session.flash('success', 'Customer deleted')
      return response.redirect().toRoute('admin.customers.index')
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async addAddress({ params, request, response, session }: HttpContext) {
    const data = request.only([
      'type',
      'isDefault',
      'firstName',
      'lastName',
      'company',
      'address1',
      'address2',
      'city',
      'state',
      'postalCode',
      'country',
      'phone',
    ])

    try {
      await this.customerService.addAddress(params.id, data)
      session.flash('success', 'Address added')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async updateAddress({ params, request, response, session }: HttpContext) {
    const data = request.only([
      'type',
      'isDefault',
      'firstName',
      'lastName',
      'company',
      'address1',
      'address2',
      'city',
      'state',
      'postalCode',
      'country',
      'phone',
    ])

    try {
      await this.customerService.updateAddress(params.addressId, data)
      session.flash('success', 'Address updated')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  async deleteAddress({ params, response, session }: HttpContext) {
    try {
      await this.customerService.deleteAddress(params.addressId)
      session.flash('success', 'Address deleted')
      return response.redirect().back()
    } catch (error) {
      session.flash('error', error.message)
      return response.redirect().back()
    }
  }

  private serializeCustomer(customer: Customer) {
    return {
      id: customer.id,
      storeId: customer.storeId,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: customer.fullName,
      phone: customer.phone,
      avatarUrl: customer.avatarUrl,
      status: customer.status,
      acceptsMarketing: customer.acceptsMarketing,
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
      lastOrderAt: customer.lastOrderAt?.toISO(),
      tags: customer.tags,
      notes: customer.notes,
      groupId: customer.groupId,
      group: customer.group ? { id: customer.group.id, name: customer.group.name } : null,
      emailVerifiedAt: customer.emailVerifiedAt?.toISO(),
      createdAt: customer.createdAt.toISO(),
      updatedAt: customer.updatedAt.toISO(),
    }
  }
}
