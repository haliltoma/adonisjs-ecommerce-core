import { Head, useForm, router, usePage } from '@inertiajs/react'
import { useState } from 'react'
import {
  Box,
  Bot,
  Database,
  DollarSign,
  Globe,
  Loader2,
  Package,
  Receipt,
  Search,
  Settings,
  Store,
  Trash2,
  Truck,
} from 'lucide-react'

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

interface Settings {
  storeName: string
  storeEmail: string
  storePhone: string
  storeAddress: string
  storeLogo: string | null
  storeFavicon: string | null
  currency: string
  timezone: string
  locale: string
  taxEnabled: boolean
  taxRate: number
  taxIncludedInPrice: boolean
  shippingEnabled: boolean
  freeShippingThreshold: number | null
  lowStockThreshold: number
  orderPrefix: string
  metaTitle: string
  metaDescription: string
}

interface Props {
  settings: Settings
  currencies: Array<{ code: string; name: string }>
  timezones: string[]
  locales: Array<{ code: string; name: string }>
}

function AiSettingsTab() {
  const [aiData, setAiData] = useState({
    enabled: false,
    provider: 'openai',
    model: 'gpt-4o',
    apiKey: '',
    baseUrl: '',
  })
  const [aiSaving, setAiSaving] = useState(false)
  const [aiMessage, setAiMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleAiSave = () => {
    setAiSaving(true)
    setAiMessage(null)
    router.patch('/admin/settings/ai', aiData, {
      preserveScroll: true,
      onSuccess: () => setAiMessage({ type: 'success', text: 'AI settings saved' }),
      onError: () => setAiMessage({ type: 'error', text: 'Failed to save AI settings' }),
      onFinish: () => setAiSaving(false),
    })
  }

  const providerModels: Record<string, string[]> = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo'],
    anthropic: ['claude-sonnet-4-20250514', 'claude-haiku-4-20250414'],
    custom: [],
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg">AI Settings</CardTitle>
        <CardDescription className="text-sm">
          Configure AI-powered component generation for the theme customizer.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {aiMessage && (
          <div className={`rounded-lg border p-4 text-sm ${aiMessage.type === 'success' ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-800'}`}>
            {aiMessage.text}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div>
            <Label className="text-sm font-medium">Enable AI</Label>
            <p className="text-xs text-muted-foreground">Allow AI-powered component generation in the customizer</p>
          </div>
          <Switch
            checked={aiData.enabled}
            onCheckedChange={(checked) => setAiData({ ...aiData, enabled: checked })}
          />
        </div>

        {aiData.enabled && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Provider</Label>
              <Select value={aiData.provider} onValueChange={(v) => setAiData({ ...aiData, provider: v, model: providerModels[v]?.[0] || '' })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="anthropic">Anthropic</SelectItem>
                  <SelectItem value="custom">Custom (OpenAI-compatible)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Model</Label>
              {providerModels[aiData.provider]?.length ? (
                <Select value={aiData.model} onValueChange={(v) => setAiData({ ...aiData, model: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {providerModels[aiData.provider].map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  value={aiData.model}
                  onChange={(e) => setAiData({ ...aiData, model: e.target.value })}
                  placeholder="e.g., gpt-4o"
                />
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">API Key</Label>
              <Input
                type="password"
                value={aiData.apiKey}
                onChange={(e) => setAiData({ ...aiData, apiKey: e.target.value })}
                placeholder="sk-..."
              />
              <p className="text-xs text-muted-foreground">Your API key is stored securely and never exposed publicly.</p>
            </div>

            {aiData.provider === 'custom' && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Base URL</Label>
                <Input
                  value={aiData.baseUrl}
                  onChange={(e) => setAiData({ ...aiData, baseUrl: e.target.value })}
                  placeholder="https://api.example.com/v1"
                />
              </div>
            )}
          </>
        )}

        <Button onClick={handleAiSave} disabled={aiSaving}>
          {aiSaving ? 'Saving...' : 'Save AI Settings'}
        </Button>
      </CardContent>
    </Card>
  )
}

export default function SettingsIndex({ settings, currencies, timezones, locales }: Props) {
  const { data, setData, patch, processing, errors } = useForm(settings)
  const { props } = usePage<{ flash?: { success?: string; error?: string } }>()
  const [clearingCache, setClearingCache] = useState<string | null>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    patch('/admin/settings')
  }

  const handleClearCache = (scope: string) => {
    setClearingCache(scope)
    router.post('/admin/settings/cache/clear', { scope }, {
      preserveScroll: true,
      onFinish: () => setClearingCache(null),
    })
  }

  return (
    <AdminLayout
      title="Settings"
      description="Configure your store settings"
      actions={
        <Button onClick={() => patch('/admin/settings')} disabled={processing}>
          {processing ? 'Saving...' : 'Save Changes'}
        </Button>
      }
    >
      <Head title="Settings - Admin" />

      <div className="animate-fade-in">
        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="general" className="space-y-6">
            <TabsList className="grid w-full grid-cols-7">
              <TabsTrigger value="general" className="gap-2 text-sm">
                <Store className="h-4 w-4" />
                <span className="hidden sm:inline">General</span>
              </TabsTrigger>
              <TabsTrigger value="tax" className="gap-2 text-sm">
                <Receipt className="h-4 w-4" />
                <span className="hidden sm:inline">Tax</span>
              </TabsTrigger>
              <TabsTrigger value="shipping" className="gap-2 text-sm">
                <Truck className="h-4 w-4" />
                <span className="hidden sm:inline">Shipping</span>
              </TabsTrigger>
              <TabsTrigger value="inventory" className="gap-2 text-sm">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Inventory</span>
              </TabsTrigger>
              <TabsTrigger value="seo" className="gap-2 text-sm">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">SEO</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2 text-sm">
                <Bot className="h-4 w-4" />
                <span className="hidden sm:inline">AI</span>
              </TabsTrigger>
              <TabsTrigger value="system" className="gap-2 text-sm">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">System</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="animate-fade-up">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">General Settings</CardTitle>
                  <CardDescription className="text-sm">
                    Manage your store's basic information and regional settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="storeName" className="text-sm">Store Name</Label>
                      <Input
                        id="storeName"
                        value={data.storeName}
                        onChange={(e) => setData('storeName', e.target.value)}
                        placeholder="My Store"
                        className="text-sm"
                      />
                      {errors.storeName && (
                        <p className="text-[11px] text-destructive">{errors.storeName}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="storeEmail" className="text-sm">Store Email</Label>
                      <Input
                        id="storeEmail"
                        type="email"
                        value={data.storeEmail}
                        onChange={(e) => setData('storeEmail', e.target.value)}
                        placeholder="store@example.com"
                        className="text-sm"
                      />
                      {errors.storeEmail && (
                        <p className="text-[11px] text-destructive">{errors.storeEmail}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="storePhone" className="text-sm">Store Phone</Label>
                      <Input
                        id="storePhone"
                        type="tel"
                        value={data.storePhone}
                        onChange={(e) => setData('storePhone', e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="text-sm"
                      />
                      {errors.storePhone && (
                        <p className="text-[11px] text-destructive">{errors.storePhone}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="orderPrefix" className="text-sm">Order Number Prefix</Label>
                      <Input
                        id="orderPrefix"
                        value={data.orderPrefix}
                        onChange={(e) => setData('orderPrefix', e.target.value)}
                        placeholder="ORD-"
                        className="text-sm"
                      />
                      {errors.orderPrefix && (
                        <p className="text-[11px] text-destructive">{errors.orderPrefix}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeAddress" className="text-sm">Store Address</Label>
                    <Textarea
                      id="storeAddress"
                      value={data.storeAddress}
                      onChange={(e) => setData('storeAddress', e.target.value)}
                      placeholder="Enter your store's physical address"
                      rows={3}
                      className="text-sm"
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm">Currency</Label>
                      <Select
                        value={data.currency}
                        onValueChange={(value) => setData('currency', value)}
                      >
                        <SelectTrigger id="currency" className="text-sm">
                          <DollarSign className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-sm">Timezone</Label>
                      <Select
                        value={data.timezone}
                        onValueChange={(value) => setData('timezone', value)}
                      >
                        <SelectTrigger id="timezone" className="text-sm">
                          <Globe className="mr-2 h-4 w-4" />
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          {timezones.map((tz) => (
                            <SelectItem key={tz} value={tz}>
                              {tz}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="locale" className="text-sm">Locale</Label>
                      <Select
                        value={data.locale}
                        onValueChange={(value) => setData('locale', value)}
                      >
                        <SelectTrigger id="locale" className="text-sm">
                          <SelectValue placeholder="Select locale" />
                        </SelectTrigger>
                        <SelectContent>
                          {locales.map((locale) => (
                            <SelectItem key={locale.code} value={locale.code}>
                              {locale.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tax" className="animate-fade-up">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Tax Settings</CardTitle>
                  <CardDescription className="text-sm">
                    Configure how taxes are calculated for your store
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="taxEnabled" className="text-sm">Enable Tax Calculation</Label>
                      <p className="text-[11px] text-muted-foreground">
                        Calculate and apply taxes to orders
                      </p>
                    </div>
                    <Switch
                      id="taxEnabled"
                      checked={data.taxEnabled}
                      onCheckedChange={(checked) => setData('taxEnabled', checked)}
                    />
                  </div>

                  {data.taxEnabled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="taxRate" className="text-sm">Default Tax Rate (%)</Label>
                        <Input
                          id="taxRate"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={data.taxRate.toString()}
                          onChange={(e) => setData('taxRate', parseFloat(e.target.value) || 0)}
                          placeholder="0.00"
                          className="text-sm"
                        />
                        {errors.taxRate && (
                          <p className="text-[11px] text-destructive">{errors.taxRate}</p>
                        )}
                      </div>

                      <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <Label htmlFor="taxIncludedInPrice" className="text-sm">Prices Include Tax</Label>
                          <p className="text-[11px] text-muted-foreground">
                            Product prices already include tax
                          </p>
                        </div>
                        <Switch
                          id="taxIncludedInPrice"
                          checked={data.taxIncludedInPrice}
                          onCheckedChange={(checked) => setData('taxIncludedInPrice', checked)}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="shipping" className="animate-fade-up">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Shipping Settings</CardTitle>
                  <CardDescription className="text-sm">
                    Configure shipping options for your store
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <Label htmlFor="shippingEnabled" className="text-sm">Enable Shipping</Label>
                      <p className="text-[11px] text-muted-foreground">
                        Offer shipping for physical products
                      </p>
                    </div>
                    <Switch
                      id="shippingEnabled"
                      checked={data.shippingEnabled}
                      onCheckedChange={(checked) => setData('shippingEnabled', checked)}
                    />
                  </div>

                  {data.shippingEnabled && (
                    <div className="space-y-2">
                      <Label htmlFor="freeShippingThreshold" className="text-sm">Free Shipping Threshold</Label>
                      <Input
                        id="freeShippingThreshold"
                        type="number"
                        step="0.01"
                        min="0"
                        value={data.freeShippingThreshold?.toString() || ''}
                        onChange={(e) =>
                          setData('freeShippingThreshold', parseFloat(e.target.value) || null)
                        }
                        placeholder="Leave empty to disable free shipping"
                        className="text-sm"
                      />
                      <p className="text-[11px] text-muted-foreground">
                        Orders above this amount qualify for free shipping
                      </p>
                      {errors.freeShippingThreshold && (
                        <p className="text-[11px] text-destructive">{errors.freeShippingThreshold}</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="inventory" className="animate-fade-up">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">Inventory Settings</CardTitle>
                  <CardDescription className="text-sm">
                    Configure inventory tracking and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="lowStockThreshold" className="text-sm">Low Stock Alert Threshold</Label>
                    <Input
                      id="lowStockThreshold"
                      type="number"
                      min="0"
                      value={data.lowStockThreshold.toString()}
                      onChange={(e) => setData('lowStockThreshold', parseInt(e.target.value) || 0)}
                      className="text-sm"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      Receive notifications when product stock falls below this number
                    </p>
                    {errors.lowStockThreshold && (
                      <p className="text-[11px] text-destructive">{errors.lowStockThreshold}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="seo" className="animate-fade-up">
              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-lg">SEO Settings</CardTitle>
                  <CardDescription className="text-sm">
                    Optimize your store for search engines
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="metaTitle" className="text-sm">Default Meta Title</Label>
                    <Input
                      id="metaTitle"
                      value={data.metaTitle}
                      onChange={(e) => setData('metaTitle', e.target.value)}
                      placeholder="My Store - Best Products Online"
                      className="text-sm"
                    />
                    {errors.metaTitle && (
                      <p className="text-[11px] text-destructive">{errors.metaTitle}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="metaDescription" className="text-sm">Default Meta Description</Label>
                      <span className="text-[11px] text-muted-foreground">
                        {data.metaDescription.length}/160
                      </span>
                    </div>
                    <Textarea
                      id="metaDescription"
                      value={data.metaDescription}
                      onChange={(e) => setData('metaDescription', e.target.value)}
                      placeholder="Describe your store in a few sentences..."
                      rows={3}
                      maxLength={160}
                      className="text-sm"
                    />
                    <p className="text-[11px] text-muted-foreground">
                      A brief description that appears in search engine results
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ai" className="animate-fade-up">
              <AiSettingsTab />
            </TabsContent>

            <TabsContent value="system" className="animate-fade-up">
              <div className="space-y-6">
                {(props.flash?.success || props.flash?.error) && (
                  <div className={`rounded-lg border p-4 text-sm ${props.flash?.success ? 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200' : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'}`}>
                    {props.flash?.success || props.flash?.error}
                  </div>
                )}

                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-lg">Cache Management</CardTitle>
                    <CardDescription className="text-sm">
                      Clear cached data to ensure your store displays the latest information.
                      Cache is automatically invalidated when you update products, orders, or inventory.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">All Cache</p>
                        <p className="text-[11px] text-muted-foreground">
                          Clear all cached data for your store
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleClearCache('all')}
                        disabled={clearingCache !== null}
                      >
                        {clearingCache === 'all' ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Clear All
                      </Button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { scope: 'products', label: 'Product Cache', description: 'Product listings, details, and featured items' },
                        { scope: 'categories', label: 'Category Cache', description: 'Category trees and navigation menus' },
                        { scope: 'orders', label: 'Order Cache', description: 'Order details and customer order history' },
                        { scope: 'analytics', label: 'Analytics Cache', description: 'Dashboard statistics and reports' },
                      ].map((item) => (
                        <div key={item.scope} className="flex items-center justify-between rounded-lg border p-3">
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">{item.label}</p>
                            <p className="text-[11px] text-muted-foreground">{item.description}</p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleClearCache(item.scope)}
                            disabled={clearingCache !== null}
                          >
                            {clearingCache === item.scope ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Clear'
                            )}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="font-display text-lg">System Information</CardTitle>
                    <CardDescription className="text-sm">
                      Technical details about your store configuration
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-lg border p-3">
                        <p className="text-[11px] text-muted-foreground">Framework</p>
                        <p className="text-sm font-medium">AdonisJS v6</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-[11px] text-muted-foreground">Frontend</p>
                        <p className="text-sm font-medium">React + InertiaJS</p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-[11px] text-muted-foreground">Cache Driver</p>
                        <p className="text-sm font-medium">
                          <Badge variant="secondary" className="text-xs">Redis</Badge>
                        </p>
                      </div>
                      <div className="rounded-lg border p-3">
                        <p className="text-[11px] text-muted-foreground">Search Driver</p>
                        <p className="text-sm font-medium">
                          <Badge variant="secondary" className="text-xs">Configurable</Badge>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </form>
      </div>
    </AdminLayout>
  )
}
