import { useForm, router } from '@inertiajs/react'
import { FormEvent, useState, useCallback, KeyboardEvent, useRef } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { MediaUploader, type MediaFile } from '@/components/admin/MediaUploader'
import {
  Save,
  Trash2,
  Copy,
  Plus,
  X,
  GripVertical,
  ChevronDown,
  ChevronRight,
  Package,
  Search,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

interface ProductOption {
  id?: string
  name: string
  values: string[]
}

interface VariantRow {
  id: string
  title: string
  option1: string | null
  option2: string | null
  option3: string | null
  price: string
  sku: string
  quantity: string
  isActive: boolean
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cartesian<T>(...arrays: T[][]): T[][] {
  return arrays.reduce<T[][]>(
    (acc, arr) => acc.flatMap((combo) => arr.map((item) => [...combo, item])),
    [[]]
  )
}

function generateVariantsFromOptions(options: ProductOption[]): VariantRow[] {
  const filled = options.filter((o) => o.name && o.values.length > 0)
  if (filled.length === 0) return []

  const valueSets = filled.map((o) => o.values)
  const combos = cartesian(...valueSets)

  return combos.map((combo, idx) => ({
    id: `new-${idx}`,
    title: combo.join(' / '),
    option1: combo[0] || null,
    option2: combo[1] || null,
    option3: combo[2] || null,
    price: '',
    sku: '',
    quantity: '0',
    isActive: true,
  }))
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TagInput({
  values,
  onChange,
  placeholder = 'Type and press Enter',
}: {
  values: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addValue = useCallback(() => {
    const trimmed = input.trim()
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed])
    }
    setInput('')
  }, [input, values, onChange])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addValue()
    } else if (e.key === 'Backspace' && !input && values.length > 0) {
      onChange(values.slice(0, -1))
    }
  }

  const removeValue = (val: string) => {
    onChange(values.filter((v) => v !== val))
  }

  return (
    <div
      className="flex flex-wrap items-center gap-1.5 rounded-md border border-input bg-background px-2 py-1.5 shadow-xs transition-colors focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px] min-h-[36px] cursor-text"
      onClick={() => inputRef.current?.focus()}
    >
      {values.map((val) => (
        <Badge
          key={val}
          variant="secondary"
          className="gap-1 pl-2 pr-1 py-0.5 text-xs font-normal"
        >
          {val}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              removeValue(val)
            }}
            className="ml-0.5 rounded hover:bg-foreground/10 p-0.5"
          >
            <X className="h-2.5 w-2.5" />
          </button>
        </Badge>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addValue}
        placeholder={values.length === 0 ? placeholder : ''}
        className="flex-1 min-w-[80px] bg-transparent border-0 outline-none text-sm py-0.5 placeholder:text-muted-foreground"
      />
    </div>
  )
}

