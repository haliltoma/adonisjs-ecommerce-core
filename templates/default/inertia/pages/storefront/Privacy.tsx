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

export default function Privacy({ store, page }: Props) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <StorefrontLayout>
      <Seo
        title={page?.metaTitle || 'Privacy Policy'}
        description={
          page?.metaDescription ||
          `Read the privacy policy for ${store.name}. Learn how we collect, use, and protect your personal information.`
        }
        storeName={store.name}
        baseUrl={baseUrl}
        canonical={`${baseUrl}/privacy`}
      />

      {/* Hero */}
      <section className="relative py-20 grain">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              Your Data, Protected
            </span>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">
              {page?.title || 'Privacy Policy'}
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
              {/* Introduction */}
              <section>
                <h2 className="font-display text-xl mb-4">1. Introduction</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  {store.name} ("we," "our," or "us") is committed to protecting your
                  privacy. This Privacy Policy explains how we collect, use, disclose, and
                  safeguard your information when you visit our website and use our services.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  By using our website and services, you agree to the collection and use of
                  information in accordance with this policy. If you do not agree with the
                  terms of this Privacy Policy, please do not access our website.
                </p>
              </section>

              <Separator className="bg-border/60" />

              {/* Information We Collect */}
              <section>
                <h2 className="font-display text-xl mb-4">2. Information We Collect</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Personal Information</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      When you create an account, place an order, or contact us, we may
                      collect personal information such as:
                    </p>
                    <ul className="text-muted-foreground text-sm mt-2 space-y-1 list-disc pl-6">
                      <li>Name and email address</li>
                      <li>Billing and shipping addresses</li>
                      <li>Phone number</li>
                      <li>Payment information (processed securely through our payment providers)</li>
                      <li>Account credentials</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Automatically Collected Information</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      When you visit our website, we automatically collect certain information, including:
                    </p>
                    <ul className="text-muted-foreground text-sm mt-2 space-y-1 list-disc pl-6">
                      <li>IP address and browser type</li>
                      <li>Device information and operating system</li>
                      <li>Pages visited and time spent on our website</li>
                      <li>Referring website addresses</li>
                      <li>Cookies and similar tracking technologies</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator className="bg-border/60" />

              {/* How We Use Your Information */}
              <section>
                <h2 className="font-display text-xl mb-4">3. How We Use Your Information</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  We use the information we collect for the following purposes:
                </p>
                <ul className="text-muted-foreground text-sm space-y-2 list-disc pl-6">
                  <li>To process and fulfill your orders, including shipping and payment processing</li>
                  <li>To create and manage your account</li>
                  <li>To communicate with you about your orders, account, and our services</li>
                  <li>To send promotional communications (with your consent)</li>
                  <li>To improve our website, products, and customer service</li>
                  <li>To detect and prevent fraud or unauthorized access</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>

              <Separator className="bg-border/60" />

              {/* Information Sharing */}
              <section>
                <h2 className="font-display text-xl mb-4">4. Information Sharing</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  We do not sell your personal information to third parties. We may share
                  your information only in the following circumstances:
                </p>
                <ul className="text-muted-foreground text-sm space-y-2 list-disc pl-6">
                  <li>
                    <strong>Service Providers:</strong> We share information with third-party
                    service providers who assist in operating our website, processing payments,
                    fulfilling orders, and delivering products.
                  </li>
                  <li>
                    <strong>Legal Requirements:</strong> We may disclose information when required
                    by law, regulation, or legal process.
                  </li>
                  <li>
                    <strong>Business Transfers:</strong> In the event of a merger, acquisition,
                    or sale of assets, your information may be transferred as part of the transaction.
                  </li>
                  <li>
                    <strong>With Your Consent:</strong> We may share information for purposes
                    not covered by this policy with your explicit consent.
                  </li>
                </ul>
              </section>

              <Separator className="bg-border/60" />

              {/* Cookies */}
              <section>
                <h2 className="font-display text-xl mb-4">5. Cookies and Tracking Technologies</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  We use cookies and similar tracking technologies to enhance your browsing
                  experience and analyze website traffic. Cookies are small data files stored
                  on your device that help us remember your preferences and improve our services.
                </p>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  Types of cookies we use:
                </p>
                <ul className="text-muted-foreground text-sm space-y-2 list-disc pl-6">
                  <li>
                    <strong>Essential Cookies:</strong> Required for the website to function
                    properly, including session management and security features.
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand how visitors interact
                    with our website to improve performance and user experience.
                  </li>
                  <li>
                    <strong>Marketing Cookies:</strong> Used to deliver relevant advertisements
                    and measure the effectiveness of our marketing campaigns.
                  </li>
                </ul>
                <p className="text-muted-foreground text-sm leading-relaxed mt-3">
                  You can manage your cookie preferences through your browser settings. Please
                  note that disabling certain cookies may affect the functionality of our website.
                </p>
              </section>

              <Separator className="bg-border/60" />

              {/* Data Security */}
              <section>
                <h2 className="font-display text-xl mb-4">6. Data Security</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We implement appropriate technical and organizational security measures to
                  protect your personal information against unauthorized access, alteration,
                  disclosure, or destruction. These measures include SSL encryption, secure
                  payment processing, access controls, and regular security assessments.
                  However, no method of transmission over the internet is completely secure,
                  and we cannot guarantee absolute security.
                </p>
              </section>

              <Separator className="bg-border/60" />

              {/* Your Rights */}
              <section>
                <h2 className="font-display text-xl mb-4">7. Your Rights</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                  Depending on your location, you may have the following rights regarding your personal data:
                </p>
                <ul className="text-muted-foreground text-sm space-y-2 list-disc pl-6">
                  <li>
                    <strong>Access:</strong> Request a copy of the personal information we hold about you.
                  </li>
                  <li>
                    <strong>Correction:</strong> Request correction of inaccurate or incomplete information.
                  </li>
                  <li>
                    <strong>Deletion:</strong> Request deletion of your personal information,
                    subject to certain legal exceptions.
                  </li>
                  <li>
                    <strong>Opt-Out:</strong> Opt out of marketing communications at any time
                    by clicking the unsubscribe link in our emails or updating your account settings.
                  </li>
                  <li>
                    <strong>Data Portability:</strong> Request a copy of your data in a structured,
                    commonly used format.
                  </li>
                </ul>
              </section>

              <Separator className="bg-border/60" />

              {/* Children */}
              <section>
                <h2 className="font-display text-xl mb-4">8. Children's Privacy</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Our website and services are not directed to individuals under the age of 16.
                  We do not knowingly collect personal information from children. If we become
                  aware that we have collected personal information from a child under 16, we
                  will take steps to delete such information promptly.
                </p>
              </section>

              <Separator className="bg-border/60" />

              {/* Changes */}
              <section>
                <h2 className="font-display text-xl mb-4">9. Changes to This Policy</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We may update this Privacy Policy from time to time to reflect changes in
                  our practices or applicable laws. We will notify you of any material changes
                  by posting the updated policy on our website with a new "Last Updated" date.
                  We encourage you to review this policy periodically to stay informed about
                  how we protect your information.
                </p>
              </section>

              <Separator className="bg-border/60" />

              {/* Contact */}
              <section>
                <h2 className="font-display text-xl mb-4">10. Contact Us</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  If you have any questions or concerns about this Privacy Policy or our data
                  practices, please contact us through our{' '}
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
