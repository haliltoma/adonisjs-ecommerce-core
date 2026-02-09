import { Link, router } from '@inertiajs/react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatCurrency } from '@/lib/utils'
import { Edit, Trash2, Copy, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'

interface Props {
  product: {
    id: string
    storeId: string
    title: string
    slug: string
    description: string | null
    shortDescription: string | null
    status: string
    type: string
    vendor: string | null
    sku: string | null
    barcode: string | null
    price: number | null
    compareAtPrice: number | null
    costPrice: number | null
    isTaxable: boolean
    taxClassId: string | null
    weight: number | null
    weightUnit: string
    requiresShipping: boolean
    isFeatured: boolean
    sortOrder: number
    metaTitle: string | null
    metaDescription: string | null
    publishedAt: string | null
    createdAt: string
    updatedAt: string
    variants: {
      id: string
      title: string
      sku: string | null
      price: number | null
      compareAtPrice: number | null
      option1: string | null
      option2: string | null
      option3: string | null
      inventoryQuantity: number
      trackInventory: boolean
      allowBackorder: boolean
      position: number
      isActive: boolean
    }[]
    options: {
      id: string
      name: string
      values: string[]
      position: number
    }[]
    images: {
      id: string
      url: string
      alt: string | null
      position: number
      isPrimary: boolean
    }[]
    categories: {
      id: string
      name: string
    }[]
    tags: {
      id: string
      name: string
    }[]
  }
}

export default function Show({ product }: Props) {
  const handleDelete = () => {
    if (
      confirm(
        'Are you sure you want to delete this product? This action cannot be undone.'
      )
    ) {
      router.delete(`/admin/products/${product.id}`)
    }
  }

  const handleDuplicate = () => {
    router.post(`/admin/products/${product.id}/duplicate`)
  }

  const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
    switch (status) {
      case 'active':
        return 'default'
      case 'draft':
        return 'secondary'
      case 'archived':
        return 'outline'
      default:
        return 'outline'
    }
  }

  return (
    <AdminLayout
      title={product.title}
      description={`Product Details - ${product.sku || 'No SKU'}`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button asChild className="tracking-wide">
            <Link href={`/admin/products/${product.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-6 animate-fade-in">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-accent hover:underline underline-offset-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to products
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-fade-up delay-100">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="font-display text-xl">{product.title}</CardTitle>
                    <CardDescription className="text-muted-foreground text-[11px] tracking-wide mt-1">{product.slug}</CardDescription>
                  </div>
                  <Badge variant={getStatusVariant(product.status)} className={product.status === 'active' ? 'bg-accent text-accent-foreground' : ''}>
                    {product.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {product.shortDescription && (
                  <div>
                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Short Description</h4>
                    <p className="text-sm text-muted-foreground">
                      {product.shortDescription}
                    </p>
                  </div>
                )}

                {product.description && (
                  <div>
                    <h4 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-1">Description</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {product.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/60">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Type</p>
                    <p className="text-sm font-medium capitalize mt-0.5">{product.type}</p>
                  </div>
                  {product.vendor && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Vendor</p>
                      <p className="text-sm font-medium mt-0.5">{product.vendor}</p>
                    </div>
                  )}
                  {product.sku && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">SKU</p>
                      <p className="text-sm font-medium font-mono mt-0.5">{product.sku}</p>
                    </div>
                  )}
                  {product.barcode && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Barcode</p>
                      <p className="text-sm font-medium font-mono mt-0.5">{product.barcode}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="animate-fade-up delay-200">
              <CardHeader>
                <CardTitle className="font-display text-lg">Pricing</CardTitle>
                <CardDescription>Product pricing information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  {product.price !== null && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Price</p>
                      <p className="text-lg font-display mt-0.5">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  )}
                  {product.compareAtPrice !== null && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Compare at Price</p>
                      <p className="text-lg font-display mt-0.5">
                        {formatCurrency(product.compareAtPrice)}
                      </p>
                    </div>
                  )}
                  {product.costPrice !== null && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Cost Price</p>
                      <p className="text-lg font-display mt-0.5">
                        {formatCurrency(product.costPrice)}
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/60">
                  <div className="flex items-center gap-2">
                    {product.isTaxable ? (
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/50" />
                    )}
                    <span className="text-sm">
                      {product.isTaxable ? 'Taxable' : 'Not Taxable'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {product.isFeatured ? (
                      <CheckCircle2 className="h-4 w-4 text-accent" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground/50" />
                    )}
                    <span className="text-sm">
                      {product.isFeatured ? 'Featured' : 'Not Featured'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {product.variants.length > 0 && (
              <Card className="animate-fade-up delay-300">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Variants</CardTitle>
                  <CardDescription>
                    Product variants and inventory
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Inventory</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {product.variants.map((variant) => (
                        <TableRow key={variant.id}>
                          <TableCell className="font-medium">
                            {variant.title}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-[11px] tracking-wide font-mono">{variant.sku || '-'}</TableCell>
                          <TableCell className="font-display">
                            {variant.price !== null
                              ? formatCurrency(variant.price)
                              : '-'}
                          </TableCell>
                          <TableCell>{variant.inventoryQuantity}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                variant.isActive ? 'default' : 'secondary'
                              }
                              className={variant.isActive ? 'bg-accent text-accent-foreground' : ''}
                            >
                              {variant.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}

            {product.images.length > 0 && (
              <Card className="animate-fade-up delay-400">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Images</CardTitle>
                  <CardDescription>Product images</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {product.images.map((image) => (
                      <div
                        key={image.id}
                        className="relative aspect-square rounded-lg overflow-hidden border border-border/60 img-zoom"
                      >
                        <img
                          src={image.url}
                          alt={image.alt || product.title}
                          className="object-cover w-full h-full"
                        />
                        {image.isPrimary && (
                          <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
                            Primary
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="animate-fade-up delay-200">
              <CardHeader>
                <CardTitle className="font-display text-lg">Shipping</CardTitle>
                <CardDescription>Shipping details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {product.weight !== null && (
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Weight</p>
                    <p className="text-sm font-medium mt-0.5">
                      {product.weight} {product.weightUnit}
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  {product.requiresShipping ? (
                    <CheckCircle2 className="h-4 w-4 text-accent" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground/50" />
                  )}
                  <span className="text-sm">
                    {product.requiresShipping
                      ? 'Requires Shipping'
                      : 'No Shipping Required'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {product.categories.length > 0 && (
              <Card className="animate-fade-up delay-300">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Categories</CardTitle>
                  <CardDescription>Product categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {product.categories.map((category) => (
                      <Badge key={category.id} variant="secondary">
                        {category.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {product.tags.length > 0 && (
              <Card className="animate-fade-up delay-400">
                <CardHeader>
                  <CardTitle className="font-display text-lg">Tags</CardTitle>
                  <CardDescription>Product tags</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                      <Badge key={tag.id} variant="outline">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {(product.metaTitle || product.metaDescription) && (
              <Card className="animate-fade-up delay-500">
                <CardHeader>
                  <CardTitle className="font-display text-lg">SEO</CardTitle>
                  <CardDescription>Search engine optimization</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {product.metaTitle && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Meta Title</p>
                      <p className="text-sm font-medium mt-0.5">{product.metaTitle}</p>
                    </div>
                  )}
                  {product.metaDescription && (
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        Meta Description
                      </p>
                      <p className="text-sm font-medium mt-0.5">
                        {product.metaDescription}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="animate-fade-up delay-600">
              <CardHeader>
                <CardTitle className="font-display text-lg">Metadata</CardTitle>
                <CardDescription>System information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Product ID</p>
                  <p className="text-sm font-mono mt-0.5">{product.id}</p>
                </div>
                {product.publishedAt && (
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Published At</p>
                    <p className="text-sm mt-0.5">
                      {new Date(product.publishedAt).toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Created</p>
                  <p className="text-sm mt-0.5">
                    {new Date(product.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Last Updated</p>
                  <p className="text-sm mt-0.5">
                    {new Date(product.updatedAt).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
