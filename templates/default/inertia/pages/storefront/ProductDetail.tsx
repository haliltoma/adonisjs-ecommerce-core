import { useState, useRef } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductImage {
  id: string
  url: string
  alt: string
}

interface ProductVariant {
  id: string
  name: string
  sku: string
  price: number
  compareAtPrice?: number
  inStock: boolean
  stockQuantity?: number
  options: { name: string; value: string }[]
  image?: string
}

interface ProductReview {
  id: string
  rating: number
  title: string
  content: string
  author: string
  createdAt: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  price: number
  compareAtPrice?: number
  sku: string
  inStock: boolean
  stockQuantity?: number
  hasVariants: boolean
  images: ProductImage[]
  variants: ProductVariant[]
  categories: { id: string; name: string; slug: string }[]
  tags: { id: string; name: string; slug: string }[]
  reviews: {
    average: number
    count: number
    items: ProductReview[]
  }
}

interface RelatedProduct {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  image: string | null
  inStock: boolean
}

interface Props {
  product: Product
  relatedProducts: RelatedProduct[]
}

export default function ProductDetail({ product, relatedProducts }: Props) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.hasVariants ? product.variants[0] : null
  )
  const [quantity, setQuantity] = useState(1)
  const [isZoomed, setIsZoomed] = useState(false)
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 })
  const [activeTab, setActiveTab] = useState<'description' | 'reviews'>('description')
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)

  const currentPrice = selectedVariant?.price || product.price
  const currentComparePrice = selectedVariant?.compareAtPrice || product.compareAtPrice
  const currentStock = selectedVariant?.inStock ?? product.inStock
  const currentStockQty = selectedVariant?.stockQuantity ?? product.stockQuantity

  const discount = currentComparePrice
    ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
    : 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const handleImageZoom = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return
    const rect = imageRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setZoomPosition({ x, y })
  }

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    try {
      await router.post(
        '/api/cart/items',
        {
          productId: product.id,
          variantId: selectedVariant?.id,
          quantity,
        },
        {
          preserveState: true,
          preserveScroll: true,
        }
      )
    } finally {
      setIsAddingToCart(false)
    }
  }

  const getOptionValues = (optionName: string): string[] => {
    const values = new Set<string>()
    product.variants.forEach((v) => {
      const option = v.options.find((o) => o.name === optionName)
      if (option) values.add(option.value)
    })
    return Array.from(values)
  }

  const getUniqueOptions = (): string[] => {
    const options = new Set<string>()
    product.variants.forEach((v) => {
      v.options.forEach((o) => options.add(o.name))
    })
    return Array.from(options)
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'text-amber-400' : 'text-slate-200'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    )
  }

  return (
    <>
      <Head title={product.name} />

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Sans+3:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-body { font-family: 'Source Sans 3', system-ui, sans-serif; }
      `}</style>

      <div className="min-h-screen bg-white font-body">
        {/* Breadcrumb */}
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <ol className="flex items-center gap-2 text-sm text-slate-500">
            <li>
              <Link href="/" className="hover:text-slate-900 transition-colors">
                Home
              </Link>
            </li>
            <li className="text-slate-300">/</li>
            {product.categories[0] && (
              <>
                <li>
                  <Link
                    href={`/categories/${product.categories[0].slug}`}
                    className="hover:text-slate-900 transition-colors"
                  >
                    {product.categories[0].name}
                  </Link>
                </li>
                <li className="text-slate-300">/</li>
              </>
            )}
            <li className="text-slate-900 font-medium truncate max-w-xs">
              {product.name}
            </li>
          </ol>
        </nav>

        {/* Product Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Image Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <motion.div
                ref={imageRef}
                className="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden cursor-zoom-in"
                onMouseEnter={() => setIsZoomed(true)}
                onMouseLeave={() => setIsZoomed(false)}
                onMouseMove={handleImageZoom}
                layoutId={`product-image-${product.id}`}
              >
                {product.images[selectedImage] ? (
                  <img
                    src={product.images[selectedImage].url}
                    alt={product.images[selectedImage].alt || product.name}
                    className="w-full h-full object-cover transition-transform duration-300"
                    style={{
                      transform: isZoomed ? 'scale(2)' : 'scale(1)',
                      transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-24 h-24 text-slate-300"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                )}

                {/* Discount Badge */}
                {discount > 0 && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    -{discount}%
                  </div>
                )}
              </motion.div>

              {/* Thumbnail Gallery */}
              {product.images.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((image, index) => (
                    <button
                      key={image.id}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-slate-900 ring-2 ring-slate-900/20'
                          : 'border-transparent hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={image.url}
                        alt={image.alt || `${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="lg:py-4">
              {/* Title & Price */}
              <div className="mb-8">
                <h1 className="font-display text-4xl lg:text-5xl font-medium text-slate-900 mb-4 leading-tight">
                  {product.name}
                </h1>

                {/* Rating */}
                {product.reviews.count > 0 && (
                  <div className="flex items-center gap-3 mb-4">
                    {renderStars(Math.round(product.reviews.average))}
                    <span className="text-sm text-slate-500">
                      {product.reviews.average.toFixed(1)} ({product.reviews.count}{' '}
                      reviews)
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-semibold text-slate-900">
                    {formatPrice(currentPrice)}
                  </span>
                  {currentComparePrice && (
                    <span className="text-xl text-slate-400 line-through">
                      {formatPrice(currentComparePrice)}
                    </span>
                  )}
                </div>

                {/* Stock Status */}
                <div className="mt-3">
                  {currentStock ? (
                    <span className="inline-flex items-center text-sm text-emerald-600">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2" />
                      In Stock
                      {currentStockQty && currentStockQty <= 5 && (
                        <span className="ml-1 text-amber-600">
                          (Only {currentStockQty} left)
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-sm text-red-600">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-slate-600 text-lg leading-relaxed mb-8">
                  {product.shortDescription}
                </p>
              )}

              {/* Variant Selector */}
              {product.hasVariants && (
                <div className="space-y-6 mb-8">
                  {getUniqueOptions().map((optionName) => (
                    <div key={optionName}>
                      <label className="block text-sm font-medium text-slate-700 mb-3">
                        {optionName}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {getOptionValues(optionName).map((value) => {
                          const isSelected = selectedVariant?.options.some(
                            (o) => o.name === optionName && o.value === value
                          )
                          const matchingVariant = product.variants.find((v) =>
                            v.options.some(
                              (o) => o.name === optionName && o.value === value
                            )
                          )
                          const isAvailable = matchingVariant?.inStock

                          return (
                            <button
                              key={value}
                              onClick={() => {
                                if (matchingVariant) {
                                  setSelectedVariant(matchingVariant)
                                  if (matchingVariant.image) {
                                    const imageIndex = product.images.findIndex(
                                      (img) => img.url === matchingVariant.image
                                    )
                                    if (imageIndex >= 0) setSelectedImage(imageIndex)
                                  }
                                }
                              }}
                              disabled={!isAvailable}
                              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                isSelected
                                  ? 'border-slate-900 bg-slate-900 text-white'
                                  : isAvailable
                                    ? 'border-slate-300 text-slate-700 hover:border-slate-900'
                                    : 'border-slate-200 text-slate-300 cursor-not-allowed line-through'
                              }`}
                            >
                              {value}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quantity & Add to Cart */}
              <div className="flex items-center gap-4 mb-8">
                {/* Quantity Selector */}
                <div className="flex items-center border border-slate-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-4 py-3 text-slate-600 hover:text-slate-900 transition-colors"
                    disabled={quantity <= 1}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="w-12 text-center font-medium text-slate-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-4 py-3 text-slate-600 hover:text-slate-900 transition-colors"
                    disabled={currentStockQty !== undefined && quantity >= currentStockQty}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>

                {/* Add to Cart Button */}
                <motion.button
                  onClick={handleAddToCart}
                  disabled={!currentStock || isAddingToCart}
                  whileTap={{ scale: 0.98 }}
                  className={`flex-1 py-4 px-8 rounded-lg font-semibold text-lg transition-all ${
                    currentStock
                      ? 'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isAddingToCart ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Adding...
                    </span>
                  ) : currentStock ? (
                    'Add to Cart'
                  ) : (
                    'Out of Stock'
                  )}
                </motion.button>
              </div>

              {/* Wishlist & Share */}
              <div className="flex items-center gap-4 pb-8 border-b border-slate-200">
                <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Add to Wishlist
                </button>
                <button className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Share
                </button>
              </div>

              {/* SKU & Categories */}
              <div className="pt-6 space-y-2 text-sm text-slate-500">
                <p>
                  <span className="font-medium text-slate-700">SKU:</span>{' '}
                  {selectedVariant?.sku || product.sku}
                </p>
                {product.categories.length > 0 && (
                  <p>
                    <span className="font-medium text-slate-700">Categories:</span>{' '}
                    {product.categories.map((cat, i) => (
                      <span key={cat.id}>
                        <Link
                          href={`/categories/${cat.slug}`}
                          className="text-slate-600 hover:text-slate-900 hover:underline"
                        >
                          {cat.name}
                        </Link>
                        {i < product.categories.length - 1 && ', '}
                      </span>
                    ))}
                  </p>
                )}
                {product.tags.length > 0 && (
                  <p>
                    <span className="font-medium text-slate-700">Tags:</span>{' '}
                    {product.tags.map((tag, i) => (
                      <span key={tag.id}>
                        <Link
                          href={`/tags/${tag.slug}`}
                          className="text-slate-600 hover:text-slate-900 hover:underline"
                        >
                          {tag.name}
                        </Link>
                        {i < product.tags.length - 1 && ', '}
                      </span>
                    ))}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Description & Reviews Tabs */}
          <div className="mt-16">
            <div className="border-b border-slate-200">
              <div className="flex gap-8">
                <button
                  onClick={() => setActiveTab('description')}
                  className={`pb-4 text-lg font-medium transition-colors relative ${
                    activeTab === 'description'
                      ? 'text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Description
                  {activeTab === 'description' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"
                    />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-4 text-lg font-medium transition-colors relative ${
                    activeTab === 'reviews'
                      ? 'text-slate-900'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  Reviews ({product.reviews.count})
                  {activeTab === 'reviews' && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"
                    />
                  )}
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === 'description' ? (
                <motion.div
                  key="description"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="py-8 prose prose-slate max-w-none"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <motion.div
                  key="reviews"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="py-8"
                >
                  {product.reviews.items.length > 0 ? (
                    <div className="space-y-6">
                      {product.reviews.items.map((review) => (
                        <div
                          key={review.id}
                          className="p-6 bg-slate-50 rounded-xl"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="font-medium text-slate-900">
                                {review.author}
                              </p>
                              <p className="text-sm text-slate-500">
                                {new Date(review.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            {renderStars(review.rating)}
                          </div>
                          {review.title && (
                            <h4 className="font-semibold text-slate-900 mb-2">
                              {review.title}
                            </h4>
                          )}
                          <p className="text-slate-600">{review.content}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-slate-500 py-12">
                      No reviews yet. Be the first to review this product!
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-3xl font-medium text-slate-900 mb-8">
                You May Also Like
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {relatedProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group"
                  >
                    <div className="aspect-square bg-slate-100 rounded-xl overflow-hidden mb-4">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg
                            className="w-12 h-12 text-slate-300"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-slate-900 group-hover:text-slate-600 transition-colors line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-semibold text-slate-900">
                        {formatPrice(product.price)}
                      </span>
                      {product.compareAtPrice && (
                        <span className="text-sm text-slate-400 line-through">
                          {formatPrice(product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
