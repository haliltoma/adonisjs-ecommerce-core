/**
 * SeoService
 *
 * Centralized service for generating structured data (JSON-LD),
 * meta tags, canonical URLs, breadcrumbs, and hreflang tags.
 */

import commerceConfig from '#config/commerce'

interface MetaTags {
  title: string
  description: string
  canonical?: string
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  ogType?: string
  twitterCard?: string
  robots?: string
  hreflang?: { locale: string; href: string }[]
}

interface BreadcrumbItem {
  name: string
  url: string
}

interface ProductSchemaInput {
  name: string
  description: string
  sku?: string | null
  price: number
  compareAtPrice?: number | null
  currency: string
  url: string
  images: string[]
  brand?: string | null
  inStock: boolean
  ratingValue?: number
  reviewCount?: number
  category?: string
}

interface OrganizationSchemaInput {
  name: string
  url: string
  logo?: string
  description?: string
  email?: string
  phone?: string
  socialLinks?: string[]
}

export default class SeoService {
  private baseUrl: string
  private seoConfig = commerceConfig.seo

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.APP_URL || 'http://localhost:3333'
  }

  /**
   * Generate meta tags for a page
   */
  generateMetaTags(params: {
    title?: string | null
    description?: string | null
    image?: string | null
    path?: string
    type?: string
    noindex?: boolean
    locales?: { code: string; path: string }[]
  }): MetaTags {
    const title = params.title
      ? `${params.title}${this.seoConfig.titleSeparator}${this.seoConfig.defaultTitle}`
      : this.seoConfig.defaultTitle

    const description = params.description || this.seoConfig.defaultDescription

    const meta: MetaTags = {
      title,
      description,
      ogTitle: params.title || this.seoConfig.defaultTitle,
      ogDescription: description,
      ogType: params.type || 'website',
      twitterCard: 'summary_large_image',
    }

    if (params.path && this.seoConfig.canonicalEnabled) {
      meta.canonical = `${this.baseUrl}${params.path}`
    }

    if (params.image) {
      meta.ogImage = params.image.startsWith('http') ? params.image : `${this.baseUrl}${params.image}`
    }

    if (params.noindex) {
      meta.robots = 'noindex, nofollow'
    }

    // Hreflang tags for multilingual support
    if (params.locales && params.locales.length > 1) {
      meta.hreflang = params.locales.map((l) => ({
        locale: l.code,
        href: `${this.baseUrl}${l.path}`,
      }))
    }

    return meta
  }

  /**
   * Generate Product JSON-LD schema
   */
  generateProductSchema(product: ProductSchemaInput): Record<string, unknown> {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      url: product.url.startsWith('http') ? product.url : `${this.baseUrl}${product.url}`,
    }

    if (product.sku) schema.sku = product.sku
    if (product.brand) {
      schema.brand = { '@type': 'Brand', name: product.brand }
    }
    if (product.images.length > 0) {
      schema.image = product.images.map((img) =>
        img.startsWith('http') ? img : `${this.baseUrl}${img}`
      )
    }
    if (product.category) {
      schema.category = product.category
    }

    // Offers
    const offers: Record<string, unknown> = {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      url: product.url.startsWith('http') ? product.url : `${this.baseUrl}${product.url}`,
    }

    schema.offers = offers

    // Aggregate rating
    if (product.ratingValue && product.reviewCount && product.reviewCount > 0) {
      schema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.ratingValue,
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1,
      }
    }

    return schema
  }

  /**
   * Generate BreadcrumbList JSON-LD schema
   */
  generateBreadcrumbSchema(items: BreadcrumbItem[]): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: item.url.startsWith('http') ? item.url : `${this.baseUrl}${item.url}`,
      })),
    }
  }

  /**
   * Generate Organization JSON-LD schema
   */
  generateOrganizationSchema(org: OrganizationSchemaInput): Record<string, unknown> {
    const schema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: org.name,
      url: org.url,
    }

    if (org.logo) schema.logo = org.logo
    if (org.description) schema.description = org.description

    if (org.email || org.phone) {
      schema.contactPoint = {
        '@type': 'ContactPoint',
        contactType: 'customer service',
        ...(org.email && { email: org.email }),
        ...(org.phone && { telephone: org.phone }),
      }
    }

    if (org.socialLinks && org.socialLinks.length > 0) {
      schema.sameAs = org.socialLinks
    }

    return schema
  }

  /**
   * Generate WebSite JSON-LD schema with search action
   */
  generateWebsiteSchema(name: string): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name,
      url: this.baseUrl,
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${this.baseUrl}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    }
  }

  /**
   * Generate canonical URL for a given path
   */
  canonicalUrl(path: string): string {
    return `${this.baseUrl}${path}`
  }

  /**
   * Generate product breadcrumbs
   */
  productBreadcrumbs(
    productTitle: string,
    productSlug: string,
    categoryName?: string,
    categorySlug?: string
  ): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [{ name: 'Home', url: '/' }]

    if (categoryName && categorySlug) {
      items.push({ name: categoryName, url: `/categories/${categorySlug}` })
    } else {
      items.push({ name: 'Products', url: '/products' })
    }

    items.push({ name: productTitle, url: `/products/${productSlug}` })
    return items
  }

  /**
   * Generate category breadcrumbs (supports nested categories)
   */
  categoryBreadcrumbs(
    ancestors: { name: string; slug: string }[]
  ): BreadcrumbItem[] {
    const items: BreadcrumbItem[] = [{ name: 'Home', url: '/' }]

    for (const category of ancestors) {
      items.push({ name: category.name, url: `/categories/${category.slug}` })
    }

    return items
  }
}
