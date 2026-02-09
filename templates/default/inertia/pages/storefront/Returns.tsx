import { Link } from '@inertiajs/react'
import { ArrowLeftRight, CheckCircle, Clock, HelpCircle, Package, RotateCcw } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import Seo from '@/components/shared/Seo'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface Props {
  store: { name: string; logoUrl: string | null }
  page: {
    title: string
    content: string
    metaTitle?: string
    metaDescription?: string
  } | null
}

export default function Returns({ store, page }: Props) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <StorefrontLayout>
      <Seo
        title={page?.metaTitle || 'Returns & Exchanges'}
        description={
          page?.metaDescription ||
          `Learn about our return and exchange policy at ${store.name}. Easy returns within 30 days.`
        }
        storeName={store.name}
        baseUrl={baseUrl}
        canonical={`${baseUrl}/returns`}
      />

      {/* Hero */}
      <section className="relative py-20 grain">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              Hassle-Free
            </span>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">
              {page?.title || 'Returns & Exchanges'}
            </h1>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        {page?.content ? (
          <div
            className="prose prose-lg max-w-none prose-headings:font-display prose-a:text-accent animate-fade-up delay-200"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <div className="space-y-16">
            {/* Return Policy Overview */}
            <section className="rounded-2xl bg-secondary/50 p-10 text-center animate-fade-up delay-100">
              <RotateCcw className="text-accent mx-auto mb-4 h-10 w-10" />
              <h2 className="font-display text-2xl tracking-tight mb-3">30-Day Return Policy</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                We want you to be completely satisfied with your purchase. If for any reason
                you are not happy with your order, you may return it within 30 days of
                delivery for a full refund or exchange.
              </p>
            </section>

            {/* How It Works */}
            <section className="animate-fade-up delay-200">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                Step by Step
              </span>
              <h2 className="font-display text-2xl tracking-tight mt-2 mb-8">How to Return an Item</h2>
              <div className="grid gap-6 sm:grid-cols-3">
                {[
                  {
                    step: '1',
                    title: 'Initiate Your Return',
                    desc: (
                      <>
                        Log in to your{' '}
                        <Link href="/account/orders" className="text-accent underline underline-offset-4">
                          account
                        </Link>{' '}
                        and select the order you wish to return. Click "Request Return" and
                        provide a reason for the return.
                      </>
                    ),
                  },
                  {
                    step: '2',
                    title: 'Ship Your Item',
                    desc: 'You will receive a prepaid return shipping label via email. Pack the item securely in its original packaging and drop it off at the nearest shipping location.',
                  },
                  {
                    step: '3',
                    title: 'Receive Your Refund',
                    desc: 'Once we receive and inspect the returned item, your refund will be processed within 5-7 business days to your original payment method.',
                  },
                ].map((item) => (
                  <Card key={item.step} className="card-hover">
                    <CardHeader>
                      <div className="bg-accent text-white mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
                        {item.step}
                      </div>
                      <CardTitle className="font-display text-lg">{item.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Separator className="bg-border/60" />

            {/* Return Conditions */}
            <section className="animate-fade-up">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                Guidelines
              </span>
              <h2 className="font-display text-2xl tracking-tight mt-2 mb-8">Return Conditions</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                <Card className="card-hover">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <CardTitle className="font-display text-lg">Eligible for Return</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 shrink-0">&#10003;</span>
                        Items in original, unused condition with all tags attached
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 shrink-0">&#10003;</span>
                        Items returned within 30 days of delivery
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 shrink-0">&#10003;</span>
                        Items in original packaging
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 shrink-0">&#10003;</span>
                        Defective or damaged items (within 60 days)
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-green-600 mt-1 shrink-0">&#10003;</span>
                        Items that do not match the product description
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <Card className="card-hover">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <HelpCircle className="h-5 w-5 text-red-600" />
                      <CardTitle className="font-display text-lg">Not Eligible for Return</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="text-muted-foreground space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1 shrink-0">&#10007;</span>
                        Items that have been used, washed, or altered
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1 shrink-0">&#10007;</span>
                        Items returned after 30 days of delivery
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1 shrink-0">&#10007;</span>
                        Gift cards and downloadable products
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1 shrink-0">&#10007;</span>
                        Items marked as final sale or clearance
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600 mt-1 shrink-0">&#10007;</span>
                        Personalized or custom-made items
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </section>

            <Separator className="bg-border/60" />

            {/* Exchanges */}
            <section className="animate-fade-up">
              <div className="flex items-start gap-4">
                <div className="bg-accent/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <ArrowLeftRight className="text-accent h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                    Swap It Out
                  </span>
                  <h2 className="font-display text-2xl tracking-tight mt-1 mb-4">Exchanges</h2>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Need a different size or color? We offer free exchanges on all eligible items.
                    Simply initiate a return through your account and select "Exchange" as the
                    reason. We will ship the replacement item as soon as we receive your return.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    If the replacement item is a different price, we will charge or refund the
                    difference to your original payment method.
                  </p>
                </div>
              </div>
            </section>

            <Separator className="bg-border/60" />

            {/* Refund Timeline */}
            <section className="animate-fade-up">
              <div className="flex items-start gap-4">
                <div className="bg-accent/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Clock className="text-accent h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                    When to Expect
                  </span>
                  <h2 className="font-display text-2xl tracking-tight mt-1 mb-4">Refund Timeline</h2>
                  <Card className="mt-4">
                    <CardContent className="pt-6">
                      <div className="space-y-4 text-sm">
                        <div className="flex justify-between border-b border-border/60 pb-3">
                          <span className="font-medium">Return received and inspected</span>
                          <span className="text-muted-foreground">1-2 business days</span>
                        </div>
                        <div className="flex justify-between border-b border-border/60 pb-3">
                          <span className="font-medium">Refund processed</span>
                          <span className="text-muted-foreground">3-5 business days</span>
                        </div>
                        <div className="flex justify-between border-b border-border/60 pb-3">
                          <span className="font-medium">Credit card refund appears</span>
                          <span className="text-muted-foreground">5-10 business days</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium">Store credit issued</span>
                          <span className="text-muted-foreground">Immediate upon approval</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <Separator className="bg-border/60" />

            {/* Damaged Items */}
            <section className="animate-fade-up">
              <div className="flex items-start gap-4">
                <div className="bg-accent/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Package className="text-accent h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                    We've Got You Covered
                  </span>
                  <h2 className="font-display text-2xl tracking-tight mt-1 mb-4">Damaged or Defective Items</h2>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    If you received a damaged or defective item, please{' '}
                    <Link href="/contact" className="text-accent underline underline-offset-4">
                      contact us
                    </Link>{' '}
                    within 60 days of delivery. Please include photos of the damage and your
                    order number so we can resolve the issue as quickly as possible.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    For damaged items, we will cover all return shipping costs and provide
                    a full refund or replacement at no additional charge.
                  </p>
                </div>
              </div>
            </section>

            {/* Contact CTA */}
            <section className="rounded-2xl bg-secondary/50 p-10 text-center animate-fade-up">
              <h2 className="font-display text-xl tracking-tight mb-3">Need Help With a Return?</h2>
              <p className="text-muted-foreground mb-6">
                Our customer support team is here to assist you with any return or exchange questions.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 h-11 text-sm font-semibold tracking-wide uppercase text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Contact Support
              </Link>
            </section>
          </div>
        )}
      </div>
    </StorefrontLayout>
  )
}
