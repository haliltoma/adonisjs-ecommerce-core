import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import Seo from '@/components/shared/Seo'
import { Card, CardContent } from '@/components/ui/card'
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

export default function Terms({ store, page }: Props) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <StorefrontLayout>
      <Seo
        title={page?.metaTitle || 'Terms of Service'}
        description={
          page?.metaDescription ||
          `Read the terms of service for ${store.name}. By using our website, you agree to these terms.`
        }
        storeName={store.name}
        baseUrl={baseUrl}
        canonical={`${baseUrl}/terms`}
      />

      {/* Hero */}
      <section className="relative py-20 grain">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              Legal
            </span>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">
              {page?.title || 'Terms of Service'}
            </h1>
            <p className="text-muted-foreground mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {page?.content ? (
          <div
            className="prose prose-lg max-w-none prose-headings:font-display prose-a:text-accent animate-fade-up delay-200"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        ) : (
          <Card className="animate-fade-up delay-200">
            <CardContent className="pt-8 space-y-10">
              {/* Agreement */}
              <section>
                <h2 className="font-display text-xl mb-4">1. Agreement to Terms</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  By accessing or using the {store.name} website and services (collectively,
                  the "Services"), you agree to be bound by these Terms of Service ("Terms").
                  If you do not agree to these Terms, you may not use our Services.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We reserve the right to update or modify these Terms at any time. Changes
                  will be effective upon posting to our website. Your continued use of the
                  Services after any changes constitutes acceptance of the updated Terms.
                </p>
              </section>

              <Separator className="bg-border/60" />

              {/* Use of Services */}
              <section>
                <h2 className="font-display text-xl mb-4">2. Use of Services</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  You agree to use our Services only for lawful purposes and in accordance
                  with these Terms. You agree not to:
                </p>
                <ul className="text-muted-foreground text-sm space-y-2 list-disc pl-6">
                  <li>Use the Services in any way that violates applicable laws or regulations</li>
                  <li>Attempt to gain unauthorized access to any part of the Services</li>
                  <li>Interfere with or disrupt the integrity or performance of the Services</li>
                  <li>Use automated systems or software to extract data from the website (scraping)</li>
                  <li>Impersonate another person or entity</li>
                  <li>Use the Services to transmit spam, malware, or other harmful content</li>
                  <li>Engage in fraudulent activity, including placing false orders or providing false information</li>
                </ul>
              </section>

              <Separator className="bg-border/60" />

              {/* Account */}
              <section>
                <h2 className="font-display text-xl mb-4">3. Account Registration</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  To access certain features of our Services, you may need to create an account.
                  When creating an account, you agree to:
                </p>
                <ul className="text-muted-foreground text-sm space-y-2 list-disc pl-6">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Keep your password confidential and secure</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                </ul>
                <p className="text-muted-foreground text-sm leading-relaxed mt-3">
                  We reserve the right to suspend or terminate your account if we suspect
                  any unauthorized use or violation of these Terms.
                </p>
              </section>

              <Separator className="bg-border/60" />

              {/* Products and Pricing */}
              <section>
                <h2 className="font-display text-xl mb-4">4. Products and Pricing</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  We make every effort to display our products accurately, including
                  descriptions, images, and pricing. However, we do not guarantee that
                  product descriptions, images, pricing, or other content on our website
                  is error-free, complete, or current.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  We reserve the right to:
                </p>
                <ul className="text-muted-foreground text-sm space-y-2 list-disc pl-6">
                  <li>Correct any errors in pricing or product information</li>
                  <li>Change prices at any time without prior notice</li>
                  <li>Limit quantities available for purchase</li>
                  <li>Refuse or cancel any order that contains pricing errors</li>
                  <li>Discontinue any product at any time</li>
                </ul>
              </section>

              <Separator className="bg-border/60" />

              {/* Orders */}
              <section>
                <h2 className="font-display text-xl mb-4">5. Orders and Payment</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  When you place an order through our Services, you are making an offer to
                  purchase. All orders are subject to acceptance by us. We may refuse or
                  cancel any order for any reason, including but not limited to product
                  availability, errors in pricing or product information, or suspected fraud.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  By providing payment information, you represent and warrant that:
                </p>
                <ul className="text-muted-foreground text-sm space-y-2 list-disc pl-6">
                  <li>You are authorized to use the payment method provided</li>
                  <li>The payment information is accurate and complete</li>
                  <li>You will pay the total amount due, including applicable taxes and shipping</li>
                </ul>
              </section>

              <Separator className="bg-border/60" />

              {/* Shipping and Delivery */}
              <section>
                <h2 className="font-display text-xl mb-4">6. Shipping and Delivery</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Shipping and delivery times are estimates and are not guaranteed. We are
                  not responsible for delays caused by shipping carriers, customs processing,
                  weather, or other circumstances beyond our control. Risk of loss and title
                  for items purchased transfer to you upon delivery to the shipping carrier.
                  For more details, please review our{' '}
                  <a href="/shipping" className="text-accent underline underline-offset-4">
                    Shipping Policy
                  </a>
                  .
                </p>
              </section>

              <Separator className="bg-border/60" />

              {/* Returns */}
              <section>
                <h2 className="font-display text-xl mb-4">7. Returns and Refunds</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Returns and refunds are subject to our{' '}
                  <a href="/returns" className="text-accent underline underline-offset-4">
                    Return Policy
                  </a>
                  . Please review the policy for details on eligibility, timeframes, and
                  the return process. We reserve the right to refuse returns that do not
                  meet our return policy requirements.
                </p>
              </section>

              <Separator className="bg-border/60" />

              {/* Intellectual Property */}
              <section>
                <h2 className="font-display text-xl mb-4">8. Intellectual Property</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  All content on our website, including text, graphics, logos, images, product
                  descriptions, and software, is the property of {store.name} or its licensors
                  and is protected by copyright, trademark, and other intellectual property laws.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  You may not reproduce, distribute, modify, display, perform, or otherwise
                  use any content from our website without our prior written permission, except
                  for personal, non-commercial use in connection with purchasing products from
                  our store.
                </p>
              </section>

              <Separator className="bg-border/60" />

              {/* Limitation of Liability */}
              <section>
                <h2 className="font-display text-xl mb-4">9. Limitation of Liability</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  To the fullest extent permitted by law, {store.name} and its officers,
                  directors, employees, and agents shall not be liable for any indirect,
                  incidental, special, consequential, or punitive damages arising out of or
                  related to your use of our Services.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our total liability for any claim arising out of or relating to these Terms
                  or our Services shall not exceed the amount you paid to us for the product
                  or service giving rise to the claim.
                </p>
              </section>

              <Separator className="bg-border/60" />

              {/* Disclaimer */}
              <section>
                <h2 className="font-display text-xl mb-4">10. Disclaimer of Warranties</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our Services are provided "as is" and "as available" without warranties of
                  any kind, either express or implied, including but not limited to implied
                  warranties of merchantability, fitness for a particular purpose, and
                  non-infringement. We do not warrant that our Services will be uninterrupted,
                  error-free, or free of viruses or other harmful components.
                </p>
              </section>

              <Separator className="bg-border/60" />

              {/* Governing Law */}
              <section>
                <h2 className="font-display text-xl mb-4">11. Governing Law</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  These Terms shall be governed by and construed in accordance with the laws
                  of the jurisdiction in which {store.name} is established, without regard
                  to conflict of law principles. Any disputes arising under or in connection
                  with these Terms shall be subject to the exclusive jurisdiction of the
                  courts in that jurisdiction.
                </p>
              </section>

              <Separator className="bg-border/60" />

              {/* Severability */}
              <section>
                <h2 className="font-display text-xl mb-4">12. Severability</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  If any provision of these Terms is found to be invalid or unenforceable by
                  a court of competent jurisdiction, the remaining provisions shall continue
                  in full force and effect. The invalid or unenforceable provision shall be
                  modified to the minimum extent necessary to make it valid and enforceable.
                </p>
              </section>

              <Separator className="bg-border/60" />

              {/* Contact */}
              <section>
                <h2 className="font-display text-xl mb-4">13. Contact Us</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us
                  through our{' '}
                  <a href="/contact" className="text-accent underline underline-offset-4">
                    contact page
                  </a>
                  . We will respond to your inquiry as promptly as possible.
                </p>
              </section>
            </CardContent>
          </Card>
        )}
      </div>
    </StorefrontLayout>
  )
}
