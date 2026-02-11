import { Head, Link, router } from '@inertiajs/react'
import { Calendar, ChevronRight, Clock, Tag } from 'lucide-react'

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
  featuredImageUrl: string | null
  tags: string[]
  readingTime: number
  publishedAt: string | null
  category: { name: string; slug: string } | null
}

interface BlogCategory {
  id: string
  name: string
  slug: string
  postCount: number
}

interface Props {
  posts: {
    data: BlogPost[]
    meta: {
      total: number
      perPage: number
      currentPage: number
      lastPage: number
    }
  }
  categories: BlogCategory[]
  featuredPosts: BlogPost[]
  activeCategory: string
}

function formatBlogDate(dateStr: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date)
}

function PostCard({ post }: { post: BlogPost }) {
  return (
    <Card className="group overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow">
      <Link href={`/blog/${post.slug}`}>
        <AspectRatio ratio={16 / 9}>
          {post.featuredImageUrl ? (
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="font-display text-2xl text-muted-foreground/30">Blog</span>
            </div>
          )}
        </AspectRatio>
      </Link>
      <CardContent className="p-5">
        {post.category && (
          <Link
            href={`/blog?category=${post.category.slug}`}
            className="text-xs font-semibold tracking-[0.15em] uppercase text-accent hover:underline"
          >
            {post.category.name}
          </Link>
        )}
        <Link href={`/blog/${post.slug}`}>
          <h3 className="font-display text-lg mt-2 leading-tight group-hover:text-accent transition-colors">
            {post.title}
          </h3>
        </Link>
        {post.excerpt && (
          <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{post.excerpt}</p>
        )}
        <div className="flex items-center gap-3 mt-4 text-xs text-muted-foreground">
          {post.publishedAt && (
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatBlogDate(post.publishedAt)}
            </span>
          )}
          {post.readingTime > 0 && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {post.readingTime} min read
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <div className="group relative overflow-hidden rounded-xl">
      <Link href={`/blog/${post.slug}`}>
        <AspectRatio ratio={16 / 7}>
          {post.featuredImageUrl ? (
            <img
              src={post.featuredImageUrl}
              alt={post.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <span className="font-display text-4xl text-muted-foreground/20">Featured</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        </AspectRatio>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          {post.category && (
            <Badge variant="secondary" className="mb-3 bg-white/20 text-white backdrop-blur-sm border-0">
              {post.category.name}
            </Badge>
          )}
          <h2 className="font-display text-2xl sm:text-3xl leading-tight">
            {post.title}
          </h2>
          {post.excerpt && (
            <p className="text-white/80 text-sm mt-2 line-clamp-2 max-w-2xl">{post.excerpt}</p>
          )}
          <div className="flex items-center gap-3 mt-3 text-xs text-white/60">
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatBlogDate(post.publishedAt)}
              </span>
            )}
            {post.readingTime > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {post.readingTime} min read
              </span>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}

export default function BlogIndex({ posts, categories, featuredPosts, activeCategory }: Props) {
  const { t } = useTranslation()

  const handleCategoryFilter = (slug: string) => {
    router.get('/blog', slug ? { category: slug } : {}, { preserveScroll: true })
  }

  return (
    <StorefrontLayout>
      <Head title="Blog" />

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">{t('storefront.layout.home')}</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Blog</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* Hero */}
      <section className="relative py-16 grain">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-up">
            <span className="text-xs font-semibold tracking-[0.2em] uppercase text-accent">
              Blog
            </span>
            <h1 className="font-display text-4xl sm:text-5xl tracking-tight mt-3">
              Stories & Insights
            </h1>
            <p className="text-muted-foreground max-w-lg mx-auto mt-4">
              Discover tips, guides, and the latest updates from our team.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Featured posts */}
        {featuredPosts.length > 0 && !activeCategory && (
          <div className="mb-12 animate-fade-up">
            {featuredPosts.length === 1 ? (
              <FeaturedPost post={featuredPosts[0]} />
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <FeaturedPost post={featuredPosts[0]} />
                <div className="grid gap-6">
                  {featuredPosts.slice(1, 3).map((post) => (
                    <div key={post.id} className="group relative overflow-hidden rounded-xl">
                      <Link href={`/blog/${post.slug}`}>
                        <AspectRatio ratio={16 / 7}>
                          {post.featuredImageUrl ? (
                            <img src={post.featuredImageUrl} alt={post.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-muted">
                              <span className="font-display text-xl text-muted-foreground/20">Blog</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        </AspectRatio>
                        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                          <h3 className="font-display text-lg leading-tight">{post.title}</h3>
                          <div className="flex items-center gap-2 mt-1 text-xs text-white/60">
                            {post.publishedAt && <span>{formatBlogDate(post.publishedAt)}</span>}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Category filter */}
        {categories.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-8 animate-fade-up">
            <Button
              variant={!activeCategory ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCategoryFilter('')}
            >
              All
            </Button>
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={activeCategory === cat.slug ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleCategoryFilter(cat.slug)}
              >
                {cat.name}
                <Badge variant="secondary" className="ml-1.5 text-[10px] px-1.5 py-0">
                  {cat.postCount}
                </Badge>
              </Button>
            ))}
          </div>
        )}

        <Separator className="mb-8" />

        {/* Posts grid */}
        {posts.data.length === 0 ? (
          <div className="text-center py-16 animate-fade-up">
            <Tag className="h-12 w-12 mx-auto text-muted-foreground/30" />
            <h3 className="font-display text-xl mt-4">No posts found</h3>
            <p className="text-muted-foreground mt-2">
              {activeCategory ? 'Try selecting a different category.' : 'Check back soon for new content.'}
            </p>
            {activeCategory && (
              <Button variant="outline" className="mt-4" onClick={() => handleCategoryFilter('')}>
                View all posts
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 animate-fade-up">
              {posts.data.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>

            {/* Pagination */}
            {posts.meta.lastPage > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  disabled={posts.meta.currentPage <= 1}
                  onClick={() => router.get('/blog', { page: posts.meta.currentPage - 1, category: activeCategory || undefined }, { preserveScroll: true })}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {posts.meta.currentPage} of {posts.meta.lastPage}
                </span>
                <Button
                  variant="outline"
                  disabled={posts.meta.currentPage >= posts.meta.lastPage}
                  onClick={() => router.get('/blog', { page: posts.meta.currentPage + 1, category: activeCategory || undefined }, { preserveScroll: true })}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </StorefrontLayout>
  )
}
