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

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          {page?.title || 'About Us'}
        </h1>

        {page?.content ? (
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-8">
              Welcome to {store.name}! We're passionate about bringing you the best products
              and exceptional shopping experience.
            </p>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Story</h2>
              <p className="text-gray-600">
                {store.name} was founded with a simple mission: to provide our customers
                with high-quality products at competitive prices, backed by outstanding
                customer service. We believe shopping should be easy, enjoyable, and reliable.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Mission</h2>
              <p className="text-gray-600">
                We strive to curate and deliver products that enhance your life.
                Every item in our catalog is carefully selected to meet our high standards
                for quality, value, and customer satisfaction.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Why Choose Us</h2>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>Quality products you can trust</li>
                <li>Fast and reliable shipping</li>
                <li>Excellent customer support</li>
                <li>Easy returns and refunds</li>
                <li>Secure payment processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get in Touch</h2>
              <p className="text-gray-600">
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
