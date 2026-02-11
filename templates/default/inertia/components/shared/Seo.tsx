import { Head } from '@inertiajs/react'

interface SeoProps {
  title: string
  description?: string
  keywords?: string[]
  canonical?: string
  noIndex?: boolean
  noFollow?: boolean
  // Open Graph
  ogType?: 'website' | 'article' | 'product' | 'profile'
  ogImage?: string
  ogImageAlt?: string
  ogUrl?: string
  ogSiteName?: string
  // Twitter
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player'
  twitterSite?: string
  twitterCreator?: string
  // Product specific (for JSON-LD)
  product?: {
    name: string
    description?: string
    image?: string
    images?: string[]
    sku?: string
    brand?: string
    price: number
    priceCurrency?: string
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
    condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition'
    url?: string
    rating?: {
      value: number
      count: number
    }
    reviews?: Array<{
      author: string
      datePublished: string
      reviewBody?: string
      name?: string
      ratingValue: number
    }>
  }
  // Breadcrumb for JSON-LD
  breadcrumbs?: Array<{
    name: string
    url: string
  }>
  // Organization info
  organization?: {
    name: string
    url: string
    logo?: string
    sameAs?: string[]
    contactPoint?: {
      telephone?: string
      email?: string
      contactType?: string
    }
  }
  // Additional JSON-LD schemas
  jsonLd?: object[]
}

export default function Seo({
  title,
  description = '',
  keywords = [],
  canonical,
  noIndex = false,
  noFollow = false,
  ogType = 'website',
  ogImage,
  ogImageAlt,
  ogUrl,
  ogSiteName = 'AdonisCommerce',
  twitterCard = 'summary_large_image',
  twitterSite,
  twitterCreator,
  product,
  breadcrumbs,
  organization,
  jsonLd,
}: SeoProps) {
  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
  ].join(', ')

  const structuredData: object[] = []

  // Organization schema
  if (organization) {
    const orgSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: organization.name,
      url: organization.url,
      logo: organization.logo,
      sameAs: organization.sameAs || [],
    }
    if (organization.contactPoint) {
      orgSchema.contactPoint = {
        '@type': 'ContactPoint',
        ...organization.contactPoint,
      }
    }
    structuredData.push(orgSchema)
  }

  // Product schema
  if (product) {
    const productSchema: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      sku: product.sku,
    }

    // Multiple images
    if (product.images && product.images.length > 0) {
      productSchema.image = product.images
    } else if (product.image) {
      productSchema.image = product.image
    }

    // Brand
    if (product.brand) {
      productSchema.brand = {
        '@type': 'Brand',
        name: product.brand,
      }
    }

    // Offers
    const offer: Record<string, unknown> = {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.priceCurrency || 'USD',
      availability: `https://schema.org/${product.availability || 'InStock'}`,
      itemCondition: `https://schema.org/${product.condition || 'NewCondition'}`,
    }
    if (product.url) {
      offer.url = product.url
    }
    if (organization) {
      offer.seller = {
        '@type': 'Organization',
        name: organization.name,
      }
    }
    productSchema.offers = offer

    // AggregateRating
    if (product.rating && product.rating.count > 0) {
      productSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating.value,
        reviewCount: product.rating.count,
        bestRating: 5,
        worstRating: 1,
      }
    }

    // Individual reviews (up to 5)
    if (product.reviews && product.reviews.length > 0) {
      productSchema.review = product.reviews.slice(0, 5).map((r) => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.author },
        datePublished: r.datePublished,
        reviewBody: r.reviewBody,
        name: r.name,
        reviewRating: {
          '@type': 'Rating',
          ratingValue: r.ratingValue,
          bestRating: 5,
          worstRating: 1,
        },
      }))
    }

    structuredData.push(productSchema)
  }

  // Breadcrumb schema
  if (breadcrumbs && breadcrumbs.length > 0) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: breadcrumbs.map((crumb, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: crumb.name,
        item: crumb.url,
      })),
    })
  }

  // Additional JSON-LD schemas passed in
  if (jsonLd) {
    structuredData.push(...jsonLd)
  }

  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta head-key="description" name="description" content={description} />
      {keywords.length > 0 && (
        <meta head-key="keywords" name="keywords" content={keywords.join(', ')} />
      )}

      {/* Robots */}
      <meta head-key="robots" name="robots" content={robotsContent} />
      <meta head-key="googlebot" name="googlebot" content={robotsContent} />

      {/* Canonical */}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      <meta head-key="og:type" property="og:type" content={ogType} />
      <meta head-key="og:title" property="og:title" content={title} />
      <meta head-key="og:description" property="og:description" content={description} />
      <meta head-key="og:site_name" property="og:site_name" content={ogSiteName} />
      {ogUrl && <meta head-key="og:url" property="og:url" content={ogUrl} />}
      {ogImage && (
        <>
          <meta head-key="og:image" property="og:image" content={ogImage} />
          <meta head-key="og:image:width" property="og:image:width" content="1200" />
          <meta head-key="og:image:height" property="og:image:height" content="630" />
          {ogImageAlt && <meta head-key="og:image:alt" property="og:image:alt" content={ogImageAlt} />}
        </>
      )}

      {/* Twitter */}
      <meta head-key="twitter:card" name="twitter:card" content={twitterCard} />
      <meta head-key="twitter:title" name="twitter:title" content={title} />
      <meta head-key="twitter:description" name="twitter:description" content={description} />
      {twitterSite && <meta head-key="twitter:site" name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta head-key="twitter:creator" name="twitter:creator" content={twitterCreator} />}
      {ogImage && <meta head-key="twitter:image" name="twitter:image" content={ogImage} />}

      {/* Additional SEO Tags */}
      <meta head-key="format-detection" name="format-detection" content="telephone=no" />
      <meta head-key="theme-color" name="theme-color" content="#1c1917" />

      {/* Structured Data / JSON-LD */}
      {structuredData.map((data, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
      ))}
    </Head>
  )
}

