import { useForm, router } from '@inertiajs/react'
import { FormEvent, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Save, Trash2, Copy } from 'lucide-react'

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
  categories: { id: string; name: string; depth: number }[]
  taxClasses: { id: string; name: string }[]
  tags: { id: string; name: string }[]
}

export default function Edit({ product, categories, taxClasses, tags }: Props) {
  const { data, setData, patch, processing, errors } = useForm({
    title: product.title || '',
    slug: product.slug || '',
    description: product.description || '',
    shortDescription: product.shortDescription || '',
    status: product.status || 'draft',
    type: product.type || 'simple',
    vendor: product.vendor || '',
    sku: product.sku || '',
    barcode: product.barcode || '',
    price: product.price?.toString() || '',
    compareAtPrice: product.compareAtPrice?.toString() || '',
    costPrice: product.costPrice?.toString() || '',
    isTaxable: product.isTaxable,
    taxClassId: product.taxClassId || '',
    weight: product.weight?.toString() || '',
    weightUnit: product.weightUnit || 'kg',
    requiresShipping: product.requiresShipping,
    isFeatured: product.isFeatured,
    metaTitle: product.metaTitle || '',
    metaDescription: product.metaDescription || '',
    categoryIds: product.categories.map((c) => c.id),
    tagIds: product.tags.map((t) => t.id),
  })

  useEffect(() => {
    if (data.title && data.slug === product.slug) {
      const slug = data.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setData('slug', slug)
    }
  }, [data.title])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    patch(`/admin/products/${product.id}`)
  }

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

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    if (checked) {
      setData('categoryIds', [...data.categoryIds, categoryId])
    } else {
      setData('categoryIds', data.categoryIds.filter((id) => id !== categoryId))
    }
  }

  const handleTagToggle = (tagId: string, checked: boolean) => {
    if (checked) {
      setData('tagIds', [...data.tagIds, tagId])
    } else {
      setData('tagIds', data.tagIds.filter((id) => id !== tagId))
    }
  }

  return (
    <AdminLayout
      title="Edit Product"
      description={`Edit ${product.title}`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDuplicate} disabled={processing}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={processing}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <Button onClick={handleSubmit} disabled={processing} className="tracking-wide">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in">
        <Card className="animate-fade-up delay-100">
          <CardHeader>
            <CardTitle className="font-display text-lg">Basic Information</CardTitle>
            <CardDescription>Product details and description</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</Label>
              <Input
                id="title"
                value={data.title}
                onChange={(e) => setData('title', e.target.value)}
                error={errors.title}
                className="h-11 border-border/60 focus-visible:border-accent"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Slug</Label>
              <Input
                id="slug"
                value={data.slug}
                onChange={(e) => setData('slug', e.target.value)}
                error={errors.slug}
                className="h-11 border-border/60 focus-visible:border-accent"
              />
              {errors.slug && (
                <p className="text-sm text-destructive">{errors.slug}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                rows={5}
                error={errors.description}
                className="border-border/60 focus-visible:border-accent"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Short Description</Label>
              <Textarea
                id="shortDescription"
                value={data.shortDescription}
                onChange={(e) => setData('shortDescription', e.target.value)}
                rows={2}
                error={errors.shortDescription}
                className="border-border/60 focus-visible:border-accent"
              />
              {errors.shortDescription && (
                <p className="text-sm text-destructive">{errors.shortDescription}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Status</Label>
                <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                  <SelectTrigger className="h-11 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Type</Label>
                <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                  <SelectTrigger className="h-11 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="variable">Variable</SelectItem>
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-destructive">{errors.type}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vendor" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Vendor</Label>
              <Input
                id="vendor"
                value={data.vendor}
                onChange={(e) => setData('vendor', e.target.value)}
                error={errors.vendor}
                className="h-11 border-border/60 focus-visible:border-accent"
              />
              {errors.vendor && (
                <p className="text-sm text-destructive">{errors.vendor}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="font-display text-lg">Inventory</CardTitle>
            <CardDescription>SKU, barcode, and stock information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sku" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">SKU</Label>
                <Input
                  id="sku"
                  value={data.sku}
                  onChange={(e) => setData('sku', e.target.value)}
                  error={errors.sku}
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.sku && (
                  <p className="text-sm text-destructive">{errors.sku}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="barcode" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Barcode</Label>
                <Input
                  id="barcode"
                  value={data.barcode}
                  onChange={(e) => setData('barcode', e.target.value)}
                  error={errors.barcode}
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.barcode && (
                  <p className="text-sm text-destructive">{errors.barcode}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-300">
          <CardHeader>
            <CardTitle className="font-display text-lg">Pricing</CardTitle>
            <CardDescription>Product pricing and cost information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={data.price}
                  onChange={(e) => setData('price', e.target.value)}
                  error={errors.price}
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.price && (
                  <p className="text-sm text-destructive">{errors.price}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="compareAtPrice" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Compare at Price</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  value={data.compareAtPrice}
                  onChange={(e) => setData('compareAtPrice', e.target.value)}
                  error={errors.compareAtPrice}
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.compareAtPrice && (
                  <p className="text-sm text-destructive">{errors.compareAtPrice}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPrice" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cost Price</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={data.costPrice}
                  onChange={(e) => setData('costPrice', e.target.value)}
                  error={errors.costPrice}
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.costPrice && (
                  <p className="text-sm text-destructive">{errors.costPrice}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isTaxable"
                checked={data.isTaxable}
                onCheckedChange={(checked) => setData('isTaxable', checked)}
              />
              <Label htmlFor="isTaxable">Taxable</Label>
            </div>

            {data.isTaxable && (
              <div className="space-y-2">
                <Label htmlFor="taxClassId" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tax Class</Label>
                <Select
                  value={data.taxClassId}
                  onValueChange={(value) => setData('taxClassId', value)}
                >
                  <SelectTrigger className="h-11 border-border/60">
                    <SelectValue placeholder="Select tax class" />
                  </SelectTrigger>
                  <SelectContent>
                    {taxClasses.map((taxClass) => (
                      <SelectItem key={taxClass.id} value={taxClass.id}>
                        {taxClass.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.taxClassId && (
                  <p className="text-sm text-destructive">{errors.taxClassId}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-400">
          <CardHeader>
            <CardTitle className="font-display text-lg">Shipping</CardTitle>
            <CardDescription>Weight and shipping requirements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weight" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Weight</Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.01"
                  value={data.weight}
                  onChange={(e) => setData('weight', e.target.value)}
                  error={errors.weight}
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.weight && (
                  <p className="text-sm text-destructive">{errors.weight}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weightUnit" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Weight Unit</Label>
                <Select
                  value={data.weightUnit}
                  onValueChange={(value) => setData('weightUnit', value)}
                >
                  <SelectTrigger className="h-11 border-border/60">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="oz">oz</SelectItem>
                  </SelectContent>
                </Select>
                {errors.weightUnit && (
                  <p className="text-sm text-destructive">{errors.weightUnit}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="requiresShipping"
                checked={data.requiresShipping}
                onCheckedChange={(checked) => setData('requiresShipping', checked)}
              />
              <Label htmlFor="requiresShipping">Requires Shipping</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-500">
          <CardHeader>
            <CardTitle className="font-display text-lg">Organization</CardTitle>
            <CardDescription>Categories and tags</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Categories</Label>
              <div className="space-y-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.id}`}
                      checked={data.categoryIds.includes(category.id)}
                      onCheckedChange={(checked) =>
                        handleCategoryToggle(category.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`category-${category.id}`}
                      className="font-normal cursor-pointer"
                      style={{ paddingLeft: `${category.depth * 16}px` }}
                    >
                      {category.name}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.categoryIds && (
                <p className="text-sm text-destructive">{errors.categoryIds}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Tags</Label>
              <div className="space-y-2">
                {tags.map((tag) => (
                  <div key={tag.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tag-${tag.id}`}
                      checked={data.tagIds.includes(tag.id)}
                      onCheckedChange={(checked) =>
                        handleTagToggle(tag.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`tag-${tag.id}`}
                      className="font-normal cursor-pointer"
                    >
                      {tag.name}
                    </Label>
                  </div>
                ))}
              </div>
              {errors.tagIds && (
                <p className="text-sm text-destructive">{errors.tagIds}</p>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isFeatured"
                checked={data.isFeatured}
                onCheckedChange={(checked) => setData('isFeatured', checked)}
              />
              <Label htmlFor="isFeatured">Featured Product</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-600">
          <CardHeader>
            <CardTitle className="font-display text-lg">SEO</CardTitle>
            <CardDescription>Search engine optimization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Meta Title</Label>
              <Input
                id="metaTitle"
                value={data.metaTitle}
                onChange={(e) => setData('metaTitle', e.target.value)}
                error={errors.metaTitle}
                className="h-11 border-border/60 focus-visible:border-accent"
              />
              {errors.metaTitle && (
                <p className="text-sm text-destructive">{errors.metaTitle}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="metaDescription" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Meta Description</Label>
              <Textarea
                id="metaDescription"
                value={data.metaDescription}
                onChange={(e) => setData('metaDescription', e.target.value)}
                rows={3}
                error={errors.metaDescription}
                className="border-border/60 focus-visible:border-accent"
              />
              {errors.metaDescription && (
                <p className="text-sm text-destructive">{errors.metaDescription}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </AdminLayout>
  )
}
