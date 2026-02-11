import { Head, Link, router } from '@inertiajs/react'
import { useState } from 'react'
import {
  Copy,
  Download,
  Edit,
  MoreHorizontal,
  Package,
  Plus,
  Search,
  Star,
  Trash,
  Upload,
} from 'lucide-react'

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
import { Checkbox } from '@/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency, debounce } from '@/lib/utils'

interface Product {
  id: string
  title: string
  slug: string
  status: string
  type: string
  price: number | null
  compareAtPrice: number | null
  sku: string | null
  isFeatured: boolean
  thumbnail: string | null
  variantCount: number
  createdAt: string
}

interface Props {
  products: {
    data: Product[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    }
  }
  filters: {
    status?: string
    type?: string
    categoryId?: string
    search?: string
    sortBy?: string
    sortDir?: string
  }
  categories: Array<{ id: string; name: string; slug: string; children: any[] }>
}

export default function ProductsIndex({
  products,
  filters,
  categories,
}: Props) {
  const [search, setSearch] = useState(filters.search || '')
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])

  const debouncedSearch = debounce((value: string) => {
    router.get(
      '/admin/products',
      { ...filters, search: value, page: 1 },
      { preserveState: true }
    )
  }, 300)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value)
    debouncedSearch(e.target.value)
  }

  const handleFilterChange = (key: string, value: string) => {
    router.get(
      '/admin/products',
      { ...filters, [key]: value || undefined, page: 1 },
      { preserveState: true }
    )
  }

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.data.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.data.map((p) => p.id))
    }
  }

  const toggleSelect = (id: string) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter((p) => p !== id))
    } else {
      setSelectedProducts([...selectedProducts, id])
    }
  }

  const handleBulkAction = (action: string) => {
    if (selectedProducts.length === 0) return
    router.post(
      '/admin/products/bulk',
      { action, ids: selectedProducts },
      {
        onSuccess: () => setSelectedProducts([]),
      }
    )
  }

  const getStatusVariant = (
    status: string
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default'
      case 'draft':
        return 'outline'
      case 'archived':
        return 'destructive'
      default:
        return 'secondary'
    }
  }

  return (
    <AdminLayout
      title="Products"
      description={`Manage your ${products.meta.total} products`}
      actions={
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="mr-2 h-4 w-4" />
                More
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/admin/products/import">
                  <Upload className="mr-2 h-4 w-4" />
                  Import Products
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/admin/products/export">
                  <Download className="mr-2 h-4 w-4" />
                  Export Products
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button asChild>
            <Link href="/admin/products/create">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
      }
    >
      <Head title="Products - Admin" />

      <div className="animate-fade-in">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-xs">
                <Search className="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={handleSearchChange}
                  className="bg-secondary/50 border-0 pl-8 text-sm h-9"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Select
                  value={filters.status || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('status', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger className="w-[130px] h-9 text-sm">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.type || 'all'}
                  onValueChange={(value) =>
                    handleFilterChange('type', value === 'all' ? '' : value)
                  }
                >
                  <SelectTrigger className="w-[130px] h-9 text-sm">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All types</SelectItem>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="variable">Variable</SelectItem>
                    <SelectItem value="digital">Digital</SelectItem>
                  </SelectContent>
                </Select>

                {selectedProducts.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm">
                        {selectedProducts.length} selected
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => handleBulkAction('publish')}
                      >
                        Publish
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleBulkAction('draft')}>
                        Set as draft
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleBulkAction('archive')}
                      >
                        Archive
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleBulkAction('delete')}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        selectedProducts.length === products.data.length &&
                        products.data.length > 0
                      }
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="text-xs">Product</TableHead>
                  <TableHead className="text-xs">Status</TableHead>
                  <TableHead className="text-xs">Price</TableHead>
                  <TableHead className="text-xs">Variants</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Package className="text-muted-foreground h-8 w-8" />
                        <p className="text-muted-foreground text-sm">
                          No products found
                        </p>
                        <Button asChild size="sm" variant="outline">
                          <Link href="/admin/products/create">
                            Add your first product
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.data.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedProducts.includes(product.id)}
                          onCheckedChange={() => toggleSelect(product.id)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {product.thumbnail ? (
                            <img
                              src={product.thumbnail}
                              alt={product.title}
                              className="h-10 w-10 rounded-md object-cover"
                            />
                          ) : (
                            <div className="bg-muted flex h-10 w-10 items-center justify-center rounded-md">
                              <Package className="text-muted-foreground h-5 w-5" />
                            </div>
                          )}
                          <div>
                            <Link
                              href={`/admin/products/${product.id}/edit`}
                              className="text-sm font-medium hover:underline underline-offset-4"
                            >
                              {product.title}
                            </Link>
                            {product.sku && (
                              <p className="text-muted-foreground text-[11px] mt-0.5">
                                SKU: {product.sku}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Badge variant={getStatusVariant(product.status)} className="text-[11px]">
                            {product.status}
                          </Badge>
                          {product.isFeatured && (
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {product.price !== null ? (
                          <div>
                            <span className="text-sm font-medium">
                              {formatCurrency(product.price)}
                            </span>
                            {product.compareAtPrice &&
                              product.compareAtPrice > product.price && (
                                <span className="text-muted-foreground ml-1 text-[11px] line-through">
                                  {formatCurrency(product.compareAtPrice)}
                                </span>
                              )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[11px]">{product.variantCount || 1}</Badge>
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
                              <Link href={`/admin/products/${product.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link
                                href={`/admin/products/${product.id}/duplicate`}
                                method="post"
                                as="button"
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Duplicate
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() =>
                                router.delete(
                                  `/admin/products/${product.id}`
                                )
                              }
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {products.meta.lastPage > 1 && (
              <div className="flex items-center justify-between border-t px-4 py-3">
                <p className="text-muted-foreground text-xs">
                  Page {products.meta.currentPage} of {products.meta.lastPage}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={products.meta.currentPage <= 1}
                    onClick={() =>
                      router.get('/admin/products', {
                        ...filters,
                        page: products.meta.currentPage - 1,
                      })
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={
                      products.meta.currentPage >= products.meta.lastPage
                    }
                    onClick={() =>
                      router.get('/admin/products', {
                        ...filters,
                        page: products.meta.currentPage + 1,
                      })
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
