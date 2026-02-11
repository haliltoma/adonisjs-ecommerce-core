import { DateTime } from 'luxon'
import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbRememberMeTokensProvider } from '@adonisjs/auth/session'
import Role from './role.js'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  static rememberMeTokens = DbRememberMeTokensProvider.forModel(User)

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string | null

  @column()
  declare firstName: string | null

  @column()
  declare lastName: string | null

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare avatarUrl: string | null

  @column()
  declare roleId: string | null

  @column()
  declare isActive: boolean

  @column.dateTime()
  declare lastLoginAt: DateTime | null

  @column({ serializeAs: null })
  declare twoFactorSecret: string | null

  @column()
  declare twoFactorEnabled: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => Role)
  declare role: BelongsTo<typeof Role>

  get displayName(): string {
    if (this.firstName && this.lastName) {
      return `${this.firstName} ${this.lastName}`
    }
    return this.fullName || this.email
  }

  async hasPermission(permissionSlug: string): Promise<boolean> {
    if (!this.roleId) return false
    const role = await Role.query()
      .where('id', this.roleId)
      .preload('permissions')
      .first()
    return role?.permissions?.some((p) => p.slug === permissionSlug) ?? false
  }
}
