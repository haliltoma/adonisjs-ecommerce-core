import { Head, Link, router } from '@inertiajs/react'
import { Gift, Plus, Search } from 'lucide-react'
import { useState } from 'react'

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
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDate } from '@/lib/utils'

interface GiftCardItem {
  id: string
  code: string
  value: number
  balance: number
  currencyCode: string
  isDisabled: boolean
  region: { id: string; name: string } | null
  endsAt: string | null
  createdAt: string
}

interface Props {
  giftCards: {
    data: GiftCardItem[]
    meta: { total: number; perPage: number; currentPage: number; lastPage: number }
  }
  filters: { search: string | null }
}

export default function GiftCardsIndex({ giftCards, filters }: Props) {
  const [search, setSearch] = useState(filters.search || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    router.get('/admin/gift-cards', { search }, { preserveState: true })
  }

  return (
    <AdminLayout
      title="Gift Cards"
      description="Manage store gift cards"
      actions={
        <Button asChild>
          <Link href="/admin/gift-cards/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Gift Card
          </Link>
        </Button>
      }
    >
      <Head title="Gift Cards - Admin" />

      <div className="space-y-6 animate-fade-in">
        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by gift card code..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button type="submit" variant="secondary">
                Search
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Table */}
        {giftCards.data.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Gift className="mb-4 h-12 w-12 text-muted-foreground" />
              <CardTitle className="mb-2 font-display">No Gift Cards</CardTitle>
              <CardDescription className="mb-6 text-center">
                Create gift cards to offer as a payment method in your store.
              </CardDescription>
              <Button asChild>
                <Link href="/admin/gift-cards/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Gift Card
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Original Value</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Region</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {giftCards.data.map((gc) => (
                    <TableRow
                      key={gc.id}
                      className="cursor-pointer"
                      onClick={() => router.get(`/admin/gift-cards/${gc.id}`)}
                    >
                      <TableCell className="font-mono text-sm font-medium">{gc.code}</TableCell>
                      <TableCell>{formatCurrency(gc.value, gc.currencyCode)}</TableCell>
                      <TableCell className="font-display">
                        {formatCurrency(gc.balance, gc.currencyCode)}
                      </TableCell>
                      <TableCell>
                        {gc.isDisabled ? (
                          <Badge variant="destructive">Disabled</Badge>
                        ) : gc.balance <= 0 ? (
                          <Badge variant="secondary">Depleted</Badge>
                        ) : (
                          <Badge variant="default">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {gc.region?.name || '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[11px] tracking-wide">
                        {gc.endsAt ? formatDate(gc.endsAt) : 'Never'}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-[11px] tracking-wide">
                        {formatDate(gc.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Pagination */}
        {giftCards.meta.lastPage > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Showing {(giftCards.meta.currentPage - 1) * giftCards.meta.perPage + 1} to{' '}
              {Math.min(giftCards.meta.currentPage * giftCards.meta.perPage, giftCards.meta.total)}{' '}
              of {giftCards.meta.total} gift cards
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={giftCards.meta.currentPage <= 1}
                onClick={() => router.get('/admin/gift-cards', { ...filters, page: giftCards.meta.currentPage - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={giftCards.meta.currentPage >= giftCards.meta.lastPage}
                onClick={() => router.get('/admin/gift-cards', { ...filters, page: giftCards.meta.currentPage + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
