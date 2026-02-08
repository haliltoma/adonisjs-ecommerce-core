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
    sku?: string
    brand?: string
    price: number
    priceCurrency?: string
    availability?: 'InStock' | 'OutOfStock' | 'PreOrder'
    condition?: 'NewCondition' | 'UsedCondition' | 'RefurbishedCondition'
    rating?: {
      value: number
      count: number
    }
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
  }
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
}: SeoProps) {
  const robotsContent = [
    noIndex ? 'noindex' : 'index',
    noFollow ? 'nofollow' : 'follow',
  ].join(', ')

  // Generate JSON-LD structured data
  const structuredData: any[] = []

  // Organization schema
  if (organization) {
    structuredData.push({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: organization.name,
      url: organization.url,
      logo: organization.logo,
      sameAs: organization.sameAs || [],
    })
  }

  // Product schema
  if (product) {
    const productSchema: any = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      image: product.image,
      sku: product.sku,
      brand: product.brand ? {
        '@type': 'Brand',
        name: product.brand,
      } : undefined,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: product.priceCurrency || 'USD',
        availability: `https://schema.org/${product.availability || 'InStock'}`,
        itemCondition: `https://schema.org/${product.condition || 'NewCondition'}`,
      },
    }

    if (product.rating) {
      productSchema.aggregateRating = {
        '@type': 'AggregateRating',
        ratingValue: product.rating.value,
        reviewCount: product.rating.count,
      }
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

  // WebSite schema for search box
  structuredData.push({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: ogSiteName,
    url: typeof window !== 'undefined' ? window.location.origin : '',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${typeof window !== 'undefined' ? window.location.origin : ''}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  })

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

// Helper component for product pages
export function ProductSeo({
  product,
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
  storeName: string
  baseUrl: string
  breadcrumbs?: Array<{ name: string; slug: string }>
}) {
  const productUrl = `${baseUrl}/products/${product.slug}`
  const productImage = product.images?.[0]?.url

  const breadcrumbItems = [
    { name: 'Home', url: baseUrl },
    { name: 'Products', url: `${baseUrl}/products` },
    ...(breadcrumbs || []).map(b => ({ name: b.name, url: `${baseUrl}/category/${b.slug}` })),
    { name: product.title, url: productUrl },
  ]

  return (
    <Seo
      title={`${product.title} | ${storeName}`}
      description={product.shortDescription || product.description?.slice(0, 160) || `Shop ${product.title} at ${storeName}`}
      keywords={[
        product.title,
        product.vendor || '',
        ...(product.categories?.map(c => c.name) || []),
      ].filter(Boolean)}
      canonical={productUrl}
      ogType="product"
      ogUrl={productUrl}
      ogImage={productImage}
      ogImageAlt={product.images?.[0]?.alt || product.title}
      ogSiteName={storeName}
      product={{
        name: product.title,
        description: product.shortDescription || product.description,
        image: productImage,
        sku: product.sku,
        brand: product.vendor,
        price: product.price,
        priceCurrency: 'USD',
        availability: product.inStock !== false ? 'InStock' : 'OutOfStock',
        condition: 'NewCondition',
        rating: product.rating,
      }}
      breadcrumbs={breadcrumbItems}
    />
  )
}

// Helper component for category pages
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
    ...(breadcrumbs || []).map(b => ({ name: b.name, url: `${baseUrl}/category/${b.slug}` })),
    { name: category.name, url: categoryUrl },
  ]

  const description = category.description ||
    `Shop ${category.name} at ${storeName}. ${productCount ? `Browse ${productCount} products.` : 'Discover our collection.'}`

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
    />
  )
}

// Helper for collection list pages
export function CollectionListSeo({
  title,
  description,
  storeName,
  baseUrl,
  image,
}: {
  title: string
  description: string
  storeName: string
  baseUrl: string
  image?: string
}) {
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
    />
  )
}