// ── Helper for Product pages ──────────────────────────────

export function ProductSeo({
  product,
  reviews,
  storeName,
  baseUrl,
  breadcrumbs,
}: {
  product: {
    title: string
    slug: string
    description?: string
    shortDescription?: string
    price: number
    compareAtPrice?: number | null
    sku?: string
    vendor?: string
    images?: Array<{ url: string; alt?: string }>
    categories?: Array<{ name: string; slug: string }>
    inStock?: boolean
    rating?: { value: number; count: number }
  }
  reviews?: Array<{
    customerName: string
    rating: number
    title?: string | null
    content?: string | null
    createdAt: string
  }>
  storeName: string
  baseUrl: string
  breadcrumbs?: Array<{ name: string; slug: string }>
}) {
  const productUrl = `${baseUrl}/products/${product.slug}`
  const productImages = product.images?.map((img) => img.url) || []
  const productImage = productImages[0]

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'Products', url: `${baseUrl}/products` },
    ...(breadcrumbs || []).map((b) => ({
      name: b.name,
      url: `${baseUrl}/category/${b.slug}`,
    })),
    { name: product.title, url: productUrl },
  ]

  const reviewItems = reviews
    ?.filter((r) => r.content || r.title)
    .slice(0, 5)
    .map((r) => ({
      author: r.customerName,
      datePublished: r.createdAt.split('T')[0],
      reviewBody: r.content || undefined,
      name: r.title || undefined,
      ratingValue: r.rating,
    }))

  return (
    <Seo
      title={`${product.title} | ${storeName}`}
      description={
        product.shortDescription ||
        product.description?.replace(/<[^>]*>/g, '').slice(0, 160) ||
        `Shop ${product.title} at ${storeName}`
      }
      keywords={[
        product.title,
        product.vendor || '',
        ...(product.categories?.map((c) => c.name) || []),
      ].filter(Boolean)}
      canonical={productUrl}
      ogType="product"
      ogUrl={productUrl}
      ogImage={productImage}
      ogImageAlt={product.images?.[0]?.alt || product.title}
      ogSiteName={storeName}
      product={{
        name: product.title,
        description:
          product.shortDescription ||
          product.description?.replace(/<[^>]*>/g, '').slice(0, 500),
        image: productImage,
        images: productImages.length > 1 ? productImages : undefined,
        sku: product.sku,
        brand: product.vendor,
        price: product.price,
        priceCurrency: 'USD',
        url: productUrl,
        availability: product.inStock !== false ? 'InStock' : 'OutOfStock',
        condition: 'NewCondition',
        rating: product.rating,
        reviews: reviewItems,
      }}
      breadcrumbs={breadcrumbItems}
      organization={{
        name: storeName,
        url: baseUrl,
      }}
    />
  )
}

// ── Helper for Category pages ─────────────────────────────

