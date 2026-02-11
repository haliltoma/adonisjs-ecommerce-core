import { Head, useForm } from '@inertiajs/react'
import {
  Globe,
  Map,
  Search,
} from 'lucide-react'

import AdminLayout from '@/components/admin/AdminLayout'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'

interface Props {
  settings: {
    metaTitle: string
    metaDescription: string
    robotsTxt: string
    sitemapEnabled: boolean
    googleVerification: string
    bingVerification: string
    socialImage: string
    canonicalDomain: string
  }
  sitemapUrl: string
}

export default function SeoSettingsPage({ settings, sitemapUrl }: Props) {
  const { data, setData, patch, processing } = useForm(settings)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    patch('/admin/settings/seo')
  }

  return (
    <AdminLayout
      title="SEO Settings"
      description="Configure search engine optimization settings"
      actions={
        <Button type="submit" form="seo-form" disabled={processing}>
          {processing ? 'Saving...' : 'Save Changes'}
        </Button>
      }
    >
      <Head title="SEO Settings - Admin" />
      <div className="animate-fade-in">
        <form id="seo-form" onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Search className="h-5 w-5" />Meta Tags</CardTitle>
              <CardDescription>Default meta tags for your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Default Meta Title</Label>
                <Input value={data.metaTitle} onChange={(e) => setData('metaTitle', e.target.value)} placeholder="My Store - Best Products" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Default Meta Description</Label>
                  <span className="text-[11px] text-muted-foreground">{data.metaDescription.length}/160</span>
                </div>
                <Textarea value={data.metaDescription} onChange={(e) => setData('metaDescription', e.target.value)} placeholder="Describe your store..." rows={3} maxLength={160} />
              </div>
              <div className="space-y-2">
                <Label>Canonical Domain</Label>
                <Input value={data.canonicalDomain} onChange={(e) => setData('canonicalDomain', e.target.value)} placeholder="https://www.example.com" />
                <p className="text-muted-foreground text-xs">Used for canonical URL generation</p>
              </div>
              <div className="space-y-2">
                <Label>Default Social Share Image URL</Label>
                <Input value={data.socialImage} onChange={(e) => setData('socialImage', e.target.value)} placeholder="https://example.com/og-image.jpg" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Map className="h-5 w-5" />Sitemap</CardTitle>
              <CardDescription>Sitemap configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <Label>Enable Sitemap</Label>
                  <p className="text-[11px] text-muted-foreground">Auto-generate sitemap.xml for search engines</p>
                </div>
                <Switch checked={data.sitemapEnabled} onCheckedChange={(v) => setData('sitemapEnabled', v)} />
              </div>
              {data.sitemapEnabled && sitemapUrl && (
                <div className="rounded-lg bg-muted/50 p-3 text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Your sitemap URL:</p>
                  <a href={sitemapUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-mono text-xs">{sitemapUrl}</a>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" />Robots.txt</CardTitle>
              <CardDescription>Control how search engines crawl your site</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={data.robotsTxt}
                onChange={(e) => setData('robotsTxt', e.target.value)}
                rows={8}
                className="font-mono text-xs"
                placeholder={'User-agent: *\nAllow: /\n\nSitemap: https://example.com/sitemap.xml'}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Verification</CardTitle>
              <CardDescription>Search engine verification codes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Google Search Console</Label>
                <Input value={data.googleVerification} onChange={(e) => setData('googleVerification', e.target.value)} placeholder="Verification code" />
              </div>
              <div className="space-y-2">
                <Label>Bing Webmaster Tools</Label>
                <Input value={data.bingVerification} onChange={(e) => setData('bingVerification', e.target.value)} placeholder="Verification code" />
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </AdminLayout>
  )
}
