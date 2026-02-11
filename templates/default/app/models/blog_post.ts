import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import Store from './store.js'
import BlogCategory from './blog_category.js'

export default class BlogPost extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare storeId: string

  @column()
  declare blogCategoryId: string | null

  @column()
  declare authorId: string | null

  @column()
  declare title: string

  @column()
  declare slug: string

  @column()
  declare excerpt: string | null

  @column()
  declare content: string | null

  @column()
  declare featuredImageUrl: string | null

  @column()
  declare status: 'draft' | 'published' | 'archived'

  @column()
  declare tags: string[]

  @column()
  declare metaTitle: string | null

  @column()
  declare metaDescription: string | null

  @column()
  declare isFeatured: boolean

  @column()
  declare viewCount: number

  @column.dateTime()
  declare publishedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => Store)
  declare store: BelongsTo<typeof Store>

  @belongsTo(() => BlogCategory)
  declare category: BelongsTo<typeof BlogCategory>

  get readingTime(): number {
    if (!this.content) return 0
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length
    return Math.max(1, Math.ceil(wordCount / 200))
  }
}
