import User from '#models/user'
import Customer from '#models/customer'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import string from '@adonisjs/core/helpers/string'
import * as OTPAuth from 'otpauth'

interface AdminLoginDTO {
  email: string
  password: string
}

interface CustomerLoginDTO {
  storeId: string
  email: string
  password: string
}

interface CustomerRegisterDTO {
  storeId: string
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  acceptsMarketing?: boolean
}

interface PasswordResetDTO {
  token: string
  password: string
}

export default class AuthService {
  // Admin Authentication
  async authenticateAdmin(data: AdminLoginDTO): Promise<User | null> {
    const user = await User.query()
      .where('email', data.email.toLowerCase())
      .where('isActive', true)
      .first()

    if (!user) {
      return null
    }

    const isValid = await hash.verify(user.password, data.password)
    if (!isValid) {
      return null
    }

    // Update last login
    user.lastLoginAt = DateTime.now()
    await user.save()

    return user
  }

  async createAdmin(data: {
    email: string
    password: string
    firstName?: string
    lastName?: string
    roleId?: string
  }): Promise<User> {
    const passwordHash = await hash.make(data.password)

    return await User.create({
      email: data.email.toLowerCase(),
      password: passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      roleId: data.roleId,
      isActive: true,
      twoFactorEnabled: false,
    })
  }

  async updateAdminPassword(userId: number, newPassword: string): Promise<void> {
    const user = await User.findOrFail(userId)
    user.password = await hash.make(newPassword)
    await user.save()
  }

  // Customer Authentication
  async authenticateCustomer(data: CustomerLoginDTO): Promise<Customer | null> {
    const customer = await Customer.query()
      .where('storeId', data.storeId)
      .where('email', data.email.toLowerCase())
      .where('status', 'active')
      .whereNull('deletedAt')
      .first()

    if (!customer || !customer.passwordHash) {
      return null
    }

    const isValid = await hash.verify(customer.passwordHash, data.password)
    if (!isValid) {
      return null
    }

    return customer
  }

  async registerCustomer(data: CustomerRegisterDTO): Promise<Customer> {
    // Check if customer already exists
    const existing = await Customer.query()
      .where('storeId', data.storeId)
      .where('email', data.email.toLowerCase())
      .first()

    if (existing) {
      throw new Error('Email already registered')
    }

    const passwordHash = await hash.make(data.password)

    return await Customer.create({
      storeId: data.storeId,
      email: data.email.toLowerCase(),
      passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      status: 'active',
      acceptsMarketing: data.acceptsMarketing ?? false,
      totalOrders: 0,
      totalSpent: 0,
      tags: [],
      metadata: {},
    })
  }

  async updateCustomerPassword(customerId: string, newPassword: string): Promise<void> {
    const customer = await Customer.findOrFail(customerId)
    customer.passwordHash = await hash.make(newPassword)
    await customer.save()
  }

  // Password Reset
  async generatePasswordResetToken(email: string, isAdmin: boolean = false): Promise<string | null> {
    const token = string.random(64)

    if (isAdmin) {
      const user = await User.query().where('email', email.toLowerCase()).first()
      if (!user) return null
    } else {
      const customer = await Customer.query().where('email', email.toLowerCase()).first()
      if (!customer) return null
    }

    // Delete any existing tokens for this email
    await db
      .from('password_resets')
      .where('email', email.toLowerCase())
      .where('is_admin', isAdmin)
      .delete()

    // Store new token with 24h expiry
    await db.table('password_resets').insert({
      id: db.rawQuery('gen_random_uuid()').knexQuery,
      email: email.toLowerCase(),
      token,
      is_admin: isAdmin,
      expires_at: DateTime.now().plus({ hours: 24 }).toSQL(),
      created_at: DateTime.now().toSQL(),
    })

    return token
  }

  async verifyPasswordResetToken(token: string): Promise<{ email: string; isAdmin: boolean } | null> {
    const record = await db
      .from('password_resets')
      .where('token', token)
      .whereNull('used_at')
      .where('expires_at', '>', DateTime.now().toSQL()!)
      .first()

    if (!record) return null

    return { email: record.email, isAdmin: record.is_admin }
  }

  async resetPassword(data: PasswordResetDTO, _isAdmin: boolean = false): Promise<boolean> {
    const result = await this.verifyPasswordResetToken(data.token)
    if (!result) return false

    const newHash = await hash.make(data.password)

    if (result.isAdmin) {
      const user = await User.query().where('email', result.email).first()
      if (!user) return false
      user.password = newHash
      await user.save()
    } else {
      const customer = await Customer.query().where('email', result.email).first()
      if (!customer) return false
      customer.passwordHash = newHash
      await customer.save()
    }

    // Mark token as used
    await db
      .from('password_resets')
      .where('token', data.token)
      .update({ used_at: DateTime.now().toSQL() })

    return true
  }

  // Two-Factor Authentication
  private createTOTP(user: User, secret: OTPAuth.Secret): OTPAuth.TOTP {
    return new OTPAuth.TOTP({
      issuer: 'AdonisCommerce',
      label: user.email,
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret,
    })
  }

  async enableTwoFactor(userId: number): Promise<{ secret: string; qrCode: string }> {
    const user = await User.findOrFail(userId)

    const secret = new OTPAuth.Secret({ size: 20 })
    const totp = this.createTOTP(user, secret)

    user.twoFactorSecret = secret.base32
    await user.save()

    return {
      secret: secret.base32,
      qrCode: totp.toString(),
    }
  }

  async confirmTwoFactor(userId: number, code: string): Promise<boolean> {
    const user = await User.findOrFail(userId)

    if (!user.twoFactorSecret) {
      return false
    }

    const secret = OTPAuth.Secret.fromBase32(user.twoFactorSecret)
    const totp = this.createTOTP(user, secret)

    const delta = totp.validate({ token: code, window: 1 })
    const isValid = delta !== null

    if (isValid) {
      user.twoFactorEnabled = true
      await user.save()
    }

    return isValid
  }

  async disableTwoFactor(userId: number): Promise<void> {
    const user = await User.findOrFail(userId)
    user.twoFactorSecret = null
    user.twoFactorEnabled = false
    await user.save()
  }

  async verifyTwoFactor(userId: number, code: string): Promise<boolean> {
    const user = await User.findOrFail(userId)

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return true // 2FA not enabled, skip verification
    }

    const secret = OTPAuth.Secret.fromBase32(user.twoFactorSecret)
    const totp = this.createTOTP(user, secret)

    const delta = totp.validate({ token: code, window: 1 })
    return delta !== null
  }

  // Session Management
  async invalidateAllSessions(_userId: number): Promise<void> {
    // Would invalidate all sessions for the user
    // Implementation depends on session storage strategy
  }

  // Email Verification
  async generateEmailVerificationToken(_email: string): Promise<string> {
    return string.random(64)
  }

  async verifyEmail(customerId: string): Promise<void> {
    const customer = await Customer.findOrFail(customerId)
    customer.emailVerifiedAt = DateTime.now()
    await customer.save()
  }
}
