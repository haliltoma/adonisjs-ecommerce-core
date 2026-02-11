import { Head, Link } from '@inertiajs/react'
import { ArrowLeft, Calendar, Clock, Eye, Tag } from 'lucide-react'

import StorefrontLayout from '@/components/storefront/StorefrontLayout'
import { useTranslation } from '@/hooks/use-translation'
import { AspectRatio } from '@/components/ui/aspect-ratio'
import { Badge } from '@/components/ui/badge'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string | null
  featuredImageUrl: string | null
  tags: string[]
  metaTitle: string
  metaDescription: string | null
  viewCount: number
  readingTime: number
  publishedAt: string | null
  category: { name: string; slug: string } | null
}

interface RelatedPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImageUrl: string | null
  tags: string[]
  readingTime: number
  publishedAt: string | null
  category: { name: string; slug: string } | null
}

interface Props {
  post: BlogPost
  relatedPosts: RelatedPost[]
}

function formatBlogDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}

export default function BlogShow({ post, relatedPosts }: Props) {
  const { t } = useTranslation()

  return (
    <StorefrontLayout>
      <Head>
        <title>{post.metaTitle}</title>
        {post.metaDescription && <meta name="description" content={post.metaDescription} />}
        <meta property="og:title" content={post.metaTitle} />
        {post.metaDescription && <meta property="og:description" content={post.metaDescription} />}
        {post.featuredImageUrl && <meta property="og:image" content={post.featuredImageUrl} />}
        <meta property="og:type" content="article" />
        {post.publishedAt && <meta property="article:published_time" content={post.publishedAt} />}
      </Head>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">{t('storefront.layout.home')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/blog">Blog</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="truncate max-w-[200px]">{post.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <article className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="text-center mb-10 animate-fade-up">
          {post.category && (
            <Link
              href={`/blog?category=${post.category.slug}`}
              className="text-xs font-semibold tracking-[0.2em] uppercase text-accent hover:underline"
            >
              {post.category.name}
            </Link>
          )}
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl tracking-tight mt-3 leading-tight">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-muted-foreground text-lg mt-4 max-w-2xl mx-auto">{post.excerpt}</p>
          )}
          <div className="flex items-center justify-center gap-4 mt-6 text-sm text-muted-foreground">
            {post.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                {formatBlogDate(post.publishedAt)}
              </span>
            )}
            {post.readingTime > 0 && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {post.readingTime} min read
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {post.viewCount.toLocaleString()} views
            </span>
          </div>
        </header>

        {/* Featured image */}
        {post.featuredImageUrl && (
          <div className="mb-10 overflow-hidden rounded-xl animate-fade-up delay-100">
            <AspectRatio ratio={16 / 9}>
              <img
                src={post.featuredImageUrl}
                alt={post.title}
                className="h-full w-full object-cover"
              />
            </AspectRatio>
          </div>
        )}

        {/* Content */}
        {post.content && (
          <div
            className="prose prose-lg max-w-none prose-headings:font-display prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl animate-fade-up delay-200"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="mt-10 animate-fade-up delay-200">
            <Separator className="mb-6" />
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Back link */}
        <div className="mt-10">
          <Button variant="outline" asChild>
            <Link href="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Blog
            </Link>
          </Button>
        </div>
      </article>

      {/* Related posts */}
      {relatedPosts.length > 0 && (
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl text-center mb-8 animate-fade-up">
              Related Posts
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-up delay-100">
              {relatedPosts.map((related) => (
                <Card key={related.id} className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
                  <Link href={`/blog/${related.slug}`}>
                    <AspectRatio ratio={16 / 9}>
                      {related.featuredImageUrl ? (
                        <img
                          src={related.featuredImageUrl}
                          alt={related.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <span className="font-display text-xl text-muted-foreground/20">Blog</span>
                        </div>
                      )}
                    </AspectRatio>
                  </Link>
                  <CardContent className="p-5">
                    {related.category && (
                      <span className="text-xs font-semibold tracking-[0.15em] uppercase text-accent">
                        {related.category.name}
                      </span>
                    )}
                    <Link href={`/blog/${related.slug}`}>
                      <h3 className="font-display text-lg mt-2 leading-tight group-hover:text-accent transition-colors">
                        {related.title}
                      </h3>
                    </Link>
                    {related.excerpt && (
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{related.excerpt}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                      {related.publishedAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatBlogDate(related.publishedAt)}
                        </span>
                      )}
                      {related.readingTime > 0 && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {related.readingTime} min
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
    </StorefrontLayout>
  )
}
