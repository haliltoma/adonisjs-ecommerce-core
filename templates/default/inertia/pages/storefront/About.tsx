import StorefrontLayout from '../../components/storefront/StorefrontLayout'
import Seo from '../../components/shared/Seo'

interface Props {
  store: { name: string; logoUrl: string | null }
  page: {
    title: string
    content: string
    metaTitle?: string
    metaDescription?: string
  } | null
}

export default function About({ store, page }: Props) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <StorefrontLayout>
      <Seo
        title={page?.metaTitle || 'About Us'}
        description={page?.metaDescription || `Learn more about ${store.name} - our story, mission, and values.`}
        storeName={store.name}
        baseUrl={baseUrl}
        canonical={`${baseUrl}/about`}
      />

      {/* Hero */}
      <section className="relative py-20 grain">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              Our Story
            </span>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">
              {page?.title || 'About Us'}
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {page?.content ? (
          <div
            className="prose prose-lg max-w-none prose-headings:font-display prose-a:text-accent prose-a:no-underline hover:prose-a:underline animate-fade-up delay-200"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <div className="space-y-16">
            <div className="animate-fade-up delay-100">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Welcome to {store.name}! We're passionate about bringing you the best products
                and exceptional shopping experience.
              </p>
            </div>

            <section className="animate-fade-up delay-200">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                How It Began
              </span>
              <h2 className="font-display text-2xl tracking-tight mt-2 mb-4">Our Story</h2>
              <p className="text-muted-foreground leading-relaxed">
                {store.name} was founded with a simple mission: to provide our customers
                with high-quality products at competitive prices, backed by outstanding
                customer service. We believe shopping should be easy, enjoyable, and reliable.
              </p>
            </section>

            <section className="animate-fade-up delay-300">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                What Drives Us
              </span>
              <h2 className="font-display text-2xl tracking-tight mt-2 mb-4">Our Mission</h2>
              <p className="text-muted-foreground leading-relaxed">
                We strive to curate and deliver products that enhance your life.
                Every item in our catalog is carefully selected to meet our high standards
                for quality, value, and customer satisfaction.
              </p>
            </section>

            <section className="animate-fade-up delay-400">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                The Difference
              </span>
              <h2 className="font-display text-2xl tracking-tight mt-2 mb-4">Why Choose Us</h2>
              <ul className="space-y-3 text-muted-foreground">
                {[
                  'Quality products you can trust',
                  'Fast and reliable shipping',
                  'Excellent customer support',
                  'Easy returns and refunds',
                  'Secure payment processing',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="animate-fade-up delay-500 rounded-2xl bg-secondary/50 p-8 text-center">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                We'd Love to Hear From You
              </span>
              <h2 className="font-display text-2xl tracking-tight mt-2 mb-3">Get in Touch</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Have questions or feedback? We'd love to hear from you.
                Reach out to our customer support team and we'll get back to you as soon as possible.
              </p>
            </section>
          </div>
        )}
      </div>
    </StorefrontLayout>
  )
}
