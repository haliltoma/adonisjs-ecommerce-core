import { Head, router } from '@inertiajs/react'
import { useState } from 'react'
import {
  Mail,
  MoreHorizontal,
  Search,
  ShoppingCart,
  Trash,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, formatDateTime, debounce } from '@/lib/utils'

interface AbandonedCart {
  id: string
  customerEmail: string
  customerName: string | null
  itemCount: number
  total: number
  lastActivityAt: string
  recoveryEmailSent: boolean
}

interface Props {
  carts: {
    data: AbandonedCart[]
    meta: { total: number; perPage: number; currentPage: number; lastPage: number }
  }
  filters: { search?: string }
}

export default function AbandonedCartsPage({ carts, filters = {} }: Props) {
  const [search, setSearch] = useState(filters.search || '')

  const debouncedSearch = debounce((value: string) => {
    router.get('/admin/marketing/abandoned-carts', { ...filters, search: value, page: 1 }, { preserveState: true })
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    debouncedSearch(e.target.value)
  }

  const sendRecoveryEmail = (id: string) => {
    router.post(`/admin/marketing/abandoned-carts/${id}/recover`)
  }

  return (
    <AdminLayout
      title="Abandoned Carts"
      description={`${carts.meta.total} abandoned carts`}
    >
      <Head title="Abandoned Carts - Admin" />
      <div className="animate-fade-in">
        <Card>
          <CardHeader className="pb-4">
            <div className="relative sm:max-w-xs">
              <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
              <Input placeholder="Search by email..." value={search} onChange={handleSearchChange} className="bg-secondary/50 border-0 pl-8 text-sm h-9" />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-xs">Customer</TableHead>
                  <TableHead className="text-xs">Items</TableHead>
                  <TableHead className="text-xs">Total</TableHead>
                  <TableHead className="text-xs">Last Activity</TableHead>
                  <TableHead className="text-xs">Recovery</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {carts.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <ShoppingCart className="text-muted-foreground h-8 w-8" />
                        <p className="text-muted-foreground text-sm">No abandoned carts</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  carts.data.map((cart) => (
                    <TableRow key={cart.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7">
                            <AvatarFallback className="text-[10px]">{(cart.customerName || cart.customerEmail).charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{cart.customerName || 'Guest'}</p>
                            <p className="text-muted-foreground text-[11px]">{cart.customerEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{cart.itemCount} items</TableCell>
                      <TableCell className="text-sm font-medium">{formatCurrency(cart.total)}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">{formatDateTime(cart.lastActivityAt)}</TableCell>
                      <TableCell>
                        {cart.recoveryEmailSent ? (
                          <span className="text-muted-foreground text-[11px]">Email sent</span>
                        ) : (
                          <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => sendRecoveryEmail(cart.id)}>
                            <Mail className="mr-1 h-3 w-3" />Send
                          </Button>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!cart.recoveryEmailSent && (
                              <>
                                <DropdownMenuItem onClick={() => sendRecoveryEmail(cart.id)}>
                                  <Mail className="mr-2 h-4 w-4" />Send recovery email
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                              </>
                            )}
                            <DropdownMenuItem className="text-red-600" onClick={() => router.delete(`/admin/marketing/abandoned-carts/${cart.id}`)}>
                              <Trash className="mr-2 h-4 w-4" />Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {carts.meta.lastPage > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-muted-foreground text-xs">Page {carts.meta.currentPage} of {carts.meta.lastPage}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={carts.meta.currentPage <= 1} onClick={() => router.get('/admin/marketing/abandoned-carts', { ...filters, page: carts.meta.currentPage - 1 })}>Previous</Button>
                  <Button variant="outline" size="sm" disabled={carts.meta.currentPage >= carts.meta.lastPage} onClick={() => router.get('/admin/marketing/abandoned-carts', { ...filters, page: carts.meta.currentPage + 1 })}>Next</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
