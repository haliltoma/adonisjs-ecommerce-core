import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowLeft, Save } from 'lucide-react'
import { FormEvent, useEffect, useRef } from 'react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { slugify } from '@/lib/utils'

interface Props {
  parentOptions: { id: string; name: string; depth: number }[]
}

export default function CreateCategory({ parentOptions }: Props) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    imageUrl: '',
    metaTitle: '',
    metaDescription: '',
    isActive: true,
  })

  const slugManuallyEdited = useRef(false)
  useEffect(() => {
    if (data.name && !slugManuallyEdited.current) {
      setData('slug', slugify(data.name))
    }
  }, [data.name])

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    post('/admin/categories')
  }

  return (
    <AdminLayout
      title="Create Category"
      description="Add a new product category"
      actions={
        <Button variant="outline" asChild>
          <Link href="/admin/categories">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
      }
    >
      <Head title="Create Category - Admin" />

      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl space-y-6 animate-fade-in">
        <Card className="animate-fade-up delay-100">
          <CardHeader>
            <CardTitle className="font-display text-lg">Category Information</CardTitle>
            <CardDescription>
              Basic information about the category
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                  placeholder="Electronics"
                  required
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  value={data.slug}
                  onChange={(e) => { slugManuallyEdited.current = true; setData('slug', e.target.value) }}
                  placeholder="electronics"
                  required
                  className="h-11 border-border/60 focus-visible:border-accent"
                />
                {errors.slug && (
                  <p className="text-sm text-destructive">{errors.slug}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</Label>
              <Textarea
                id="description"
                value={data.description}
                onChange={(e) => setData('description', e.target.value)}
                placeholder="Category description..."
                rows={4}
                className="border-border/60 focus-visible:border-accent"
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentId" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Parent Category</Label>
              <Select
                value={data.parentId || 'none'}
                onValueChange={(value) => setData('parentId', value === 'none' ? '' : value)}
              >
                <SelectTrigger id="parentId" className="h-11 border-border/60">
                  <SelectValue placeholder="None (Root Category)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (Root Category)</SelectItem>
                  {parentOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {'\u00A0'.repeat(option.depth * 4)}
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.parentId && (
                <p className="text-sm text-destructive">{errors.parentId}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Image URL</Label>
              <Input
                id="imageUrl"
                type="url"
                value={data.imageUrl}
                onChange={(e) => setData('imageUrl', e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="h-11 border-border/60 focus-visible:border-accent"
              />
              {errors.imageUrl && (
                <p className="text-sm text-destructive">{errors.imageUrl}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-200">
          <CardHeader>
            <CardTitle className="font-display text-lg">SEO</CardTitle>
            <CardDescription>
              Search engine optimization settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="metaTitle" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Meta Title</Label>
              <Input
                id="metaTitle"
                value={data.metaTitle}
                onChange={(e) => setData('metaTitle', e.target.value)}
                placeholder="Category name"
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
                placeholder="Description for search engines..."
                rows={3}
                className="border-border/60 focus-visible:border-accent"
              />
              {errors.metaDescription && (
                <p className="text-sm text-destructive">{errors.metaDescription}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="animate-fade-up delay-300">
          <CardHeader>
            <CardTitle className="font-display text-lg">Status</CardTitle>
            <CardDescription>Control category visibility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isActive">Active</Label>
                <p className="text-muted-foreground text-[11px] tracking-wide">
                  Make this category visible to customers
                </p>
              </div>
              <Switch
                id="isActive"
                checked={data.isActive}
                onCheckedChange={(checked) => setData('isActive', checked)}
              />
            </div>
            {errors.isActive && (
              <p className="text-sm text-destructive mt-2">{errors.isActive}</p>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4 animate-fade-up delay-400">
          <Button variant="outline" asChild type="button">
            <Link href="/admin/categories">Cancel</Link>
          </Button>
          <Button type="submit" disabled={processing} className="tracking-wide">
            <Save className="mr-2 h-4 w-4" />
            Create Category
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
