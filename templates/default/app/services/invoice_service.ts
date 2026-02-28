import Order from '#models/order'
import Store from '#models/store'
import commerceConfig from '#config/commerce'
import { DateTime } from 'luxon'

/**
 * InvoiceService
 *
 * Generates invoice documents for orders.
 * Produces a structured HTML invoice that can be rendered as PDF
 * by the browser (print/save as PDF) or by a headless renderer.
 *
 * Also provides raw invoice data for custom rendering.
 */
export default class InvoiceService {
  /**
   * Generate a complete invoice data object for an order.
   */
  async getInvoiceData(orderId: string): Promise<InvoiceData> {
    const order = await Order.query()
      .where('id', orderId)
      .preload('items', (query) => {
        query.preload('product')
      })
      .preload('transactions')
      .preload('customer')
      .firstOrFail()

    const store = await Store.query().where('id', order.storeId).first()
    const storeConfig = (store?.config || {}) as Record<string, string>
    const storeName = store?.name || commerceConfig.store.name
    const storeEmail = storeConfig.email || commerceConfig.store.email
    const storePhone = storeConfig.phone || commerceConfig.store.phone
    const storeAddress = storeConfig.address || commerceConfig.store.address

    const invoiceNumber = this.generateInvoiceNumber(order)
    const issueDate = order.placedAt || order.createdAt
    const billingAddress = order.billingAddress as Record<string, string> | null
    const shippingAddress = order.shippingAddress as Record<string, string> | null

    const items: InvoiceItem[] = order.items.map((item) => ({
      sku: item.sku,
      title: item.title,
      variantTitle: item.variantTitle || undefined,
      quantity: item.quantity,
      unitPrice: Number(item.unitPrice),
      discountAmount: Number(item.discountAmount) || 0,
      taxAmount: Number(item.taxAmount) || 0,
      totalPrice: Number(item.totalPrice),
    }))

    const paidTransaction = order.transactions?.find(
      (t) => t.type === 'capture' && t.status === 'success'
    )

    return {
      invoiceNumber,
      orderNumber: order.orderNumber,
      orderId: order.id,
      issueDate: issueDate.toFormat('yyyy-MM-dd'),
      dueDate: issueDate.toFormat('yyyy-MM-dd'), // Same day for e-commerce

      store: {
        name: storeName,
        email: storeEmail,
        phone: storePhone,
        address: storeAddress,
      },

      customer: {
        name: order.customer
          ? `${order.customer.firstName} ${order.customer.lastName}`
          : billingAddress
            ? `${billingAddress.firstName || ''} ${billingAddress.lastName || ''}`
            : 'Guest Customer',
        email: order.email,
        phone: order.phone || undefined,
      },

      billingAddress: billingAddress
        ? this.formatAddress(billingAddress)
        : undefined,

      shippingAddress: shippingAddress
        ? this.formatAddress(shippingAddress)
        : undefined,

      items,

      subtotal: Number(order.subtotal),
      discountTotal: Number(order.discountTotal),
      couponCode: order.couponCode || undefined,
      taxTotal: Number(order.taxTotal),
      shippingTotal: Number(order.shippingTotal),
      grandTotal: Number(order.grandTotal),
      totalPaid: Number(order.totalPaid) || 0,
      totalRefunded: Number(order.totalRefunded) || 0,
      balanceDue: Number(order.grandTotal) - (Number(order.totalPaid) || 0),

      currency: order.currencyCode,
      paymentMethod: order.paymentMethod || paidTransaction?.paymentMethod || 'N/A',
      paymentStatus: order.paymentStatus,
      paidAt: paidTransaction?.processedAt?.toFormat('yyyy-MM-dd') || undefined,

      notes: order.notes || undefined,
    }
  }

  /**
   * Generate a printable HTML invoice.
   * Can be used with Inertia render or returned as raw HTML for PDF conversion.
   */
  async generateHtml(orderId: string): Promise<string> {
    const data = await this.getInvoiceData(orderId)
    return this.renderInvoiceHtml(data)
  }

  /**
   * Generate invoice number from order.
   * Format: INV-{YEAR}-{ORDER_NUMBER}
   */
  private generateInvoiceNumber(order: Order): string {
    const date = order.placedAt || order.createdAt
    const year = date.year
    return `INV-${year}-${order.orderNumber}`
  }

  private formatAddress(addr: Record<string, string>): FormattedAddress {
    return {
      name: [addr.firstName, addr.lastName].filter(Boolean).join(' '),
      company: addr.company || undefined,
      line1: addr.address1 || addr.addressLine1 || '',
      line2: addr.address2 || addr.addressLine2 || undefined,
      city: addr.city || '',
      state: addr.state || undefined,
      postalCode: addr.postalCode || addr.postal_code || '',
      country: addr.country || addr.countryCode || addr.country_code || '',
      phone: addr.phone || undefined,
    }
  }