export function CategorySeo({
  category,
  storeName,
  baseUrl,
  productCount,
  breadcrumbs,
}: {
  category: {
    name: string
    slug: string
    description?: string
    imageUrl?: string
  }
  storeName: string
  baseUrl: string
  productCount?: number
  breadcrumbs?: Array<{ name: string; slug: string }>
}) {
  const categoryUrl = `${baseUrl}/category/${category.slug}`

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'Categories', url: `${baseUrl}/products` },
    ...(breadcrumbs || []).map((b) => ({
      name: b.name,
      url: `${baseUrl}/category/${b.slug}`,
    })),
    { name: category.name, url: categoryUrl },
  ]

  const description =
    category.description ||
    `Shop ${category.name} at ${storeName}. ${productCount ? `Browse ${productCount} products.` : 'Discover our collection.'}`

  // CollectionPage JSON-LD
  const collectionPageSchema: object = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description,
    url: categoryUrl,
    ...(productCount ? { numberOfItems: productCount } : {}),
  }

  return (
    <Seo
      title={`${category.name} | ${storeName}`}
      description={description}
      keywords={[category.name, 'shop', 'buy', storeName]}
      canonical={categoryUrl}
      ogType="website"
      ogUrl={categoryUrl}
      ogImage={category.imageUrl}
      ogImageAlt={category.name}
      ogSiteName={storeName}
      breadcrumbs={breadcrumbItems}
      jsonLd={[collectionPageSchema]}
    />
  )
}

// ── Helper for product listing pages (ItemList) ───────────

export function CollectionListSeo({
  title,
  description,
  storeName,
  baseUrl,
  image,
  products,
}: {
  title: string
  description: string
  storeName: string
  baseUrl: string
  image?: string
  products?: Array<{
    name: string
    url: string
    image?: string
    price?: number
    position?: number
  }>
}) {
  const jsonLd: object[] = []

  // ItemList for product listings (enables carousel in SERPs)
  if (products && products.length > 0) {
    jsonLd.push({
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: title,
      numberOfItems: products.length,
      itemListElement: products.map((p, idx) => ({
        '@type': 'ListItem',
        position: p.position ?? idx + 1,
        url: p.url,
        name: p.name,
        ...(p.image ? { image: p.image } : {}),
      })),
    })
  }

  return (
    <Seo
      title={`${title} | ${storeName}`}
      description={description}
      canonical={`${baseUrl}/products`}
      ogType="website"
      ogUrl={`${baseUrl}/products`}
      ogImage={image}
      ogSiteName={storeName}
      breadcrumbs={[
        { name: 'Home', url: baseUrl },
        { name: title, url: `${baseUrl}/products` },
      ]}
      jsonLd={jsonLd}
    />
  )
}

// ── Helper for Home page ──────────────────────────────────

export function HomeSeo({
  storeName,
  description,
  baseUrl,
  logoUrl,
  socialLinks,
}: {
  storeName: string
  description?: string
  baseUrl: string
  logoUrl?: string | null
  socialLinks?: string[]
}) {
  const websiteSchema: object = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: storeName,
    url: baseUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <Seo
      title={`${storeName} — Online Store`}
      description={description || `Welcome to ${storeName}. Shop our curated collection of products.`}
      canonical={baseUrl}
      ogType="website"
      ogUrl={baseUrl}
      ogImage={logoUrl || undefined}
      ogSiteName={storeName}
      organization={{
        name: storeName,
        url: baseUrl,
        logo: logoUrl || undefined,
        sameAs: socialLinks,
      }}
      jsonLd={[websiteSchema]}
    />
  )
}

// ── Helper for CMS / Blog pages (Article) ─────────────────

export function ArticleSeo({
  title,
  content,
  storeName,
  baseUrl,
  slug,
  imageUrl,
  publishedAt,
  updatedAt,
  authorName,
}: {
  title: string
  content?: string
  storeName: string
  baseUrl: string
  slug: string
  imageUrl?: string | null
  publishedAt?: string
  updatedAt?: string
  authorName?: string
}) {
  const articleUrl = `${baseUrl}/pages/${slug}`
  const desc = content?.replace(/<[^>]*>/g, '').slice(0, 160) || `${title} — ${storeName}`

  const articleSchema: object = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: desc,
    url: articleUrl,
    ...(imageUrl ? { image: imageUrl } : {}),
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    publisher: {
      '@type': 'Organization',
      name: storeName,
      ...(imageUrl ? { logo: { '@type': 'ImageObject', url: imageUrl } } : {}),
    },
    ...(authorName
      ? { author: { '@type': 'Person', name: authorName } }
      : { author: { '@type': 'Organization', name: storeName } }),
  }

  return (
    <Seo
      title={`${title} | ${storeName}`}
      description={desc}
      canonical={articleUrl}
      ogType="article"
      ogUrl={articleUrl}
      ogImage={imageUrl || undefined}
      ogSiteName={storeName}
      breadcrumbs={[
        { name: 'Home', url: baseUrl },
        { name: title, url: articleUrl },
      ]}
      jsonLd={[articleSchema]}
    />
  )
}