function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string
  defaultOpen?: boolean
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none py-4"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold">{title}</CardTitle>
          {open ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </CardHeader>
      {open && <CardContent className="pt-0">{children}</CardContent>}
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Edit({ product, categories, taxClasses, tags }: Props) {
  const { data, setData, errors } = useForm({
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

  // Local state for options UI
  const [productOptions, setProductOptions] = useState<ProductOption[]>(
    product.options.length > 0
      ? product.options.map((o) => ({ id: o.id, name: o.name, values: o.values }))
      : []
  )

  // Local state for variants UI
  const [variants, setVariants] = useState<VariantRow[]>(
    product.variants.map((v) => ({
      id: v.id,
      title: v.title,
      option1: v.option1,
      option2: v.option2,
      option3: v.option3,
      price: v.price?.toString() || '',
      sku: v.sku || '',
      quantity: v.inventoryQuantity?.toString() || '0',
      isActive: v.isActive,
    }))
  )

  const [images, setImages] = useState<MediaFile[]>(
    product.images
      .sort((a, b) => a.position - b.position)
      .map((img) => ({
        id: img.id,
        url: img.url,
        name: img.alt || `Image ${img.position + 1}`,
      }))
  )
  const [categorySearch, setCategorySearch] = useState('')
  const [tagSearch, setTagSearch] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleImageUpload = async (files: File[]): Promise<MediaFile[]> => {
    const formData = new FormData()
    files.forEach((f) => formData.append('files', f))

    const csrfToken = document.cookie
      .split('; ')
      .find((c) => c.startsWith('XSRF-TOKEN='))
      ?.split('=')[1]

    const res = await fetch('/admin/upload/images', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
      headers: csrfToken ? { 'x-xsrf-token': decodeURIComponent(csrfToken) } : {},
    })

    if (!res.ok) throw new Error('Upload failed')
    return res.json()
  }

  const handleSubmit = (e?: FormEvent) => {
    e?.preventDefault()
    if (isSubmitting) return

    const filledOptions = productOptions.filter((o) => o.name && o.values.length > 0)

    router.patch(`/admin/products/${product.id}`, {
      ...data,
      images: images.map((img, idx) => ({
        url: img.url,
        alt: img.name,
        position: idx,
      })),
      options: filledOptions.map((o) => ({ name: o.name, values: o.values })),
      variants: variants.map((v, idx) => ({
        title: v.title,
        option1: v.option1,
        option2: v.option2,
        option3: v.option3,
        price: v.price ? Number(v.price) : 0,
        sku: v.sku || '',
        inventoryQuantity: v.quantity ? Number(v.quantity) : 0,
        position: idx,
        isActive: v.isActive,
      })),
    }, {
      onStart: () => setIsSubmitting(true),
      onFinish: () => setIsSubmitting(false),
    })
  }

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
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

  // Option management
  const addOption = () => {
    if (productOptions.length >= 3) return
    setProductOptions([...productOptions, { name: '', values: [] }])
  }

  const updateOptionName = (index: number, name: string) => {
    const updated = [...productOptions]
    updated[index] = { ...updated[index], name }
    setProductOptions(updated)
  }

  const updateOptionValues = (index: number, values: string[]) => {
    const updated = [...productOptions]
    updated[index] = { ...updated[index], values }
    setProductOptions(updated)
    // Regenerate variants when option values change
    const newOptions = [...updated]
    const generated = generateVariantsFromOptions(newOptions)
    if (generated.length > 0) {
      // Preserve existing variant data where option combos match
      const merged = generated.map((gen) => {
        const existing = variants.find(
          (v) => v.option1 === gen.option1 && v.option2 === gen.option2 && v.option3 === gen.option3
        )
        return existing || gen
      })
      setVariants(merged)
    }
  }

  const removeOption = (index: number) => {
    const updated = productOptions.filter((_, i) => i !== index)
    setProductOptions(updated)
    if (updated.length === 0) {
      setVariants([])
    } else {
      const generated = generateVariantsFromOptions(updated)
      setVariants(generated)
    }
  }

  // Variant inline edit
  const updateVariant = (
    id: string,
    field: 'price' | 'sku' | 'quantity' | 'isActive',
    value: string | boolean
  ) => {
    setVariants(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)))
  }

  // Filter helpers
  const filteredCategories = categorySearch
    ? categories.filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()))
    : categories

  const filteredTags = tagSearch
    ? tags.filter((t) => t.name.toLowerCase().includes(tagSearch.toLowerCase()))
    : tags

  const createdDate = new Date(product.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  const updatedDate = new Date(product.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <AdminLayout
      title="Edit Product"
      description={product.title}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={isSubmitting}>
            <Copy className="h-4 w-4" />
            Duplicate
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isSubmitting}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
          <Button onClick={() => handleSubmit()} disabled={isSubmitting}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* ============================================================= */}
          {/* LEFT COLUMN                                                   */}
          {/* ============================================================= */}
          <div className="space-y-6 min-w-0">
            {/* ---- General ---- */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-semibold">General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="title" className="text-xs font-medium text-muted-foreground">
                      Title
                    </Label>
                    <Input
                      id="title"
                      value={data.title}
                      onChange={(e) => setData('title', e.target.value)}
                      className="h-10"
                    />
                    {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="slug" className="text-xs font-medium text-muted-foreground">
                      Handle
                    </Label>
                    <Input
                      id="slug"
                      value={data.slug}
                      onChange={(e) => setData('slug', e.target.value)}
                      className="h-10"
                    />
                    {errors.slug && <p className="text-xs text-destructive">{errors.slug}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="vendor" className="text-xs font-medium text-muted-foreground">
                      Vendor
                    </Label>
                    <Input
                      id="vendor"
                      value={data.vendor}
                      onChange={(e) => setData('vendor', e.target.value)}
                      placeholder="Brand or supplier"
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-medium text-muted-foreground">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    rows={4}
                    placeholder="Describe your product..."
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="shortDescription" className="text-xs font-medium text-muted-foreground">
                    Short Description
                  </Label>
                  <Textarea
                    id="shortDescription"
                    value={data.shortDescription}
                    onChange={(e) => setData('shortDescription', e.target.value)}
                    rows={2}
                    placeholder="Brief summary shown in product cards"
                  />
                </div>
              </CardContent>
            </Card>

            {/* ---- Media ---- */}
            <Card>
              <CardHeader className="py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-semibold">Media</CardTitle>
                  {images.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {images.length} image{images.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <MediaUploader
                  value={images}
                  onChange={setImages}
                  onUpload={handleImageUpload}
                  maxFiles={10}
                  maxSize={5 * 1024 * 1024}
                />
              </CardContent>
            </Card>

            {/* ---- Pricing (for simple products) ---- */}
            {data.type === 'simple' && (
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-semibold">Pricing</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={data.price}
                        onChange={(e) => setData('price', e.target.value)}
                        placeholder="0.00"
                        className="h-10"
                      />
                      {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Compare at</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={data.compareAtPrice}
                        onChange={(e) => setData('compareAtPrice', e.target.value)}
                        placeholder="0.00"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Cost price</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={data.costPrice}
                        onChange={(e) => setData('costPrice', e.target.value)}
                        placeholder="0.00"
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
                    <Label htmlFor="isTaxable" className="text-sm cursor-pointer">
                      Charge tax on this product
                    </Label>
                    <Switch
                      id="isTaxable"
                      checked={data.isTaxable}
                      onCheckedChange={(checked) => setData('isTaxable', checked)}
                    />
                  </div>

                  {data.isTaxable && (
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Tax Class</Label>
                      <Select
                        value={data.taxClassId}
                        onValueChange={(value) => setData('taxClassId', value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue placeholder="Select tax class" />
                        </SelectTrigger>
                        <SelectContent>
                          {taxClasses.map((tc) => (
                            <SelectItem key={tc.id} value={tc.id}>
                              {tc.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* ---- Inventory (for simple products) ---- */}
            {data.type === 'simple' && (
              <Card>
                <CardHeader className="py-4">
                  <CardTitle className="text-sm font-semibold">Inventory</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">SKU</Label>
                      <Input
                        value={data.sku}
                        onChange={(e) => setData('sku', e.target.value)}
                        placeholder="Stock keeping unit"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Barcode (EAN / UPC)</Label>
                      <Input
                        value={data.barcode}
                        onChange={(e) => setData('barcode', e.target.value)}
                        className="h-10"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ---- Options (for variable products) ---- */}
            {data.type === 'variable' && (
              <Card>
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">Options</CardTitle>
                    {productOptions.length < 3 && (
                      <Button type="button" variant="outline" size="sm" onClick={addOption}>
                        <Plus className="h-3.5 w-3.5" />
                        Add option
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {productOptions.length === 0 && (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-8 text-center">
                      <Package className="h-8 w-8 text-muted-foreground/40 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        No options yet. Add options like Size, Color, or Material to create variants.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={addOption}
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add option
                      </Button>
                    </div>
                  )}

                  {productOptions.map((option, idx) => (
                    <div
                      key={option.id || idx}
                      className="group relative rounded-lg border bg-muted/20 p-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <GripVertical className="h-4 w-4 mt-2.5 text-muted-foreground/40 shrink-0" />
                        <div className="flex-1 space-y-3">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">
                              Option name
                            </Label>
                            <Input
                              value={option.name}
                              onChange={(e) => updateOptionName(idx, e.target.value)}
                              placeholder="e.g. Size, Color, Material"
                              className="h-9"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-xs font-medium text-muted-foreground">
                              Values
                            </Label>
                            <TagInput
                              values={option.values}
                              onChange={(values) => updateOptionValues(idx, values)}
                              placeholder="Type a value and press Enter"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          className="mt-2 p-1 rounded text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* ---- Variants table ---- */}
            {data.type === 'variable' && variants.length > 0 && (
              <Card>
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold">
                      Variants
                      <Badge variant="secondary" className="ml-2 text-[10px]">
                        {variants.length}
                      </Badge>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 -mx-6 -mb-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="pl-6 w-8"></TableHead>
                        <TableHead>Variant</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead className="w-16">Active</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {variants.map((variant) => (
                        <TableRow key={variant.id} className={!variant.isActive ? 'opacity-50' : ''}>
                          <TableCell className="pl-6">
                            <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40" />
                          </TableCell>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-1.5">
                              {[variant.option1, variant.option2, variant.option3]
                                .filter(Boolean)
                                .map((val, i) => (
                                  <Badge key={i} variant="outline" className="text-[10px] font-normal">
                                    {val}
                                  </Badge>
                                ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              step="0.01"
                              value={variant.price}
                              onChange={(e) => updateVariant(variant.id, 'price', e.target.value)}
                              placeholder="0.00"
                              className="h-8 w-24 text-xs"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={variant.sku}
                              onChange={(e) => updateVariant(variant.id, 'sku', e.target.value)}
                              placeholder="SKU"
                              className="h-8 w-28 text-xs"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              value={variant.quantity}
                              onChange={(e) => updateVariant(variant.id, 'quantity', e.target.value)}
                              placeholder="0"
                              className="h-8 w-20 text-xs"
                            />
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={variant.isActive}
                              onCheckedChange={(checked) => updateVariant(variant.id, 'isActive', checked)}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ============================================================= */}
          {/* RIGHT COLUMN                                                  */}
          {/* ============================================================= */}
          <div className="space-y-6 lg:sticky lg:top-6">
            {/* ---- Status & Type ---- */}
            <Card>
              <CardHeader className="py-4">
                <CardTitle className="text-sm font-semibold">Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Status</Label>
                  <Select value={data.status} onValueChange={(value) => setData('status', value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Product type</Label>
                  <Select value={data.type} onValueChange={(value) => setData('type', value)}>
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="simple">Simple product</SelectItem>
                      <SelectItem value="variable">Product with variants</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
                  <Label htmlFor="isFeatured" className="text-sm cursor-pointer">
                    Featured
                  </Label>
                  <Switch
                    id="isFeatured"
                    checked={data.isFeatured}
                    onCheckedChange={(checked) => setData('isFeatured', checked)}
                  />
                </div>

                {/* Metadata */}
                <div className="rounded-md border bg-muted/30 p-3 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Created</span>
                    <span>{createdDate}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-muted-foreground">Last updated</span>
                    <span>{updatedDate}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ---- Pricing (sidebar for variable products) ---- */}
            {data.type === 'variable' && (
              <CollapsibleSection title="Default Pricing">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Price</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={data.price}
                      onChange={(e) => setData('price', e.target.value)}
                      placeholder="0.00"
                      className="h-10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Compare at</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={data.compareAtPrice}
                        onChange={(e) => setData('compareAtPrice', e.target.value)}
                        placeholder="0.00"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Cost</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={data.costPrice}
                        onChange={(e) => setData('costPrice', e.target.value)}
                        placeholder="0.00"
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
                    <Label htmlFor="isTaxableVar" className="text-sm cursor-pointer">
                      Charge tax
                    </Label>
                    <Switch
                      id="isTaxableVar"
                      checked={data.isTaxable}
                      onCheckedChange={(checked) => setData('isTaxable', checked)}
                    />
                  </div>
                  {data.isTaxable && (
                    <Select
                      value={data.taxClassId}
                      onValueChange={(value) => setData('taxClassId', value)}
                    >
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select tax class" />
                      </SelectTrigger>
                      <SelectContent>
                        {taxClasses.map((tc) => (
                          <SelectItem key={tc.id} value={tc.id}>
                            {tc.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </CollapsibleSection>
            )}

            {/* ---- Organization ---- */}
            <CollapsibleSection title="Organization">
              <div className="space-y-4">
                {/* Categories */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Categories</Label>
                  {categories.length > 6 && (
                    <div className="relative mb-1.5">
                      <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Search categories..."
                        className="h-8 pl-8 text-xs"
                      />
                    </div>
                  )}
                  <div className="max-h-40 overflow-y-auto space-y-1 rounded-md border p-2">
                    {filteredCategories.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2 text-center">No categories found</p>
                    )}
                    {filteredCategories.map((category) => (
                      <div key={category.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`cat-${category.id}`}
                          checked={data.categoryIds.includes(category.id)}
                          onCheckedChange={(checked) =>
                            handleCategoryToggle(category.id, checked as boolean)
                          }
                        />
                        <Label
                          htmlFor={`cat-${category.id}`}
                          className="text-xs font-normal cursor-pointer truncate"
                          style={{ paddingLeft: `${category.depth * 12}px` }}
                        >
                          {category.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.categoryIds && (
                    <p className="text-xs text-destructive">{errors.categoryIds}</p>
                  )}
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Tags</Label>
                  {tags.length > 6 && (
                    <div className="relative mb-1.5">
                      <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        placeholder="Search tags..."
                        className="h-8 pl-8 text-xs"
                      />
                    </div>
                  )}
                  <div className="max-h-32 overflow-y-auto space-y-1 rounded-md border p-2">
                    {filteredTags.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2 text-center">No tags found</p>
                    )}
                    {filteredTags.map((tag) => (
                      <div key={tag.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`tag-${tag.id}`}
                          checked={data.tagIds.includes(tag.id)}
                          onCheckedChange={(checked) =>
                            handleTagToggle(tag.id, checked as boolean)
                          }
                        />
                        <Label htmlFor={`tag-${tag.id}`} className="text-xs font-normal cursor-pointer">
                          {tag.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                  {errors.tagIds && (
                    <p className="text-xs text-destructive">{errors.tagIds}</p>
                  )}
                </div>
              </div>
            </CollapsibleSection>

            {/* ---- Shipping ---- */}
            <CollapsibleSection title="Shipping">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-md border px-3 py-2.5">
                  <Label htmlFor="requiresShipping" className="text-sm cursor-pointer">
                    Physical product
                  </Label>
                  <Switch
                    id="requiresShipping"
                    checked={data.requiresShipping}
                    onCheckedChange={(checked) => setData('requiresShipping', checked)}
                  />
                </div>

                {data.requiresShipping && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Weight</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={data.weight}
                        onChange={(e) => setData('weight', e.target.value)}
                        placeholder="0"
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Unit</Label>
                      <Select
                        value={data.weightUnit}
                        onValueChange={(value) => setData('weightUnit', value)}
                      >
                        <SelectTrigger className="h-10">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="kg">kg</SelectItem>
                          <SelectItem value="g">g</SelectItem>
                          <SelectItem value="lb">lb</SelectItem>
                          <SelectItem value="oz">oz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleSection>

            {/* ---- SEO ---- */}
            <CollapsibleSection title="SEO" defaultOpen={false}>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Meta title</Label>
                  <Input
                    value={data.metaTitle}
                    onChange={(e) => setData('metaTitle', e.target.value)}
                    placeholder="Page title for search engines"
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Meta description</Label>
                  <Textarea
                    value={data.metaDescription}
                    onChange={(e) => setData('metaDescription', e.target.value)}
                    rows={3}
                    placeholder="Brief description for search results"
                  />
                </div>

                {/* SEO preview */}
                {(data.metaTitle || data.title) && (
                  <div className="rounded-md border bg-muted/30 p-3 space-y-0.5">
                    <p className="text-[11px] text-muted-foreground uppercase tracking-wider">
                      Search preview
                    </p>
                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">
                      {data.metaTitle || data.title}
                    </p>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 truncate">
                      yourstore.com/products/{data.slug || 'product-handle'}
                    </p>
                    {data.metaDescription && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {data.metaDescription}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}