  private formatCurrency(amount: number, currency: string): string {
    const symbols: Record<string, string> = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      TRY: '₺',
      JPY: '¥',
    }
    const symbol = symbols[currency] || currency + ' '
    return `${symbol}${amount.toFixed(2)}`
  }

  private renderInvoiceHtml(data: InvoiceData): string {
    const fc = (amount: number) => this.formatCurrency(amount, data.currency)

    const renderAddress = (addr: FormattedAddress) => `
      <div>${addr.name}</div>
      ${addr.company ? `<div>${addr.company}</div>` : ''}
      <div>${addr.line1}</div>
      ${addr.line2 ? `<div>${addr.line2}</div>` : ''}
      <div>${addr.city}${addr.state ? `, ${addr.state}` : ''} ${addr.postalCode}</div>
      <div>${addr.country}</div>
      ${addr.phone ? `<div>Tel: ${addr.phone}</div>` : ''}
    `

    const itemRows = data.items
      .map(
        (item) => `
        <tr>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;">
            <div style="font-weight:500;">${item.title}</div>
            ${item.variantTitle ? `<div style="font-size:12px;color:#666;">${item.variantTitle}</div>` : ''}
            ${item.sku ? `<div style="font-size:11px;color:#999;">SKU: ${item.sku}</div>` : ''}
          </td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">${fc(item.unitPrice)}</td>
          ${item.discountAmount > 0 ? `<td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;color:#dc2626;">-${fc(item.discountAmount)}</td>` : `<td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;">-</td>`}
          <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right;font-weight:500;">${fc(item.totalPrice)}</td>
        </tr>
      `
      )
      .join('')

    const isPaid = data.paymentStatus === 'paid' || data.totalPaid >= data.grandTotal

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invoice ${data.invoiceNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1a1a1a; line-height: 1.5; }
    @media print {
      body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
      .no-print { display: none !important; }
    }
  </style>
</head>
<body>
  <div style="max-width:800px;margin:0 auto;padding:40px;">

    <!-- Header -->
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
      <div>
        <h1 style="font-size:28px;font-weight:700;color:#111;">${data.store.name}</h1>
        ${data.store.address ? `<div style="color:#666;margin-top:4px;">${data.store.address}</div>` : ''}
        ${data.store.email ? `<div style="color:#666;">${data.store.email}</div>` : ''}
        ${data.store.phone ? `<div style="color:#666;">${data.store.phone}</div>` : ''}
      </div>
      <div style="text-align:right;">
        <div style="font-size:24px;font-weight:700;color:#111;">INVOICE</div>
        <div style="margin-top:8px;">
          <div style="color:#666;font-size:13px;">Invoice No</div>
          <div style="font-weight:600;">${data.invoiceNumber}</div>
        </div>
        <div style="margin-top:4px;">
          <div style="color:#666;font-size:13px;">Date</div>
          <div>${data.issueDate}</div>
        </div>
        <div style="margin-top:4px;">
          <div style="color:#666;font-size:13px;">Order</div>
          <div>${data.orderNumber}</div>
        </div>
      </div>
    </div>

    <!-- Bill To / Ship To -->
    <div style="display:flex;gap:40px;margin-bottom:32px;">
      <div style="flex:1;">
        <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#666;margin-bottom:8px;">Bill To</div>
        ${data.billingAddress ? renderAddress(data.billingAddress) : `<div>${data.customer.name}</div><div>${data.customer.email}</div>`}
      </div>
      ${
        data.shippingAddress
          ? `<div style="flex:1;">
              <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#666;margin-bottom:8px;">Ship To</div>
              ${renderAddress(data.shippingAddress)}
            </div>`
          : ''
      }
      <div style="flex:1;">
        <div style="font-size:11px;font-weight:600;text-transform:uppercase;color:#666;margin-bottom:8px;">Payment</div>
        <div>Method: ${data.paymentMethod}</div>
        <div>Status: <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:12px;font-weight:600;${isPaid ? 'background:#dcfce7;color:#166534;' : 'background:#fef9c3;color:#854d0e;'}">${isPaid ? 'PAID' : data.paymentStatus.toUpperCase()}</span></div>
        ${data.paidAt ? `<div style="color:#666;">Paid: ${data.paidAt}</div>` : ''}
      </div>
    </div>

    <!-- Items Table -->
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
      <thead>
        <tr style="background:#f8f9fa;">
          <th style="padding:10px 12px;text-align:left;font-size:12px;font-weight:600;text-transform:uppercase;color:#666;border-bottom:2px solid #e5e7eb;">Item</th>
          <th style="padding:10px 12px;text-align:center;font-size:12px;font-weight:600;text-transform:uppercase;color:#666;border-bottom:2px solid #e5e7eb;">Qty</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;color:#666;border-bottom:2px solid #e5e7eb;">Unit Price</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;color:#666;border-bottom:2px solid #e5e7eb;">Discount</th>
          <th style="padding:10px 12px;text-align:right;font-size:12px;font-weight:600;text-transform:uppercase;color:#666;border-bottom:2px solid #e5e7eb;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div style="display:flex;justify-content:flex-end;">
      <div style="width:300px;">
        <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6;">
          <span style="color:#666;">Subtotal</span>
          <span>${fc(data.subtotal)}</span>
        </div>
        ${
          data.discountTotal > 0
            ? `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6;">
                <span style="color:#dc2626;">Discount${data.couponCode ? ` (${data.couponCode})` : ''}</span>
                <span style="color:#dc2626;">-${fc(data.discountTotal)}</span>
              </div>`
            : ''
        }
        ${
          data.shippingTotal > 0
            ? `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6;">
                <span style="color:#666;">Shipping</span>
                <span>${fc(data.shippingTotal)}</span>
              </div>`
            : ''
        }
        ${
          data.taxTotal > 0
            ? `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #f3f4f6;">
                <span style="color:#666;">Tax</span>
                <span>${fc(data.taxTotal)}</span>
              </div>`
            : ''
        }
        <div style="display:flex;justify-content:space-between;padding:10px 0;border-top:2px solid #111;margin-top:4px;">
          <span style="font-weight:700;font-size:16px;">Total</span>
          <span style="font-weight:700;font-size:16px;">${fc(data.grandTotal)}</span>
        </div>
        ${
          data.totalPaid > 0
            ? `<div style="display:flex;justify-content:space-between;padding:4px 0;">
                <span style="color:#666;">Amount Paid</span>
                <span style="color:#166534;">${fc(data.totalPaid)}</span>
              </div>`
            : ''
        }
        ${
          data.totalRefunded > 0
            ? `<div style="display:flex;justify-content:space-between;padding:4px 0;">
                <span style="color:#666;">Refunded</span>
                <span style="color:#dc2626;">-${fc(data.totalRefunded)}</span>
              </div>`
            : ''
        }
        ${
          data.balanceDue > 0
            ? `<div style="display:flex;justify-content:space-between;padding:8px 0;background:#fef9c3;margin-top:8px;padding-left:8px;padding-right:8px;border-radius:4px;">
                <span style="font-weight:600;">Balance Due</span>
                <span style="font-weight:700;">${fc(data.balanceDue)}</span>
              </div>`
            : ''
        }
      </div>
    </div>

    ${data.notes ? `<div style="margin-top:32px;padding:16px;background:#f8f9fa;border-radius:8px;"><div style="font-weight:600;margin-bottom:4px;">Notes</div><div style="color:#666;">${data.notes}</div></div>` : ''}

    <!-- Footer -->
    <div style="margin-top:48px;padding-top:16px;border-top:1px solid #e5e7eb;text-align:center;color:#999;font-size:12px;">
      <div>Thank you for your order!</div>
      <div style="margin-top:4px;">${data.store.name} &bull; ${data.store.email || ''}</div>
      <div style="margin-top:4px;">Generated on ${DateTime.now().toFormat('yyyy-MM-dd HH:mm')}</div>
    </div>

    <!-- Print Button -->
    <div class="no-print" style="text-align:center;margin-top:24px;">
      <button onclick="window.print()" style="padding:10px 24px;background:#111;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:14px;">
        Print / Save as PDF
      </button>
    </div>

  </div>
</body>
</html>`
  }
}

// ── Types ──────────────────────────────────────────────────

export interface InvoiceData {
  invoiceNumber: string
  orderNumber: string
  orderId: string
  issueDate: string
  dueDate: string

  store: {
    name: string
    email: string
    phone: string
    address: string
  }

  customer: {
    name: string
    email: string
    phone?: string
  }

  billingAddress?: FormattedAddress
  shippingAddress?: FormattedAddress

  items: InvoiceItem[]

  subtotal: number
  discountTotal: number
  couponCode?: string
  taxTotal: number
  shippingTotal: number
  grandTotal: number
  totalPaid: number
  totalRefunded: number
  balanceDue: number

  currency: string
  paymentMethod: string
  paymentStatus: string
  paidAt?: string

  notes?: string
}

interface InvoiceItem {
  sku: string
  title: string
  variantTitle?: string
  quantity: number
  unitPrice: number
  discountAmount: number
  taxAmount: number
  totalPrice: number
}

interface FormattedAddress {
  name: string
  company?: string
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
  phone?: string
}
