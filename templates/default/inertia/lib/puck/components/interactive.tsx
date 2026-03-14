export const interactiveComponents = {
  ButtonGroup: {
    fields: {
      buttons: { type: 'textarea' as const },
      align: {
        type: 'select' as const,
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
    render: ({ buttons, align }: any) => {
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
      items: { type: 'textarea' as const },
    },
    defaultProps: {
      items: 'What is your return policy?|We offer a 30-day money-back guarantee on all products.\nHow long does shipping take?|Standard shipping takes 5-7 business days.\nDo you offer international shipping?|Yes, we ship to over 50 countries worldwide.',
    },
    render: ({ items }: any) => {
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
      items: { type: 'textarea' as const },
      columns: {
        type: 'select' as const,
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
    render: ({ items, columns }: any) => {
      const testimonials = items.split('\n').filter(Boolean).map((item: string) => {
        const parts = item.split('|')
        return { title: parts[0]?.trim(), author: parts[1]?.trim(), text: parts[2]?.trim() }
      })
      const testGridMap: Record<string, string> = {
        '2': 'grid-cols-1 md:grid-cols-2',
        '3': 'grid-cols-1 md:grid-cols-3',
      }
      return (
        <div className={`grid ${testGridMap[columns] || 'grid-cols-1 md:grid-cols-3'} gap-6`}>
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
      title: { type: 'text' as const },
      description: { type: 'text' as const },
      submitText: { type: 'text' as const },
    },
    defaultProps: {
      title: 'Get in Touch',
      description: 'Fill out the form below and we\'ll get back to you as soon as possible.',
      submitText: 'Send Message',
    },
    render: ({ title, description, submitText }: any) => (
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
}
