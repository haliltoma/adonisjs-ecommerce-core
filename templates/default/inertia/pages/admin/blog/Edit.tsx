import { Head, Link, useForm } from '@inertiajs/react'
import { ArrowLeft, Eye, Loader2, Save } from 'lucide-react'
import { useRef } from 'react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Badge } from '@/components/ui/badge'
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

interface Category {
  id: string
  name: string
}

interface BlogPostData {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  featuredImageUrl: string | null
  status: 'draft' | 'published' | 'archived'
  blogCategoryId: string | null
  tags: string[]
  metaTitle: string | null
  metaDescription: string | null
  isFeatured: boolean
  publishedAt: string | null
  viewCount: number
  createdAt: string
}

interface Props {
  post: BlogPostData | null
  categories: Category[]
}

export default function BlogEdit({ post, categories }: Props) {
  const isEditing = !!post
  const { data, setData, processing, errors, post: submitPost, patch } = useForm({
    title: post?.title || '',
    slug: post?.slug || '',
    excerpt: post?.excerpt || '',
    content: post?.content || '',
    featuredImageUrl: post?.featuredImageUrl || '',
    status: post?.status || 'draft',
    blogCategoryId: post?.blogCategoryId || '',
    tags: (post?.tags || []).join(', '),
    metaTitle: post?.metaTitle || '',
    metaDescription: post?.metaDescription || '',
    isFeatured: post?.isFeatured || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const payload = {
      ...data,
      tags: data.tags ? data.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      blogCategoryId: data.blogCategoryId || null,
    }

    if (isEditing) {
      patch(`/admin/blog/${post!.id}`, { data: payload })
    } else {
      submitPost('/admin/blog', { data: payload })
    }
  }

  const slugManuallyEdited = useRef(!!post?.slug)
  const generateSlug = () => {
    if (data.title && !slugManuallyEdited.current) {
      setData('slug', data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''))
    }
  }

  return (
    <AdminLayout
      title={isEditing ? 'Edit Post' : 'New Post'}
      description={isEditing ? `Editing "${post!.title}"` : 'Create a new blog post'}
      actions={
        <div className="flex items-center gap-2">
          {isEditing && post!.status === 'published' && (
            <Button variant="outline" size="sm" asChild>
              <a href={`/blog/${post!.slug}`} target="_blank" rel="noopener">
                <Eye className="mr-2 h-4 w-4" />
                View
              </a>
            </Button>
          )}
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      }
    >
      <Head title={`${isEditing ? 'Edit' : 'New'} Post - Admin`} />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-3 animate-fade-in">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="animate-fade-up">
              <CardHeader>
                <CardTitle>Content</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    onBlur={generateSlug}
                    placeholder="Post title"
                  />
                  {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-sm">/blog/</span>
                    <Input
                      id="slug"
                      value={data.slug}
                      onChange={(e) => { slugManuallyEdited.current = true; setData('slug', e.target.value) }}
                      placeholder="post-url-slug"
                    />
                  </div>
                  {errors.slug && <p className="text-sm text-destructive">{errors.slug}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    value={data.excerpt}
                    onChange={(e) => setData('excerpt', e.target.value)}
                    placeholder="Short description for the post listing..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={data.content}
                    onChange={(e) => setData('content', e.target.value)}
                    placeholder="Write your blog post content here... (HTML supported)"
                    rows={16}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>

            {/* SEO */}
            <Card className="animate-fade-up delay-100">
              <CardHeader>
                <CardTitle>SEO</CardTitle>
                <CardDescription>Search engine optimization settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={data.metaTitle}
                    onChange={(e) => setData('metaTitle', e.target.value)}
                    placeholder={data.title || 'Meta title (defaults to post title)'}
                  />
                  <p className="text-xs text-muted-foreground">
                    {(data.metaTitle || data.title).length}/60 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={data.metaDescription}
                    onChange={(e) => setData('metaDescription', e.target.value)}
                    placeholder="Meta description for search engines..."
                    rows={2}
                  />
                  <p className="text-xs text-muted-foreground">
                    {data.metaDescription.length}/160 characters
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="animate-fade-up delay-75">
              <CardHeader>
                <CardTitle>Publish</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={data.status}
                    onValueChange={(v) => setData('status', v as typeof data.status)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {isEditing && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Views:</span>
                    <Badge variant="secondary">{post!.viewCount.toLocaleString()}</Badge>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Label htmlFor="isFeatured">Featured post</Label>
                  <Switch
                    id="isFeatured"
                    checked={data.isFeatured}
                    onCheckedChange={(v) => setData('isFeatured', v)}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={processing}>
                  {processing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  {isEditing ? 'Update Post' : 'Create Post'}
                </Button>
              </CardContent>
            </Card>

            <Card className="animate-fade-up delay-100">
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={data.blogCategoryId || 'none'}
                    onValueChange={(v) => setData('blogCategoryId', v === 'none' ? '' : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={data.tags}
                    onChange={(e) => setData('tags', e.target.value)}
                    placeholder="tag1, tag2, tag3"
                  />
                  <p className="text-xs text-muted-foreground">Comma-separated</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="featuredImageUrl">Featured Image URL</Label>
                  <Input
                    id="featuredImageUrl"
                    value={data.featuredImageUrl}
                    onChange={(e) => setData('featuredImageUrl', e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </AdminLayout>
  )
}
