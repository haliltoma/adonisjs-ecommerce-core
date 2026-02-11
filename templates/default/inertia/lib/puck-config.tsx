import type { Config } from '@puckeditor/core'

export const puckConfig: Config = {
  categories: {
    layout: {
      title: 'Layout',
      components: ['Container', 'Columns', 'Spacer', 'Divider'],
    },
    typography: {
      title: 'Typography',
      components: ['Heading', 'Text', 'RichText'],
    },
    media: {
      title: 'Media',
      components: ['Image', 'Video', 'ImageGallery'],
    },
    commerce: {
      title: 'Commerce',
      components: ['ProductGrid', 'FeaturedProduct', 'CategoryGrid', 'CtaBanner'],
    },
    interactive: {
      title: 'Interactive',
      components: ['ButtonGroup', 'Accordion', 'Testimonials', 'ContactForm'],
    },
  },
  components: {
    // Layout Components
    Container: {
      fields: {
        maxWidth: {
          type: 'select',
          options: [
            { label: 'Small (640px)', value: 'sm' },
            { label: 'Medium (768px)', value: 'md' },
            { label: 'Large (1024px)', value: 'lg' },
            { label: 'Extra Large (1280px)', value: 'xl' },
            { label: 'Full Width', value: 'full' },
          ],
        },
        padding: {
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
            { label: 'Extra Large', value: 'xl' },
          ],
        },
        background: {
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'White', value: 'white' },
            { label: 'Light Gray', value: 'gray' },
            { label: 'Dark', value: 'dark' },
            { label: 'Primary', value: 'primary' },
          ],
        },
      },
      defaultProps: {
        maxWidth: 'xl',
        padding: 'md',
        background: 'none',
      },
      render: ({ maxWidth, padding, background, puck }) => {
        const maxWidthMap: Record<string, string> = {
          sm: 'max-w-screen-sm',
          md: 'max-w-screen-md',
          lg: 'max-w-screen-lg',
          xl: 'max-w-screen-xl',
          full: 'w-full',
        }
        const paddingMap: Record<string, string> = {
          none: '',
          sm: 'py-4 px-4',
          md: 'py-8 px-6',
          lg: 'py-12 px-8',
          xl: 'py-16 px-8',
        }
        const bgMap: Record<string, string> = {
          none: '',
          white: 'bg-white',
          gray: 'bg-gray-50',
          dark: 'bg-gray-900 text-white',
          primary: 'bg-amber-50',
        }

        return (
          <div className={`mx-auto ${maxWidthMap[maxWidth]} ${paddingMap[padding]} ${bgMap[background]}`}>
            {puck.renderDropZone({ zone: 'content' })}
          </div>
        )
      },
    },

    Columns: {
      fields: {
        columns: {
          type: 'select',
          options: [
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: '4 Columns', value: '4' },
            { label: '2/3 + 1/3', value: '2-1' },
            { label: '1/3 + 2/3', value: '1-2' },
          ],
        },
        gap: {
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
          ],
        },
      },
      defaultProps: {
        columns: '2',
        gap: 'md',
      },
      render: ({ columns, gap, puck }) => {
        const gapMap: Record<string, string> = {
          none: 'gap-0',
          sm: 'gap-4',
          md: 'gap-6',
          lg: 'gap-8',
        }

        const gridMap: Record<string, string> = {
          '2': 'grid-cols-1 md:grid-cols-2',
          '3': 'grid-cols-1 md:grid-cols-3',
          '4': 'grid-cols-2 md:grid-cols-4',
          '2-1': 'grid-cols-1 md:grid-cols-3',
          '1-2': 'grid-cols-1 md:grid-cols-3',
        }

        const colCount = columns === '2-1' || columns === '1-2' ? 2 : Number(columns)

        return (
          <div className={`grid ${gridMap[columns]} ${gapMap[gap]}`}>
            {Array.from({ length: colCount }).map((_, i) => (
              <div
                key={i}
                className={
                  columns === '2-1' ? (i === 0 ? 'md:col-span-2' : '') :
                  columns === '1-2' ? (i === 1 ? 'md:col-span-2' : '') : ''
                }
              >
                {puck.renderDropZone({ zone: `column-${i}` })}
              </div>
            ))}
          </div>
        )
      },
    },

    Spacer: {
      fields: {
        size: {
          type: 'select',
          options: [
            { label: 'Extra Small (8px)', value: 'xs' },
            { label: 'Small (16px)', value: 'sm' },
            { label: 'Medium (32px)', value: 'md' },
            { label: 'Large (48px)', value: 'lg' },
            { label: 'Extra Large (64px)', value: 'xl' },
            { label: '2XL (96px)', value: '2xl' },
          ],
        },
      },
      defaultProps: { size: 'md' },
      render: ({ size }) => {
        const sizeMap: Record<string, string> = {
          xs: 'h-2', sm: 'h-4', md: 'h-8', lg: 'h-12', xl: 'h-16', '2xl': 'h-24',
        }
        return <div className={sizeMap[size]} />
      },
    },

    Divider: {
      fields: {
        style: {
          type: 'select',
          options: [
            { label: 'Solid', value: 'solid' },
            { label: 'Dashed', value: 'dashed' },
            { label: 'Dotted', value: 'dotted' },
          ],
        },
      },
      defaultProps: { style: 'solid' },
      render: ({ style }) => (
        <hr className={`my-6 border-gray-200`} style={{ borderStyle: style }} />
      ),
    },

    // Typography Components
    Heading: {
      fields: {
        text: { type: 'text' },
        level: {
          type: 'select',
          options: [
            { label: 'H1', value: 'h1' },
            { label: 'H2', value: 'h2' },
            { label: 'H3', value: 'h3' },
            { label: 'H4', value: 'h4' },
          ],
        },
        align: {
          type: 'select',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
      },
      defaultProps: { text: 'Heading', level: 'h2', align: 'left' },
      render: ({ text, level, align }) => {
        const Tag = level as keyof JSX.IntrinsicElements
        const sizeMap: Record<string, string> = {
          h1: 'text-4xl md:text-5xl font-bold tracking-tight',
          h2: 'text-3xl md:text-4xl font-bold tracking-tight',
          h3: 'text-2xl md:text-3xl font-semibold',
          h4: 'text-xl md:text-2xl font-semibold',
        }
        return <Tag className={`${sizeMap[level]} text-${align}`}>{text}</Tag>
      },
    },

    Text: {
      fields: {
        text: { type: 'textarea' },
        size: {
          type: 'select',
          options: [
            { label: 'Small', value: 'sm' },
            { label: 'Base', value: 'base' },
            { label: 'Large', value: 'lg' },
            { label: 'Extra Large', value: 'xl' },
          ],
        },
        align: {
          type: 'select',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
        color: {
          type: 'select',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Muted', value: 'muted' },
            { label: 'Primary', value: 'primary' },
          ],
        },
      },
      defaultProps: { text: 'Enter your text here...', size: 'base', align: 'left', color: 'default' },
      render: ({ text, size, align, color }) => {
        const sizeMap: Record<string, string> = {
          sm: 'text-sm', base: 'text-base', lg: 'text-lg', xl: 'text-xl',
        }
        const colorMap: Record<string, string> = {
          default: 'text-gray-900', muted: 'text-gray-500', primary: 'text-amber-700',
        }
        return (
          <p className={`${sizeMap[size]} ${colorMap[color]} text-${align} leading-relaxed`}>
            {text}
          </p>
        )
      },
    },

    RichText: {
      fields: {
        html: { type: 'textarea' },
      },
      defaultProps: { html: '<p>Write your content here using HTML tags like <strong>bold</strong>, <em>italic</em>, <a href="#">links</a>, and more.</p>' },
      render: ({ html }) => (
        <div
          className="prose prose-gray max-w-none prose-headings:font-semibold prose-a:text-amber-700 prose-a:underline-offset-4"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ),
    },

    // Media Components
    Image: {
      fields: {
        src: { type: 'text' },
        alt: { type: 'text' },
        aspectRatio: {
          type: 'select',
          options: [
            { label: 'Auto', value: 'auto' },
            { label: '16:9', value: '16/9' },
            { label: '4:3', value: '4/3' },
            { label: '1:1', value: '1/1' },
            { label: '3:4', value: '3/4' },
          ],
        },
        rounded: {
          type: 'select',
          options: [
            { label: 'None', value: 'none' },
            { label: 'Small', value: 'sm' },
            { label: 'Medium', value: 'md' },
            { label: 'Large', value: 'lg' },
            { label: 'Full', value: 'full' },
          ],
        },
      },
      defaultProps: { src: '', alt: '', aspectRatio: 'auto', rounded: 'md' },
      render: ({ src, alt, aspectRatio, rounded }) => {
        const roundedMap: Record<string, string> = {
          none: '', sm: 'rounded-sm', md: 'rounded-lg', lg: 'rounded-xl', full: 'rounded-full',
        }
        if (!src) {
          return (
            <div className={`flex items-center justify-center bg-gray-100 ${roundedMap[rounded]} text-gray-400 min-h-[200px]`}
              style={aspectRatio !== 'auto' ? { aspectRatio } : undefined}
            >
              <span className="text-sm">Add image URL</span>
            </div>
          )
        }
        return (
          <img
            src={src}
            alt={alt}
            className={`w-full object-cover ${roundedMap[rounded]}`}
            style={aspectRatio !== 'auto' ? { aspectRatio } : undefined}
          />
        )
      },
    },

    Video: {
      fields: {
        url: { type: 'text' },
        aspectRatio: {
          type: 'select',
          options: [
            { label: '16:9', value: '16/9' },
            { label: '4:3', value: '4/3' },
            { label: '1:1', value: '1/1' },
          ],
        },
      },
      defaultProps: { url: '', aspectRatio: '16/9' },
      render: ({ url, aspectRatio }) => {
        if (!url) {
          return (
            <div className="flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 min-h-[200px]" style={{ aspectRatio }}>
              <span className="text-sm">Add video URL (YouTube or Vimeo)</span>
            </div>
          )
        }
        let embedUrl = url
        if (url.includes('youtube.com/watch')) {
          const id = new URL(url).searchParams.get('v')
          embedUrl = `https://www.youtube.com/embed/${id}`
        } else if (url.includes('youtu.be/')) {
          const id = url.split('youtu.be/')[1]?.split('?')[0]
          embedUrl = `https://www.youtube.com/embed/${id}`
        } else if (url.includes('vimeo.com/')) {
          const id = url.split('vimeo.com/')[1]?.split('?')[0]
          embedUrl = `https://player.vimeo.com/video/${id}`
        }
        return (
          <div className="rounded-lg overflow-hidden" style={{ aspectRatio }}>
            <iframe src={embedUrl} className="w-full h-full" allowFullScreen frameBorder="0" />
          </div>
        )
      },
    },

    ImageGallery: {
      fields: {
        images: { type: 'textarea' },
        columns: {
          type: 'select',
          options: [
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
            { label: '4 Columns', value: '4' },
          ],
        },
      },
      defaultProps: { images: '', columns: '3' },
      render: ({ images, columns }) => {
        const imageList = images.split('\n').filter(Boolean)
        const gridMap: Record<string, string> = {
          '2': 'grid-cols-2', '3': 'grid-cols-2 md:grid-cols-3', '4': 'grid-cols-2 md:grid-cols-4',
        }
        if (imageList.length === 0) {
          return (
            <div className="flex items-center justify-center bg-gray-100 rounded-lg text-gray-400 min-h-[200px]">
              <span className="text-sm">Enter image URLs (one per line)</span>
            </div>
          )
        }
        return (
          <div className={`grid ${gridMap[columns]} gap-4`}>
            {imageList.map((src, i) => (
              <img key={i} src={src} alt="" className="w-full aspect-square object-cover rounded-lg" />
            ))}
          </div>
        )
      },
    },

    // Commerce Components
    ProductGrid: {
      fields: {
        title: { type: 'text' },
        subtitle: { type: 'text' },
        count: {
          type: 'select',
          options: [
            { label: '3 Products', value: '3' },
            { label: '4 Products', value: '4' },
            { label: '6 Products', value: '6' },
            { label: '8 Products', value: '8' },
          ],
        },
        source: {
          type: 'select',
          options: [
            { label: 'Featured', value: 'featured' },
            { label: 'Newest', value: 'newest' },
            { label: 'Best Selling', value: 'best-selling' },
            { label: 'On Sale', value: 'on-sale' },
          ],
        },
      },
      defaultProps: { title: 'Featured Products', subtitle: '', count: '4', source: 'featured' },
      render: ({ title, subtitle, count }) => (
        <div>
          {title && (
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
              {subtitle && <p className="mt-1 text-gray-500">{subtitle}</p>}
            </div>
          )}
          <div className={`grid grid-cols-2 md:grid-cols-${Math.min(Number(count), 4)} gap-6`}>
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
      ),
    },

    FeaturedProduct: {
      fields: {
        layout: {
          type: 'select',
          options: [
            { label: 'Image Left', value: 'left' },
            { label: 'Image Right', value: 'right' },
          ],
        },
        title: { type: 'text' },
        description: { type: 'textarea' },
        imageUrl: { type: 'text' },
        buttonText: { type: 'text' },
        buttonUrl: { type: 'text' },
      },
      defaultProps: {
        layout: 'left',
        title: 'Featured Product',
        description: 'Highlight a special product with a detailed description and call to action.',
        imageUrl: '',
        buttonText: 'Shop Now',
        buttonUrl: '/products',
      },
      render: ({ layout, title, description, imageUrl, buttonText, buttonUrl }) => (
        <div className={`grid md:grid-cols-2 gap-8 items-center ${layout === 'right' ? '' : ''}`}>
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
        title: { type: 'text' },
        columns: {
          type: 'select',
          options: [
            { label: '2 Categories', value: '2' },
            { label: '3 Categories', value: '3' },
            { label: '4 Categories', value: '4' },
          ],
        },
      },
      defaultProps: { title: 'Shop by Category', columns: '3' },
      render: ({ title, columns }) => (
        <div>
          {title && <h2 className="text-2xl font-bold tracking-tight text-center mb-6">{title}</h2>}
          <div className={`grid grid-cols-2 md:grid-cols-${columns} gap-4`}>
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
      ),
    },

    CtaBanner: {
      fields: {
        title: { type: 'text' },
        description: { type: 'text' },
        buttonText: { type: 'text' },
        buttonUrl: { type: 'text' },
        variant: {
          type: 'select',
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
      render: ({ title, description, buttonText, buttonUrl, variant }) => {
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

    // Interactive Components
    ButtonGroup: {
      fields: {
        buttons: { type: 'textarea' },
        align: {
          type: 'select',
          options: [
            { label: 'Left', value: 'left' },
            { label: 'Center', value: 'center' },
            { label: 'Right', value: 'right' },
          ],
        },
      },
      defaultProps: {
        buttons: 'Shop Now|/products\nLearn More|/about',
        align: 'left',
      },
      render: ({ buttons, align }) => {
        const buttonList = buttons.split('\n').filter(Boolean).map((b: string) => {
          const [label, url] = b.split('|')
          return { label: label?.trim(), url: url?.trim() || '#' }
        })
        const alignMap: Record<string, string> = {
          left: 'justify-start', center: 'justify-center', right: 'justify-end',
        }
        return (
          <div className={`flex flex-wrap gap-3 ${alignMap[align]}`}>
            {buttonList.map((btn: { label: string; url: string }, i: number) => (
              <a
                key={i}
                href={btn.url}
                className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
                  i === 0
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {btn.label}
              </a>
            ))}
          </div>
        )
      },
    },

    Accordion: {
      fields: {
        items: { type: 'textarea' },
      },
      defaultProps: {
        items: 'What is your return policy?|We offer a 30-day money-back guarantee on all products.\nHow long does shipping take?|Standard shipping takes 5-7 business days.\nDo you offer international shipping?|Yes, we ship to over 50 countries worldwide.',
      },
      render: ({ items }) => {
        const faqItems = items.split('\n').filter(Boolean).map((item: string) => {
          const [question, answer] = item.split('|')
          return { question: question?.trim(), answer: answer?.trim() }
        })
        return (
          <div className="divide-y divide-gray-200 border-y border-gray-200">
            {faqItems.map((item: { question: string; answer: string }, i: number) => (
              <details key={i} className="group">
                <summary className="flex cursor-pointer items-center justify-between py-4 font-medium">
                  {item.question}
                  <span className="ml-4 shrink-0 text-gray-400 group-open:rotate-180 transition-transform">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </summary>
                <p className="pb-4 text-gray-600 leading-relaxed">{item.answer}</p>
              </details>
            ))}
          </div>
        )
      },
    },

    Testimonials: {
      fields: {
        items: { type: 'textarea' },
        columns: {
          type: 'select',
          options: [
            { label: '2 Columns', value: '2' },
            { label: '3 Columns', value: '3' },
          ],
        },
      },
      defaultProps: {
        items: 'Amazing quality!|Sarah M.|I love the products. Great craftsmanship and fast shipping.\nHighly recommend|John D.|Best online shopping experience I\'ve had. Will definitely order again.\nFive stars|Emily R.|Customer service was excellent and the product exceeded expectations.',
        columns: '3',
      },
      render: ({ items, columns }) => {
        const testimonials = items.split('\n').filter(Boolean).map((item: string) => {
          const parts = item.split('|')
          return { title: parts[0]?.trim(), author: parts[1]?.trim(), text: parts[2]?.trim() }
        })
        return (
          <div className={`grid grid-cols-1 md:grid-cols-${columns} gap-6`}>
            {testimonials.map((t: { title: string; author: string; text: string }, i: number) => (
              <div key={i} className="rounded-xl border border-gray-200 p-6">
                <div className="flex gap-1 mb-3 text-amber-400">
                  {Array.from({ length: 5 }).map((_, s) => (
                    <svg key={s} className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="font-semibold">{t.title}</p>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{t.text}</p>
                <p className="mt-3 text-xs font-medium text-gray-400">- {t.author}</p>
              </div>
            ))}
          </div>
        )
      },
    },

    ContactForm: {
      fields: {
        title: { type: 'text' },
        description: { type: 'text' },
        submitText: { type: 'text' },
      },
      defaultProps: {
        title: 'Get in Touch',
        description: 'Fill out the form below and we\'ll get back to you as soon as possible.',
        submitText: 'Send Message',
      },
      render: ({ title, description, submitText }) => (
        <div className="max-w-lg mx-auto">
          {title && <h2 className="text-2xl font-bold text-center">{title}</h2>}
          {description && <p className="mt-2 text-gray-500 text-center">{description}</p>}
          <div className="mt-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="Your name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input type="text" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" placeholder="How can we help?" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm" rows={4} placeholder="Your message..." />
            </div>
            <button className="w-full bg-gray-900 text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              {submitText}
            </button>
          </div>
        </div>
      ),
    },
  },
}
