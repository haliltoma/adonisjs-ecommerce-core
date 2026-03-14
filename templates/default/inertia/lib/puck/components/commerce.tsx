export const commerceComponents = {
  ProductGrid: {
    fields: {
      title: { type: 'text' as const },
      subtitle: { type: 'text' as const },
      count: {
        type: 'select' as const,
        options: [
          { label: '3 Products', value: '3' },
          { label: '4 Products', value: '4' },
          { label: '6 Products', value: '6' },
          { label: '8 Products', value: '8' },
        ],
      },
      source: {
        type: 'select' as const,
        options: [
          { label: 'Featured', value: 'featured' },
          { label: 'Newest', value: 'newest' },
          { label: 'Best Selling', value: 'best-selling' },
          { label: 'On Sale', value: 'on-sale' },
        ],
      },
    },
    defaultProps: { title: 'Featured Products', subtitle: '', count: '4', source: 'featured' },
    render: ({ title, subtitle, count }: any) => {
      const gridColsMap: Record<string, string> = {
        '3': 'grid-cols-2 md:grid-cols-3',
        '4': 'grid-cols-2 md:grid-cols-4',
        '6': 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
        '8': 'grid-cols-2 md:grid-cols-4',
      }
      return (
        <div>
          {title && (
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
              {subtitle && <p className="mt-1 text-gray-500">{subtitle}</p>}
            </div>
          )}
          <div className={`grid ${gridColsMap[count] || 'grid-cols-2 md:grid-cols-4'} gap-6`}>
            {Array.from({ length: Number(count) }).map((_, i) => (
              <div key={i} className="group">
                <div className="aspect-square rounded-lg bg-gray-100 mb-3 overflow-hidden">
                  <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                    Product {i + 1}
                  </div>
                </div>
                <h3 className="text-sm font-medium">Product Name</h3>
                <p className="text-sm text-gray-500 mt-0.5">$0.00</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
  },

  FeaturedProduct: {
    fields: {
      layout: {
        type: 'select' as const,
        options: [
          { label: 'Image Left', value: 'left' },
          { label: 'Image Right', value: 'right' },
        ],
      },
      title: { type: 'text' as const },
      description: { type: 'textarea' as const },
      imageUrl: { type: 'text' as const },
      buttonText: { type: 'text' as const },
      buttonUrl: { type: 'text' as const },
    },
    defaultProps: {
      layout: 'left',
      title: 'Featured Product',
      description: 'Highlight a special product with a detailed description and call to action.',
      imageUrl: '',
      buttonText: 'Shop Now',
      buttonUrl: '/products',
    },
    render: ({ layout, title, description, imageUrl, buttonText, buttonUrl }: any) => (
      <div className={`grid md:grid-cols-2 gap-8 items-center`}>
        <div className={layout === 'right' ? 'md:order-2' : ''}>
          {imageUrl ? (
            <img src={imageUrl} alt={title} className="w-full rounded-xl object-cover aspect-square" />
          ) : (
            <div className="w-full rounded-xl bg-gray-100 aspect-square flex items-center justify-center text-gray-400">
              Product Image
            </div>
          )}
        </div>
        <div className={layout === 'right' ? 'md:order-1' : ''}>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="mt-4 text-gray-600 leading-relaxed">{description}</p>
          {buttonText && (
            <a
              href={buttonUrl}
              className="mt-6 inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              {buttonText}
            </a>
          )}
        </div>
      </div>
    ),
  },

  CategoryGrid: {
    fields: {
      title: { type: 'text' as const },
      columns: {
        type: 'select' as const,
        options: [
          { label: '2 Categories', value: '2' },
          { label: '3 Categories', value: '3' },
          { label: '4 Categories', value: '4' },
        ],
      },
    },
    defaultProps: { title: 'Shop by Category', columns: '3' },
    render: ({ title, columns }: any) => {
      const catGridMap: Record<string, string> = {
        '2': 'grid-cols-2',
        '3': 'grid-cols-2 md:grid-cols-3',
        '4': 'grid-cols-2 md:grid-cols-4',
      }
      return (
      <div>
        {title && <h2 className="text-2xl font-bold tracking-tight text-center mb-6">{title}</h2>}
        <div className={`grid ${catGridMap[columns] || 'grid-cols-2 md:grid-cols-3'} gap-4`}>
          {Array.from({ length: Number(columns) }).map((_, i) => (
            <div key={i} className="relative aspect-[4/3] rounded-xl bg-gray-100 overflow-hidden group cursor-pointer">
              <div className="absolute inset-0 flex items-end p-4">
                <span className="text-sm font-semibold bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg">
                  Category {i + 1}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      )
    },
  },

  CtaBanner: {
    fields: {
      title: { type: 'text' as const },
      description: { type: 'text' as const },
      buttonText: { type: 'text' as const },
      buttonUrl: { type: 'text' as const },
      variant: {
        type: 'select' as const,
        options: [
          { label: 'Dark', value: 'dark' },
          { label: 'Light', value: 'light' },
          { label: 'Gradient', value: 'gradient' },
        ],
      },
    },
    defaultProps: {
      title: 'Special Offer',
      description: 'Get 20% off your first order with code WELCOME20',
      buttonText: 'Shop Now',
      buttonUrl: '/products',
      variant: 'dark',
    },
    render: ({ title, description, buttonText, buttonUrl, variant }: any) => {
      const variantMap: Record<string, string> = {
        dark: 'bg-gray-900 text-white',
        light: 'bg-amber-50 text-gray-900 border border-amber-200',
        gradient: 'bg-gradient-to-r from-amber-600 to-orange-600 text-white',
      }
      return (
        <div className={`rounded-xl p-8 md:p-12 text-center ${variantMap[variant]}`}>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{title}</h2>
          {description && <p className="mt-2 opacity-80 max-w-xl mx-auto">{description}</p>}
          {buttonText && (
            <a
              href={buttonUrl}
              className={`mt-6 inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                variant === 'light'
                  ? 'bg-gray-900 text-white hover:bg-gray-800'
                  : 'bg-white text-gray-900 hover:bg-gray-100'
              }`}
            >
              {buttonText}
            </a>
          )}
        </div>
      )
    },
  },
}
