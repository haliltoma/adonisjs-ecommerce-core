import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'blog_posts'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.uuid('store_id').notNullable().references('id').inTable('stores').onDelete('CASCADE')
      table.uuid('blog_category_id').nullable().references('id').inTable('blog_categories').onDelete('SET NULL')
      table.integer('author_id').unsigned().nullable().references('id').inTable('users').onDelete('SET NULL')
      table.string('title').notNullable()
      table.string('slug').notNullable()
      table.text('excerpt').nullable()
      table.text('content').nullable()
      table.string('featured_image_url').nullable()
      table.enum('status', ['draft', 'published', 'archived']).defaultTo('draft')
      table.jsonb('tags').defaultTo('[]')
      table.string('meta_title').nullable()
      table.text('meta_description').nullable()
      table.boolean('is_featured').defaultTo(false)
      table.integer('view_count').defaultTo(0)
      table.timestamp('published_at').nullable()
      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').notNullable()

      table.unique(['store_id', 'slug'])
      table.index(['store_id', 'status', 'published_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
