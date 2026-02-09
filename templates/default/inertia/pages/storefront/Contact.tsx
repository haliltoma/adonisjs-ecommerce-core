import { useState } from 'react'
import StorefrontLayout from '../../components/storefront/StorefrontLayout'
import Seo from '../../components/shared/Seo'

interface Props {
  store: { name: string; logoUrl: string | null }
  page: {
    title: string
    content: string
  } | null
}

export default function Contact({ store, page }: Props) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, this would submit to an API endpoint
    setSubmitted(true)
  }

  return (
    <StorefrontLayout>
      <Seo
        title="Contact Us"
        description={`Get in touch with ${store.name}. We'd love to hear from you!`}
        storeName={store.name}
        baseUrl={baseUrl}
        canonical={`${baseUrl}/contact`}
      />

      {/* Hero */}
      <section className="relative py-20 grain">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              Get in Touch
            </span>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">
              {page?.title || 'Contact Us'}
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {page?.content && (
          <div
            className="prose prose-lg max-w-none mb-12 prose-headings:font-display prose-a:text-accent animate-fade-up delay-100"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Form */}
          <div className="animate-fade-up delay-200">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              Send a Message
            </span>
            <h2 className="font-display text-2xl tracking-tight mt-2 mb-8">We'd love to hear from you</h2>

            {submitted ? (
              <div className="rounded-2xl bg-secondary/50 border border-accent/20 p-8 animate-fade-up">
                <h3 className="font-display text-xl mb-2">Thank you for your message!</h3>
                <p className="text-muted-foreground">We'll get back to you as soon as possible.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full h-11 rounded-lg border border-border/60 bg-background px-4 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full h-11 rounded-lg border border-border/60 bg-background px-4 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full h-11 rounded-lg border border-border/60 bg-background px-4 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full rounded-lg border border-border/60 bg-background px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full h-11 rounded-lg bg-primary px-6 text-primary-foreground text-sm font-semibold tracking-wide uppercase hover:bg-primary/90 transition-colors"
                >
                  Send Message
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="animate-fade-up delay-300">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              Other Ways
            </span>
            <h2 className="font-display text-2xl tracking-tight mt-2 mb-8">Reach us directly</h2>

            <div className="space-y-8">
              <div className="rounded-2xl bg-secondary/50 p-6">
                <h3 className="font-display text-lg mb-2">Customer Support</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our team is here to help with any questions about orders, products, or your account.
                </p>
              </div>

              <div className="rounded-2xl bg-secondary/50 p-6">
                <h3 className="font-display text-lg mb-2">Business Hours</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Monday - Friday: 9:00 AM - 6:00 PM<br />
                  Saturday: 10:00 AM - 4:00 PM<br />
                  Sunday: Closed
                </p>
              </div>

              <div className="rounded-2xl bg-secondary/50 p-6">
                <h3 className="font-display text-lg mb-2">Response Time</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We typically respond to all inquiries within 24-48 hours during business days.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  )
}
