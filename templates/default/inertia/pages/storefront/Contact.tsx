import { useForm } from '@inertiajs/react'
import StorefrontLayout from '../../components/storefront/StorefrontLayout'
import Seo from '../../components/shared/Seo'
import { useTranslation } from '@/hooks/use-translation'

interface Props {
  store: { name: string; logoUrl: string | null }
  page: {
    title: string
    content: string
  } | null
}

export default function Contact({ store, page }: Props) {
  const { t } = useTranslation()
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
  const { data, setData, post, processing, errors, wasSuccessful } = useForm({
    name: '',
    email: '',
    subject: '',
    message: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    post('/contact')
  }

  return (
    <StorefrontLayout>
      <Seo
        title={t('storefront.contactPage.contactUs')}
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
              {t('storefront.contactPage.getInTouch')}
            </span>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">
              {page?.title || t('storefront.contactPage.contactUs')}
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
              {t('storefront.contactPage.sendMessage')}
            </span>
            <h2 className="font-display text-2xl tracking-tight mt-2 mb-8">{t('storefront.contactPage.formTitle')}</h2>

            {wasSuccessful ? (
              <div className="rounded-2xl bg-secondary/50 border border-accent/20 p-8 animate-fade-up">
                <h3 className="font-display text-xl mb-2">{t('storefront.contactPage.thankYou')}</h3>
                <p className="text-muted-foreground">{t('storefront.contactPage.thankYouDesc')}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    {t('storefront.contactPage.name')}
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    className="w-full h-11 rounded-lg border border-border/60 bg-background px-4 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    {t('storefront.contactPage.email')}
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    className="w-full h-11 rounded-lg border border-border/60 bg-background px-4 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="subject" className="block text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    {t('storefront.contactPage.subject')}
                  </label>
                  <input
                    type="text"
                    id="subject"
                    required
                    value={data.subject}
                    onChange={(e) => setData('subject', e.target.value)}
                    className="w-full h-11 rounded-lg border border-border/60 bg-background px-4 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-xs text-red-500">{errors.subject}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
                    {t('storefront.contactPage.message')}
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    required
                    value={data.message}
                    onChange={(e) => setData('message', e.target.value)}
                    className="w-full rounded-lg border border-border/60 bg-background px-4 py-3 text-sm focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-500">{errors.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={processing}
                  className="w-full h-11 rounded-lg bg-primary px-6 text-primary-foreground text-sm font-semibold tracking-wide uppercase hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {processing ? t('storefront.contactPage.sending') : t('storefront.contactPage.send')}
                </button>
              </form>
            )}
          </div>

          {/* Contact Info */}
          <div className="animate-fade-up delay-300">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              {t('storefront.contactPage.otherWays')}
            </span>
            <h2 className="font-display text-2xl tracking-tight mt-2 mb-8">{t('storefront.contactPage.reachUs')}</h2>

            <div className="space-y-8">
              <div className="rounded-2xl bg-secondary/50 p-6">
                <h3 className="font-display text-lg mb-2">{t('storefront.contactPage.customerSupport')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('storefront.contactPage.customerSupportDesc')}
                </p>
              </div>

              <div className="rounded-2xl bg-secondary/50 p-6">
                <h3 className="font-display text-lg mb-2">{t('storefront.contactPage.businessHours')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('storefront.contactPage.businessHoursText')}<br />
                  {t('storefront.contactPage.businessHoursSat')}<br />
                  {t('storefront.contactPage.businessHoursSun')}
                </p>
              </div>

              <div className="rounded-2xl bg-secondary/50 p-6">
                <h3 className="font-display text-lg mb-2">{t('storefront.contactPage.responseTime')}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t('storefront.contactPage.responseTimeDesc')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StorefrontLayout>
  )
}
