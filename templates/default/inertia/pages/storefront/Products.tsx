import { useState } from 'react'
import { Head, Link, router } from '@inertiajs/react'
import { motion, AnimatePresence } from 'framer-motion'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice?: number
  sku: string
  inStock: boolean
  image: string | null
  hasVariants: boolean
  variantCount: number
}

interface Category {
  id: string
  name: string
  slug: string
  productCount: number
}

interface PaginationMeta {
  total: number
  perPage: number
  currentPage: number
  lastPage: number
  firstPage: number
}

interface Props {
  products: Product[]
  categories: Category[]
  meta: PaginationMeta
  filters: {
    category?: string
    minPrice?: number
    maxPrice?: number
    sort?: string
    search?: string
  }
}

export default function Products({ products, categories, meta, filters }: Props) {
  const [priceRange, setPriceRange] = useState({
    min: filters.minPrice?.toString() || '',
    max: filters.maxPrice?.toString() || '',
  })
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const sortOptions = [
    { value: 'created_at:desc', label: 'Newest' },
    { value: 'created_at:asc', label: 'Oldest' },
    { value: 'price:asc', label: 'Price: Low to High' },
    { value: 'price:desc', label: 'Price: High to Low' },
    { value: 'name:asc', label: 'Name: A-Z' },
    { value: 'name:desc', label: 'Name: Z-A' },
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price)
  }

  const handleSort = (value: string) => {
    const [sort, order] = value.split(':')
    router.get(
      '/products',
      { ...filters, sort, order, page: 1 },
      { preserveState: true, preserveScroll: true }
    )
  }

  const handleCategoryFilter = (categorySlug: string) => {
    router.get(
      '/products',
      { ...filters, category: categorySlug, page: 1 },
      { preserveState: true, preserveScroll: true }
    )
  }

  const handlePriceFilter = () => {
    router.get(
      '/products',
      {
        ...filters,
        minPrice: priceRange.min || undefined,
        maxPrice: priceRange.max || undefined,
        page: 1,
      },
      { preserveState: true, preserveScroll: true }
    )
  }

  const clearFilters = () => {
    setPriceRange({ min: '', max: '' })
    router.get('/products', {}, { preserveState: true, preserveScroll: true })
  }

  const hasActiveFilters = filters.category || filters.minPrice || filters.maxPrice

  return (
    <>
      <Head title="Products" />

      {/* Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Source+Sans+3:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <style>{`
        .font-display { font-family: 'Playfair Display', Georgia, serif; }
        .font-body { font-family: 'Source Sans 3', system-ui, sans-serif; }
      `}</style>

      <div className="min-h-screen bg-white font-body">
        {/* Header */}
        <div className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="font-display text-4xl lg:text-5xl font-medium text-slate-900 text-center">
              Our Collection
            </h1>
            <p className="text-center text-slate-600 mt-4 text-lg max-w-2xl mx-auto">
              Discover our curated selection of premium products designed with quality and style in mind.
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="lg:grid lg:grid-cols-4 lg:gap-8">
            {/* Sidebar Filters */}
            <aside className="hidden lg:block">
              <div className="sticky top-8 space-y-8">
                {/* Categories */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                    Categories
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => handleCategoryFilter('')}
                        className={`text-sm transition-colors ${
                          !filters.category
                            ? 'text-slate-900 font-medium'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        All Products
                      </button>
                    </li>
                    {categories.map((category) => (
                      <li key={category.id}>
                        <button
                          onClick={() => handleCategoryFilter(category.slug)}
                          className={`text-sm transition-colors flex items-center justify-between w-full ${
                            filters.category === category.slug
                              ? 'text-slate-900 font-medium'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <span>{category.name}</span>
                          <span className="text-slate-400 text-xs">
                            {category.productCount}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                    Price Range
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, min: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                    <span className="text-slate-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) =>
                        setPriceRange({ ...priceRange, max: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handlePriceFilter}
                    className="mt-3 w-full py-2 bg-slate-900 text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Apply
                  </button>
                </div>

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-slate-600 hover:text-slate-900 underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            </aside>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-sm text-slate-600">
                  Showing{' '}
                  <span className="font-medium text-slate-900">
                    {(meta.currentPage - 1) * meta.perPage + 1}
                  </span>{' '}
                  -{' '}
                  <span className="font-medium text-slate-900">
                    {Math.min(meta.currentPage * meta.perPage, meta.total)}
                  </span>{' '}
                  of{' '}
                  <span className="font-medium text-slate-900">{meta.total}</span>{' '}
                  products
                </p>

                <div className="flex items-center gap-4">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Filters
                  </button>

                  {/* Sort */}
                  <select
                    value={`${filters.sort || 'created_at'}:${filters.sort === 'price' || filters.sort === 'name' ? 'asc' : 'desc'}`}
                    onChange={(e) => handleSort(e.target.value)}
                    className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-slate-900 focus:border-transparent bg-white"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {products.length > 0 ? (
                <motion.div
                  layout
                  className="grid grid-cols-2 md:grid-cols-3 gap-6"
                >
                  <AnimatePresence>
                    {products.map((product, index) => (
                      <motion.div
                        key={product.id}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Link
                          href={`/products/${product.slug}`}
                          className="group block"
                        >
                          {/* Image */}
                          <div className="relative aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden mb-4">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg
                                  className="w-16 h-16 text-slate-300"
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

                            {/* Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-2">
                              {product.compareAtPrice && (
                                <span className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                  -{Math.round(
                                    ((product.compareAtPrice - product.price) /
                                      product.compareAtPrice) *
                                      100
                                  )}
                                  %
                                </span>
                              )}
                              {!product.inStock && (
                                <span className="bg-slate-900 text-white text-xs font-semibold px-2 py-1 rounded-full">
                                  Sold Out
                                </span>
                              )}
                            </div>

                            {/* Quick Actions */}
                            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  // Add to wishlist
                                }}
                                className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-slate-100 transition-colors"
                              >
                                <svg
                                  className="w-5 h-5 text-slate-700"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                  />
                                </svg>
                              </button>
                            </div>
                          </div>

                          {/* Info */}
                          <h3 className="font-medium text-slate-900 group-hover:text-slate-600 transition-colors line-clamp-2 mb-2">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900">
                              {formatPrice(product.price)}
                            </span>
                            {product.compareAtPrice && (
                              <span className="text-sm text-slate-400 line-through">
                                {formatPrice(product.compareAtPrice)}
                              </span>
                            )}
                          </div>
                          {product.hasVariants && (
                            <p className="text-xs text-slate-500 mt-1">
                              {product.variantCount} variants
                            </p>
                          )}
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div className="text-center py-16">
                  <svg
                    className="w-16 h-16 text-slate-300 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-slate-900 mb-2">
                    No products found
                  </h3>
                  <p className="text-slate-600 mb-6">
                    Try adjusting your filters or search criteria.
                  </p>
                  <button
                    onClick={clearFilters}
                    className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              )}

              {/* Pagination */}
              {meta.lastPage > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  <button
                    onClick={() =>
                      router.get(
                        '/products',
                        { ...filters, page: meta.currentPage - 1 },
                        { preserveState: true, preserveScroll: true }
                      )
                    }
                    disabled={meta.currentPage === 1}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>

                  {Array.from({ length: meta.lastPage }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === meta.lastPage ||
                        Math.abs(page - meta.currentPage) <= 1
                    )
                    .map((page, index, array) => (
                      <span key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-slate-400">...</span>
                        )}
                        <button
                          onClick={() =>
                            router.get(
                              '/products',
                              { ...filters, page },
                              { preserveState: true, preserveScroll: true }
                            )
                          }
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            page === meta.currentPage
                              ? 'bg-slate-900 text-white'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {page}
                        </button>
                      </span>
                    ))}

                  <button
                    onClick={() =>
                      router.get(
                        '/products',
                        { ...filters, page: meta.currentPage + 1 },
                        { preserveState: true, preserveScroll: true }
                      )
                    }
                    disabled={meta.currentPage === meta.lastPage}
                    className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filters Drawer */}
        <AnimatePresence>
          {mobileFiltersOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileFiltersOpen(false)}
                className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.3 }}
                className="fixed inset-y-0 left-0 w-80 bg-white z-50 lg:hidden overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-900">
                      Filters
                    </h2>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="p-2 -mr-2 text-slate-500 hover:text-slate-900"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>

                  {/* Categories */}
                  <div className="mb-8">
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                      Categories
                    </h3>
                    <ul className="space-y-3">
                      <li>
                        <button
                          onClick={() => {
                            handleCategoryFilter('')
                            setMobileFiltersOpen(false)
                          }}
                          className={`text-sm ${
                            !filters.category
                              ? 'text-slate-900 font-medium'
                              : 'text-slate-600'
                          }`}
                        >
                          All Products
                        </button>
                      </li>
                      {categories.map((category) => (
                        <li key={category.id}>
                          <button
                            onClick={() => {
                              handleCategoryFilter(category.slug)
                              setMobileFiltersOpen(false)
                            }}
                            className={`text-sm ${
                              filters.category === category.slug
                                ? 'text-slate-900 font-medium'
                                : 'text-slate-600'
                            }`}
                          >
                            {category.name} ({category.productCount})
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Price Range */}
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">
                      Price Range
                    </h3>
                    <div className="flex items-center gap-2 mb-3">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, min: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) =>
                          setPriceRange({ ...priceRange, max: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                      />
                    </div>
                    <button
                      onClick={() => {
                        handlePriceFilter()
                        setMobileFiltersOpen(false)
                      }}
                      className="w-full py-2 bg-slate-900 text-white text-sm font-medium rounded-lg"
                    >
                      Apply
                    </button>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={() => {
                        clearFilters()
                        setMobileFiltersOpen(false)
                      }}
                      className="mt-6 text-sm text-slate-600 underline"
                    >
                      Clear all filters
                    </button>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
