import StorefrontLayout from '../../components/storefront/StorefrontLayout'
import Seo from '../../components/shared/Seo'

interface Props {
  store: { name: string; logoUrl: string | null }
  page: {
    title: string
    content: string
    metaTitle?: string
    metaDescription?: string
  }
}

export default function Page({ store, page }: Props) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <StorefrontLayout>
      <Seo
        title={page.metaTitle || page.title}
        description={page.metaDescription || `${page.title} - ${store.name}`}
        storeName={store.name}
        baseUrl={baseUrl}
      />

      {/* Hero */}
      <section className="relative py-20 grain">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              {store.name}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">
              {page.title}
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <div
          className="prose prose-lg max-w-none prose-headings:font-display prose-a:text-accent prose-a:no-underline hover:prose-a:underline animate-fade-up delay-200"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      </div>
    </StorefrontLayout>
  )
}
