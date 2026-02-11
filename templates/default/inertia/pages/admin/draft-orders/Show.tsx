import { Head, router } from '@inertiajs/react'
import { ArrowLeft, CheckCircle, CreditCard, Trash2 } from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface Props {
  draftOrder: {
    id: string
    displayId: string
    status: string
    customer: { id: string; name: string; email: string } | null
    email: string | null
    region: { id: string; name: string } | null
    currencyCode: string
    items: { productId: string; variantId?: string; title: string; quantity: number; unitPrice: number }[]
    shippingAddress: any
    billingAddress: any
    shippingMethod: string | null
    shippingTotal: number
    discountTotal: number
    taxTotal: number
    subtotal: number
    grandTotal: number
    note: string | null
    orderId: string | null
    createdAt: string
    completedAt: string | null
  }
}

export default function DraftOrderShow({ draftOrder }: Props) {
  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'completed':
        return 'default'
      case 'open':
        return 'secondary'
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const handleRegisterPayment = () => {
    if (confirm('Register payment and convert this draft order to a real order?')) {
      router.post(`/admin/draft-orders/${draftOrder.id}/register-payment`)
    }
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this draft order?')) {
      router.delete(`/admin/draft-orders/${draftOrder.id}`)
    }
  }

  const formatAddress = (address: any) => {
    if (!address) return 'No address provided'
    return [address.line1, address.line2, `${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}`, address.country]
      .filter(Boolean)
      .join(', ')
  }

  return (
    <AdminLayout
      title={`Draft ${draftOrder.displayId}`}
      description={`Created ${formatDateTime(draftOrder.createdAt)}`}
      actions={
        <Button variant="outline" onClick={() => router.get('/admin/draft-orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Draft Orders
        </Button>
      }
    >
      <Head title={`Draft ${draftOrder.displayId} - Admin`} />

      <div className="space-y-6 animate-fade-in">
        {/* Status */}
        <div className="flex items-center gap-2 animate-fade-up delay-100">
          <Badge variant={getStatusVariant(draftOrder.status)} className="text-sm">
            {draftOrder.status}
          </Badge>
          {draftOrder.orderId && (
            <Badge
              variant="outline"
              className="cursor-pointer"
              onClick={() => router.get(`/admin/orders/${draftOrder.orderId}`)}
            >
              View Order
            </Badge>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="space-y-6 lg:col-span-2">
            {/* Items */}
            <Card className="animate-fade-up delay-200">
              <CardHeader>
                <CardTitle className="font-display text-lg">Items</CardTitle>
                <CardDescription>
                  {draftOrder.items.length} {draftOrder.items.length === 1 ? 'item' : 'items'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Unit Price</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {draftOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.unitPrice, draftOrder.currencyCode)}
                        </TableCell>
                        <TableCell className="text-right font-display">
                          {formatCurrency(item.unitPrice * item.quantity, draftOrder.currencyCode)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Separator className="my-4" />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground text-[11px] uppercase tracking-wide">Subtotal</span>
                    <span>{formatCurrency(draftOrder.subtotal, draftOrder.currencyCode)}</span>
                  </div>
                  {draftOrder.discountTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground text-[11px] uppercase tracking-wide">Discount</span>
                      <span className="text-green-600">
                        -{formatCurrency(draftOrder.discountTotal, draftOrder.currencyCode)}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground text-[11px] uppercase tracking-wide">Shipping</span>
                    <span>{formatCurrency(draftOrder.shippingTotal, draftOrder.currencyCode)}</span>
                  </div>
                  {draftOrder.taxTotal > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground text-[11px] uppercase tracking-wide">Tax</span>
                      <span>{formatCurrency(draftOrder.taxTotal, draftOrder.currencyCode)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span className="font-display">Total</span>
                    <span className="text-lg font-display">
                      {formatCurrency(draftOrder.grandTotal, draftOrder.currencyCode)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Note */}
            {draftOrder.note && (
              <Card className="animate-fade-up delay-300">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Note</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-muted rounded-lg p-3 text-sm">{draftOrder.note}</div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer */}
            <Card className="animate-fade-up delay-200">
              <CardHeader>
                <CardTitle className="font-display text-lg">Customer</CardTitle>
              </CardHeader>
              <CardContent>
                {draftOrder.customer ? (
                  <div>
                    <div className="font-display text-base">{draftOrder.customer.name}</div>
                    <div className="text-muted-foreground text-sm">{draftOrder.customer.email}</div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3 w-full tracking-wide"
                      onClick={() => router.get(`/admin/customers/${draftOrder.customer!.id}`)}
                    >
                      View Customer
                    </Button>
                  </div>
                ) : draftOrder.email ? (
                  <div>
                    <div className="text-muted-foreground text-[11px] uppercase tracking-wide">Guest</div>
                    <div className="text-sm mt-0.5">{draftOrder.email}</div>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm">No customer assigned</div>
                )}
              </CardContent>
            </Card>

            {/* Shipping */}
            {draftOrder.shippingMethod && (
              <Card className="animate-fade-up delay-300">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Shipping</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">{draftOrder.shippingMethod}</div>
                  {draftOrder.shippingAddress && (
                    <div className="text-muted-foreground text-sm mt-2">
                      {formatAddress(draftOrder.shippingAddress)}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Region */}
            {draftOrder.region && (
              <Card className="animate-fade-up delay-400">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Region</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">{draftOrder.region.name}</div>
                  <div className="text-muted-foreground text-sm">{draftOrder.currencyCode}</div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            {draftOrder.status === 'open' && (
              <Card className="animate-fade-up delay-500">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button onClick={handleRegisterPayment} className="w-full tracking-wide">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Mark as Paid
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="w-full tracking-wide"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Draft
                  </Button>
                </CardContent>
              </Card>
            )}

            {draftOrder.status === 'completed' && draftOrder.completedAt && (
              <Card className="animate-fade-up delay-500">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-5 w-5" />
                    <div>
                      <div className="font-medium">Completed</div>
                      <div className="text-muted-foreground text-[11px] tracking-wide">
                        {formatDateTime(draftOrder.completedAt)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
