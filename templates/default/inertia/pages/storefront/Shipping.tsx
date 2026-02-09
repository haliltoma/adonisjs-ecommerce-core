import { Link } from '@inertiajs/react'
import { Clock, Globe, Package, Shield, Truck } from 'lucide-react'

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

export default function Shipping({ store, page }: Props) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <StorefrontLayout>
      <Seo
        title={page?.metaTitle || 'Shipping Information'}
        description={
          page?.metaDescription ||
          `Learn about shipping options, delivery times, and costs at ${store.name}.`
        }
        storeName={store.name}
        baseUrl={baseUrl}
        canonical={`${baseUrl}/shipping`}
      />

      {/* Hero */}
      <section className="relative py-20 grain">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              Delivery Details
            </span>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">
              {page?.title || 'Shipping Information'}
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
            {/* Shipping Methods */}
            <section className="animate-fade-up delay-100">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                Options
              </span>
              <h2 className="font-display text-2xl tracking-tight mt-2 mb-8">Shipping Methods</h2>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  {
                    icon: Package,
                    title: 'Standard Shipping',
                    desc: 'Delivery in 5-7 business days. Available for all orders.',
                    price: '$4.99',
                    note: 'Free on orders over $100',
                    delay: 'delay-200',
                  },
                  {
                    icon: Truck,
                    title: 'Express Shipping',
                    desc: 'Delivery in 2-3 business days. Priority handling and tracking.',
                    price: '$12.99',
                    note: 'Free on orders over $200',
                    delay: 'delay-300',
                  },
                  {
                    icon: Clock,
                    title: 'Overnight Shipping',
                    desc: 'Next business day delivery. Order by 2 PM for same-day dispatch.',
                    price: '$24.99',
                    note: 'Available for select locations',
                    delay: 'delay-400',
                  },
                ].map((method) => (
                  <Card key={method.title} className={`card-hover animate-fade-up ${method.delay}`}>
                    <CardHeader>
                      <div className="bg-accent/10 mb-2 flex h-10 w-10 items-center justify-center rounded-lg">
                        <method.icon className="text-accent h-5 w-5" />
                      </div>
                      <CardTitle className="font-display">{method.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm">{method.desc}</p>
                      <p className="mt-3 font-semibold">{method.price}</p>
                      <p className="text-muted-foreground text-xs">{method.note}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <Separator className="bg-border/60" />

            {/* Delivery Times */}
            <section className="animate-fade-up">
              <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                Timeline
              </span>
              <h2 className="font-display text-2xl tracking-tight mt-2 mb-8">Estimated Delivery Times</h2>
              <Card>
                <CardContent className="pt-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border/60">
                          <th className="pb-3 text-left text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">Region</th>
                          <th className="pb-3 text-left text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">Standard</th>
                          <th className="pb-3 text-left text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">Express</th>
                          <th className="pb-3 text-left text-xs font-semibold tracking-[0.15em] uppercase text-muted-foreground">Overnight</th>
                        </tr>
                      </thead>
                      <tbody className="text-muted-foreground">
                        <tr className="border-b border-border/60">
                          <td className="py-3 font-medium text-foreground">Domestic (US)</td>
                          <td className="py-3">5-7 business days</td>
                          <td className="py-3">2-3 business days</td>
                          <td className="py-3">1 business day</td>
                        </tr>
                        <tr className="border-b border-border/60">
                          <td className="py-3 font-medium text-foreground">Canada</td>
                          <td className="py-3">7-10 business days</td>
                          <td className="py-3">3-5 business days</td>
                          <td className="py-3">2-3 business days</td>
                        </tr>
                        <tr className="border-b border-border/60">
                          <td className="py-3 font-medium text-foreground">Europe</td>
                          <td className="py-3">10-14 business days</td>
                          <td className="py-3">5-7 business days</td>
                          <td className="py-3">Not available</td>
                        </tr>
                        <tr>
                          <td className="py-3 font-medium text-foreground">Rest of World</td>
                          <td className="py-3">14-21 business days</td>
                          <td className="py-3">7-10 business days</td>
                          <td className="py-3">Not available</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </section>

            <Separator className="bg-border/60" />

            {/* International Shipping */}
            <section className="animate-fade-up">
              <div className="flex items-start gap-4">
                <div className="bg-accent/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Globe className="text-accent h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                    Worldwide
                  </span>
                  <h2 className="font-display text-2xl tracking-tight mt-1 mb-4">International Shipping</h2>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    We ship to most countries worldwide. International orders may be subject
                    to import duties and taxes, which are the responsibility of the recipient.
                    Customs fees are not included in the shipping cost or product price.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    Please note that delivery times for international orders may vary depending
                    on customs processing in your country. We are not responsible for delays
                    caused by customs inspections.
                  </p>
                </div>
              </div>
            </section>

            <Separator className="bg-border/60" />

            {/* Order Tracking */}
            <section className="animate-fade-up">
              <div className="flex items-start gap-4">
                <div className="bg-accent/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
                  <Shield className="text-accent h-5 w-5" />
                </div>
                <div>
                  <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                    Stay Updated
                  </span>
                  <h2 className="font-display text-2xl tracking-tight mt-1 mb-4">Order Tracking</h2>
                  <p className="text-muted-foreground mb-4 leading-relaxed">
                    Once your order ships, you will receive a confirmation email with a tracking
                    number. You can track your order status at any time through your{' '}
                    <Link href="/account/orders" className="text-accent underline underline-offset-4">
                      account dashboard
                    </Link>
                    .
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have not received your tracking information within 48 hours of placing
                    your order, please{' '}
                    <Link href="/contact" className="text-accent underline underline-offset-4">
                      contact our support team
                    </Link>
                    .
                  </p>
                </div>
              </div>
            </section>

            <Separator className="bg-border/60" />

            {/* Free Shipping */}
            <section className="rounded-2xl bg-secondary/50 p-10 text-center animate-fade-up">
              <Truck className="text-accent mx-auto mb-4 h-10 w-10" />
              <h2 className="font-display text-2xl tracking-tight mb-3">Free Shipping on Orders Over $100</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Enjoy free standard shipping on all domestic orders over $100.
                No coupon code needed -- the discount is applied automatically at checkout.
              </p>
            </section>
          </div>
        )}
      </div>
    </StorefrontLayout>
  )
}
