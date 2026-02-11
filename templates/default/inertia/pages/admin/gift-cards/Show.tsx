import { Head, router, useForm } from '@inertiajs/react'
import { ArrowLeft, Ban, CheckCircle, DollarSign } from 'lucide-react'
import { FormEvent, useState } from 'react'

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface Props {
  giftCard: {
    id: string
    code: string
    value: number
    balance: number
    currencyCode: string
    isDisabled: boolean
    region: { id: string; name: string } | null
    order: { id: string; orderNumber: string } | null
    endsAt: string | null
    createdAt: string
    transactions: {
      id: string
      amount: number
      type: string
      note: string | null
      order: { id: string; orderNumber: string } | null
      createdAt: string
    }[]
  }
}

export default function GiftCardShow({ giftCard }: Props) {
  const [isAdjustOpen, setIsAdjustOpen] = useState(false)

  const adjustForm = useForm({
    amount: '',
    note: '',
  })

  const handleAdjust = (e: FormEvent) => {
    e.preventDefault()
    adjustForm.post(`/admin/gift-cards/${giftCard.id}/adjust`, {
      onSuccess: () => {
        setIsAdjustOpen(false)
        adjustForm.reset()
      },
    })
  }

  const handleToggleStatus = () => {
    const action = giftCard.isDisabled ? 'enable' : 'disable'
    if (confirm(`Are you sure you want to ${action} this gift card?`)) {
      router.post(`/admin/gift-cards/${giftCard.id}/toggle`)
    }
  }

  const usedAmount = giftCard.value - giftCard.balance
  const usagePercent = giftCard.value > 0 ? (usedAmount / giftCard.value) * 100 : 0

  return (
    <AdminLayout
      title={`Gift Card ${giftCard.code}`}
      description={`Created ${formatDateTime(giftCard.createdAt)}`}
      actions={
        <Button variant="outline" onClick={() => router.get('/admin/gift-cards')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Gift Cards
        </Button>
      }
    >
      <Head title={`Gift Card ${giftCard.code} - Admin`} />

      <div className="space-y-6 animate-fade-in">
        {/* Status */}
        <div className="flex items-center gap-2 animate-fade-up delay-100">
          {giftCard.isDisabled ? (
            <Badge variant="destructive">Disabled</Badge>
          ) : giftCard.balance <= 0 ? (
            <Badge variant="secondary">Depleted</Badge>
          ) : (
            <Badge variant="default">Active</Badge>
          )}
          {giftCard.endsAt && (
            <Badge variant="outline">
              Expires {formatDateTime(giftCard.endsAt)}
            </Badge>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main */}
          <div className="space-y-6 lg:col-span-2">
            {/* Balance Card */}
            <Card className="animate-fade-up delay-200">
              <CardHeader>
                <CardTitle className="font-display text-lg">Balance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 sm:grid-cols-3">
                  <div>
                    <div className="text-muted-foreground text-[11px] uppercase tracking-wide">Original Value</div>
                    <div className="text-2xl font-display mt-1">
                      {formatCurrency(giftCard.value, giftCard.currencyCode)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[11px] uppercase tracking-wide">Used</div>
                    <div className="text-2xl font-display mt-1 text-muted-foreground">
                      {formatCurrency(usedAmount, giftCard.currencyCode)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-[11px] uppercase tracking-wide">Remaining</div>
                    <div className="text-2xl font-display mt-1">
                      {formatCurrency(giftCard.balance, giftCard.currencyCode)}
                    </div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(usagePercent, 100)}%` }}
                    />
                  </div>
                  <div className="text-muted-foreground text-xs mt-1">
                    {usagePercent.toFixed(0)}% used
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions */}
            <Card className="animate-fade-up delay-300">
              <CardHeader>
                <CardTitle className="font-display text-lg">Transaction History</CardTitle>
                <CardDescription>
                  {giftCard.transactions.length} transactions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {giftCard.transactions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No transactions yet.
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Note</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {giftCard.transactions.map((t) => (
                        <TableRow key={t.id}>
                          <TableCell>
                            <Badge variant={t.type === 'usage' ? 'secondary' : t.type === 'refund' ? 'default' : 'outline'}>
                              {t.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={`font-display ${t.amount < 0 ? 'text-destructive' : 'text-green-600'}`}>
                            {t.amount > 0 ? '+' : ''}
                            {formatCurrency(t.amount, giftCard.currencyCode)}
                          </TableCell>
                          <TableCell>
                            {t.order ? (
                              <Button
                                variant="link"
                                size="sm"
                                className="h-auto p-0"
                                onClick={() => router.get(`/admin/orders/${t.order!.id}`)}
                              >
                                {t.order.orderNumber}
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {t.note || '-'}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-[11px] tracking-wide">
                            {formatDateTime(t.createdAt)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Details */}
            <Card className="animate-fade-up delay-200">
              <CardHeader>
                <CardTitle className="font-display text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-muted-foreground text-[11px] uppercase tracking-wide">Code</div>
                  <div className="font-mono text-sm mt-0.5">{giftCard.code}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-[11px] uppercase tracking-wide">Currency</div>
                  <div className="text-sm mt-0.5">{giftCard.currencyCode}</div>
                </div>
                {giftCard.region && (
                  <div>
                    <div className="text-muted-foreground text-[11px] uppercase tracking-wide">Region</div>
                    <div className="text-sm mt-0.5">{giftCard.region.name}</div>
                  </div>
                )}
                {giftCard.order && (
                  <div>
                    <div className="text-muted-foreground text-[11px] uppercase tracking-wide">Purchased In</div>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0"
                      onClick={() => router.get(`/admin/orders/${giftCard.order!.id}`)}
                    >
                      {giftCard.order.orderNumber}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="animate-fade-up delay-300">
              <CardHeader>
                <CardTitle className="font-display text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Dialog open={isAdjustOpen} onOpenChange={setIsAdjustOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full tracking-wide">
                      <DollarSign className="mr-2 h-4 w-4" />
                      Adjust Balance
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <form onSubmit={handleAdjust}>
                      <DialogHeader>
                        <DialogTitle className="font-display">Adjust Balance</DialogTitle>
                        <DialogDescription>
                          Use a positive number to add funds, or a negative number to deduct.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Amount
                          </Label>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="e.g. 10.00 or -5.00"
                            value={adjustForm.data.amount}
                            onChange={(e) => adjustForm.setData('amount', e.target.value)}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Note (optional)
                          </Label>
                          <Textarea
                            placeholder="Reason for adjustment..."
                            value={adjustForm.data.note}
                            onChange={(e) => adjustForm.setData('note', e.target.value)}
                            rows={2}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsAdjustOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={!adjustForm.data.amount || adjustForm.processing}>
                          Adjust
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  variant={giftCard.isDisabled ? 'default' : 'destructive'}
                  className="w-full tracking-wide"
                  onClick={handleToggleStatus}
                >
                  {giftCard.isDisabled ? (
                    <>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Enable Gift Card
                    </>
                  ) : (
                    <>
                      <Ban className="mr-2 h-4 w-4" />
                      Disable Gift Card
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
