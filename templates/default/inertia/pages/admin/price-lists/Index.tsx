import { Head, Link, router } from '@inertiajs/react'
import {
  DollarSign,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDateTime } from '@/lib/utils'

interface PriceListItem {
  id: string
  name: string
  description: string | null
  type: 'sale' | 'override'
  status: 'active' | 'draft' | 'expired'
  startsAt: string | null
  endsAt: string | null
  rulesCount: number
  pricesCount: number
  createdAt: string
}

interface Props {
  priceLists: {
    data: PriceListItem[]
    meta: { total: number; currentPage: number; lastPage: number }
  }
}

const statusColors: Record<string, 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  draft: 'secondary',
  expired: 'destructive',
}

const typeLabels: Record<string, string> = {
  sale: 'Sale',
  override: 'Override',
}

export default function PriceListsIndex({ priceLists }: Props) {
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this price list?')) {
      router.delete(`/admin/price-lists/${id}`)
    }
  }

  return (
    <AdminLayout
      title="Price Lists"
      description="Manage sale prices and price overrides for customer groups and regions"
      actions={
        <Button asChild>
          <Link href="/admin/price-lists/create">
            <Plus className="mr-2 h-4 w-4" />
            Create Price List
          </Link>
        </Button>
      }
    >
      <Head title="Price Lists - Admin" />

      <div className="animate-fade-in space-y-6">
        {priceLists.data.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <DollarSign className="h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-medium">No price lists</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create price lists to offer special pricing for customer groups, regions, or time-limited sales.
              </p>
              <Button asChild className="mt-4">
                <Link href="/admin/price-lists/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Create first price list
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Price Lists</CardTitle>
              <CardDescription>{priceLists.meta.total} price list(s)</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Prices</TableHead>
                    <TableHead>Rules</TableHead>
                    <TableHead>Date Range</TableHead>
                    <TableHead className="w-[50px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {priceLists.data.map((pl) => (
                    <TableRow key={pl.id}>
                      <TableCell>
                        <Link
                          href={`/admin/price-lists/${pl.id}/edit`}
                          className="font-medium hover:underline"
                        >
                          {pl.name}
                        </Link>
                        {pl.description && (
                          <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">
                            {pl.description}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{typeLabels[pl.type]}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusColors[pl.status]}>{pl.status}</Badge>
                      </TableCell>
                      <TableCell>{pl.pricesCount}</TableCell>
                      <TableCell>{pl.rulesCount}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {pl.startsAt || pl.endsAt ? (
                          <>
                            {pl.startsAt ? formatDateTime(pl.startsAt) : '—'}
                            {' → '}
                            {pl.endsAt ? formatDateTime(pl.endsAt) : '—'}
                          </>
                        ) : (
                          'Always'
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/price-lists/${pl.id}/edit`}>
                                <Pencil className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(pl.id)}
                              className="text-destructive"
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
