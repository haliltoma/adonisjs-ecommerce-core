import { useState } from 'react'
import { Link } from '@inertiajs/react'
import { ChevronDown } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import Seo from '@/components/shared/Seo'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface Props {
  store: { name: string; logoUrl: string | null }
  page: {
    title: string
    content: string
    metaTitle?: string
    metaDescription?: string
  } | null
}

interface FaqItem {
  question: string
  answer: string
}

interface FaqSection {
  title: string
  items: FaqItem[]
}

function AccordionItem({ question, answer }: FaqItem) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border/60 last:border-b-0">
      <button
        type="button"
        className="flex w-full items-center justify-between py-4 text-left font-medium transition-colors hover:text-accent"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 text-accent transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 pb-4' : 'max-h-0'
        )}
      >
        <p className="text-muted-foreground text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  )
}

const faqSections: FaqSection[] = [
  {
    title: 'Orders & Payments',
    items: [
      {
        question: 'How do I place an order?',
        answer:
          'Simply browse our products, add items to your cart, and proceed to checkout. You can check out as a guest or create an account for faster future purchases and order tracking.',
      },
      {
        question: 'What payment methods do you accept?',
        answer:
          'We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, and Google Pay. All transactions are securely processed and encrypted.',
      },
      {
        question: 'Can I modify or cancel my order after placing it?',
        answer:
          'You can modify or cancel your order within 1 hour of placing it by contacting our support team. Once an order has been shipped, it cannot be cancelled, but you can initiate a return after delivery.',
      },
      {
        question: 'Is my payment information secure?',
        answer:
          'Yes, we use industry-standard SSL encryption and PCI-compliant payment processing to ensure your payment information is always protected. We never store your full credit card details on our servers.',
      },
      {
        question: 'Do you offer gift cards?',
        answer:
          'Yes, we offer digital gift cards in various denominations. Gift cards are delivered via email and can be used toward any purchase on our store. They never expire.',
      },
    ],
  },
  {
    title: 'Shipping & Delivery',
    items: [
      {
        question: 'How long does shipping take?',
        answer:
          'Standard shipping takes 5-7 business days, express shipping takes 2-3 business days, and overnight shipping delivers the next business day. International orders may take longer depending on the destination.',
      },
      {
        question: 'Do you offer free shipping?',
        answer:
          'Yes! We offer free standard shipping on all domestic orders over $100. No coupon code is needed -- the discount is applied automatically at checkout.',
      },
      {
        question: 'How can I track my order?',
        answer:
          'Once your order ships, you will receive a confirmation email with a tracking number. You can also track your order by logging into your account and visiting the Orders section.',
      },
      {
        question: 'Do you ship internationally?',
        answer:
          'Yes, we ship to most countries worldwide. International shipping rates and delivery times vary by destination. Please note that import duties and taxes may apply and are the responsibility of the recipient.',
      },
    ],
  },
  {
    title: 'Returns & Refunds',
    items: [
      {
        question: 'What is your return policy?',
        answer:
          'We offer a 30-day return policy on all eligible items. Items must be in original, unused condition with all tags attached. Some items such as final sale, personalized, and downloadable products are not eligible for return.',
      },
      {
        question: 'How do I initiate a return?',
        answer:
          'Log in to your account, go to your Orders page, select the order containing the item you wish to return, and click "Request Return." You will receive a prepaid return shipping label via email.',
      },
      {
        question: 'How long does it take to receive a refund?',
        answer:
          'Once we receive your returned item, it takes 1-2 business days to inspect and 3-5 business days to process the refund. The refund will appear on your credit card statement within 5-10 business days after processing.',
      },
      {
        question: 'Can I exchange an item instead of returning it?',
        answer:
          'Yes, we offer free exchanges on eligible items. When initiating your return, select "Exchange" and choose the size, color, or variant you would like instead. We will ship the replacement as soon as we receive your return.',
      },
    ],
  },
  {
    title: 'Account & Support',
    items: [
      {
        question: 'Do I need an account to place an order?',
        answer:
          'No, you can check out as a guest. However, creating an account allows you to track orders, save addresses, access order history, and enjoy a faster checkout experience.',
      },
      {
        question: 'How do I reset my password?',
        answer:
          'Click "Forgot Password" on the login page and enter your email address. You will receive an email with a link to reset your password. If you do not receive the email, please check your spam folder.',
      },
      {
        question: 'How can I contact customer support?',
        answer:
          'You can reach our customer support team through our Contact page, by email, or by phone during business hours (Monday-Friday, 9 AM - 6 PM EST). We typically respond to all inquiries within 24 hours.',
      },
      {
        question: 'How do I update my account information?',
        answer:
          'Log in to your account and navigate to the Profile section. From there, you can update your name, email, phone number, password, and manage your saved addresses.',
      },
    ],
  },
]

export default function Faq({ store, page }: Props) {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''

  return (
    <StorefrontLayout>
      <Seo
        title={page?.metaTitle || 'Frequently Asked Questions'}
        description={
          page?.metaDescription ||
          `Find answers to common questions about orders, shipping, returns, and more at ${store.name}.`
        }
        storeName={store.name}
        baseUrl={baseUrl}
        canonical={`${baseUrl}/faq`}
      />

      {/* Hero */}
      <section className="relative py-20 grain">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              Help Center
            </span>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">
              {page?.title || 'Frequently Asked Questions'}
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mt-4">
              Find answers to the most common questions about our store, products, and services.
              Can't find what you're looking for?{' '}
              <Link href="/contact" className="text-accent underline underline-offset-4">
                Contact us
              </Link>
              .
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
          <div className="space-y-12">
            {faqSections.map((section, sectionIdx) => (
              <section key={section.title} className={`animate-fade-up delay-${(sectionIdx + 1) * 100}`}>
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
                  {section.title}
                </span>
                <h2 className="font-display text-xl tracking-tight mt-1 mb-4">{section.title}</h2>
                <Card>
                  <CardContent className="pt-2">
                    {section.items.map((item) => (
                      <AccordionItem
                        key={item.question}
                        question={item.question}
                        answer={item.answer}
                      />
                    ))}
                  </CardContent>
                </Card>
              </section>
            ))}

            {/* Contact CTA */}
            <section className="rounded-2xl bg-secondary/50 p-10 text-center animate-fade-up delay-500">
              <h2 className="font-display text-xl tracking-tight mb-3">Still Have Questions?</h2>
              <p className="text-muted-foreground mb-6">
                Our customer support team is happy to help with any other questions you may have.
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
