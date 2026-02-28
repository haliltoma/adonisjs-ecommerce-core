import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    // Fix reviews: add missing report_count column
    this.schema.alterTable('reviews', (table) => {
      table.integer('report_count').defaultTo(0)
    })

    // Fix search_synonyms: add missing term, is_active; rename terms to synonyms
    this.schema.alterTable('search_synonyms', (table) => {
      table.string('term').nullable()
      table.boolean('is_active').defaultTo(true)
      table.renameColumn('terms', 'synonyms')
    })

    // Fix search_logs: add missing session_id, filters, clicked_product_id
    this.schema.alterTable('search_logs', (table) => {
      table.string('session_id').nullable()
      table.jsonb('filters').nullable()
      table.uuid('clicked_product_id').nullable().references('id').inTable('products').onDelete('SET NULL')
    })

    // Fix analytics_events: add missing page_url, country, city; rename data to event_data
    this.schema.alterTable('analytics_events', (table) => {
      table.string('page_url').nullable()
      table.string('country').nullable()
      table.string('city').nullable()
      table.renameColumn('data', 'event_data')
    })

    // Fix daily_analytics: add missing columns
    this.schema.alterTable('daily_analytics', (table) => {
      table.integer('page_views').defaultTo(0)
      table.integer('unique_visitors').defaultTo(0)
      table.decimal('cart_abandonment', 5, 2).defaultTo(0)
      table.integer('returning_customers').defaultTo(0)
      table.jsonb('top_categories').defaultTo('[]')
      table.jsonb('traffic_sources').defaultTo('{}')
    })

    // Fix webhook_logs: add missing status, attempts, next_retry_at
    this.schema.alterTable('webhook_logs', (table) => {
      table.enum('status', ['pending', 'success', 'failed']).defaultTo('pending')
      table.integer('attempts').defaultTo(0)
      table.timestamp('next_retry_at').nullable()
    })

    // Fix settings: add missing type, is_public
    this.schema.alterTable('settings', (table) => {
      table.enum('type', ['string', 'number', 'boolean', 'json', 'array']).defaultTo('string')
      table.boolean('is_public').defaultTo(false)
      table.uuid('store_id').nullable().alter()
    })
  }

  async down() {
    this.schema.alterTable('reviews', (table) => {
      table.dropColumn('report_count')
    })

    this.schema.alterTable('search_synonyms', (table) => {
      table.dropColumn('term')
      table.dropColumn('is_active')
      table.renameColumn('synonyms', 'terms')
    })

    this.schema.alterTable('search_logs', (table) => {
      table.dropColumn('session_id')
      table.dropColumn('filters')
      table.dropColumn('clicked_product_id')
    })

    this.schema.alterTable('analytics_events', (table) => {
      table.dropColumn('page_url')
      table.dropColumn('country')
      table.dropColumn('city')
      table.renameColumn('event_data', 'data')
    })

    this.schema.alterTable('daily_analytics', (table) => {
      table.dropColumn('page_views')
      table.dropColumn('unique_visitors')
      table.dropColumn('cart_abandonment')
      table.dropColumn('returning_customers')
      table.dropColumn('top_categories')
      table.dropColumn('traffic_sources')
    })

    this.schema.alterTable('webhook_logs', (table) => {
      table.dropColumn('status')
      table.dropColumn('attempts')
      table.dropColumn('next_retry_at')
    })

    this.schema.alterTable('settings', (table) => {
      table.dropColumn('type')
      table.dropColumn('is_public')
    })
  }
}
