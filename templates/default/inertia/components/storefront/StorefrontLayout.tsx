import { ReactNode, useState, useEffect, useCallback } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { Heart, LogOut, Menu, Moon, Package, Search, ShoppingBag, Sun, User, UserCircle, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { useLocaleStore } from '@/stores/locale-store'
import { useTranslation } from '@/hooks/use-translation'

interface StorefrontLayoutProps {
  children: ReactNode
}

interface CartData {
  itemCount: number
  total: number
}

function useStorefrontTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle('dark', theme === 'dark')
    localStorage.setItem('storefront-theme', theme)
  }, [theme, mounted])

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }, [])

  return { theme, toggleTheme, mounted }
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const { props } = usePage()
  const cart = (props as { cart?: CartData }).cart
  const store = (props as { store?: { name: string } }).store
  const customer = (props as { customer?: { id: string } | null }).customer
  const { t } = useTranslation()
  const { locale, currency, setLocale: changeLocale, setCurrency } = useLocaleStore()
  const { theme, toggleTheme, mounted } = useStorefrontTheme()

  const navigation = [
    { name: t('storefront.layout.navShop'), href: '/products' },
    { name: t('storefront.layout.navNewArrivals'), href: '/products?sort=newest' },
    { name: t('storefront.layout.navCollections'), href: '/collections' },
    { name: t('storefront.layout.navBlog'), href: '/blog' },
    { name: t('storefront.layout.navSale'), href: '/products?sale=true' },
  ]

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Announcement Bar */}
      <div className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-2.5 text-center text-xs font-medium tracking-widest uppercase">
          {t('storefront.layout.announcement')}
        </div>
      </div>

      {/* Header */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/80 sticky top-0 z-50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-[72px] items-center justify-between gap-6">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden -ml-2">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t('storefront.layout.openMenu')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-left font-display text-2xl">
                    {store?.name || 'Store'}
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-10 flex flex-col gap-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="hover:bg-secondary rounded-md px-3 py-3 text-base tracking-wide transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Separator className="my-6" />
                  <Link
                    href="/account"
                    className="hover:bg-secondary rounded-md px-3 py-3 text-base tracking-wide transition-colors"
                  >
                    {t('storefront.layout.account')}
                  </Link>
                  <Link
                    href="/account/orders"
                    className="hover:bg-secondary rounded-md px-3 py-3 text-base tracking-wide transition-colors"
                  >
                    {t('storefront.layout.orders')}
                  </Link>
                  <Separator className="my-6" />
                  <button
                    onClick={toggleTheme}
                    className="hover:bg-secondary flex w-full items-center justify-between rounded-md px-3 py-3 text-base tracking-wide transition-colors"
                  >
                    <span className="flex items-center gap-3">
                      {mounted && theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                      {t('storefront.layout.darkMode')}
                    </span>
                    <Switch checked={theme === 'dark'} tabIndex={-1} />
                  </button>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center group">
              <span className="font-display text-2xl tracking-tight transition-opacity group-hover:opacity-70">
                {store?.name || 'Store'}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:gap-10">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground relative text-sm font-medium tracking-wide transition-colors after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-foreground after:transition-all hover:after:w-full"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-0.5">
              {/* Search */}
              {searchOpen ? (
                <div className="absolute inset-x-0 top-0 z-50 flex h-[72px] items-center gap-3 bg-background px-4 sm:px-6 lg:px-8 animate-fade-in">
                  <div className="mx-auto flex w-full max-w-7xl items-center gap-3">
                    <Search className="h-5 w-5 text-muted-foreground shrink-0" />
                    <Input
                      type="search"
                      placeholder={t('storefront.layout.searchProducts')}
                      className="flex-1 border-0 bg-transparent text-base placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
                      autoFocus
                    />
                    <Button variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className="hidden sm:flex"
                >
                  <Search className="h-[18px] w-[18px]" />
                  <span className="sr-only">{t('storefront.layout.search')}</span>
                </Button>
              )}

              {/* Account Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-[18px] w-[18px]" />
                    <span className="sr-only">{t('storefront.layout.account')}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  {customer ? (
                    <>
                      <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
                        {t('storefront.layout.account')}
                      </DropdownMenuLabel>
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link href="/account" className="cursor-pointer">
                            <UserCircle className="mr-2 h-4 w-4" />
                            {t('storefront.layout.profile')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/account/orders" className="cursor-pointer">
                            <Package className="mr-2 h-4 w-4" />
                            {t('storefront.layout.orders')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/wishlist" className="cursor-pointer">
                            <Heart className="mr-2 h-4 w-4" />
                            {t('storefront.layout.wishlist')}
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault()
                          toggleTheme()
                        }}
                        className="cursor-pointer"
                      >
                        {theme === 'dark' ? (
                          <Sun className="mr-2 h-4 w-4" />
                        ) : (
                          <Moon className="mr-2 h-4 w-4" />
                        )}
                        {t('storefront.layout.darkMode')}
                        <Switch
                          checked={theme === 'dark'}
                          className="ml-auto scale-75"
                          tabIndex={-1}
                        />
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild variant="destructive">
                        <Link href="/account/logout" method="post" as="button" className="w-full cursor-pointer">
                          <LogOut className="mr-2 h-4 w-4" />
                          {t('storefront.layout.logout')}
                        </Link>
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link href="/account/login" className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            {t('storefront.layout.login')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/account/register" className="cursor-pointer">
                            <UserCircle className="mr-2 h-4 w-4" />
                            {t('storefront.layout.register')}
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault()
                          toggleTheme()
                        }}
                        className="cursor-pointer"
                      >
                        {theme === 'dark' ? (
                          <Sun className="mr-2 h-4 w-4" />
                        ) : (
                          <Moon className="mr-2 h-4 w-4" />
                        )}
                        {t('storefront.layout.darkMode')}
                        <Switch
                          checked={theme === 'dark'}
                          className="ml-auto scale-75"
                          tabIndex={-1}
                        />
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Wishlist */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/wishlist">
                  <Heart className="h-[18px] w-[18px]" />
                  <span className="sr-only">{t('storefront.layout.wishlist')}</span>
                </Link>
              </Button>

              {/* Cart */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/cart">
                  <ShoppingBag className="h-[18px] w-[18px]" />
                  {cart && cart.itemCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white">
                      {cart.itemCount}
                    </span>
                  )}
                  <span className="sr-only">{t('storefront.layout.cart')}</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
        <Separator />
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="mt-auto border-t bg-secondary/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12">
            {/* Brand */}
            <div className="lg:col-span-4">
              <Link href="/" className="font-display text-2xl tracking-tight">
                {store?.name || 'Store'}
              </Link>
              <p className="text-muted-foreground mt-4 text-sm leading-relaxed max-w-xs">
                {t('storefront.layout.footerDescription')}
              </p>
            </div>

            {/* Shop */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">{t('storefront.layout.footerShop')}</h3>
              <ul className="mt-5 space-y-3.5">
                <li>
                  <Link href="/products" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    {t('storefront.layout.footerAllProducts')}
                  </Link>
                </li>
                <li>
                  <Link href="/products?sort=newest" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    {t('storefront.layout.footerNewArrivals')}
                  </Link>
                </li>
                <li>
                  <Link href="/products?sale=true" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    {t('storefront.layout.footerSale')}
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    {t('storefront.layout.footerCollections')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">{t('storefront.layout.footerAccount')}</h3>
              <ul className="mt-5 space-y-3.5">
                <li>
                  <Link href="/account" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    {t('storefront.layout.footerMyAccount')}
                  </Link>
                </li>
                <li>
                  <Link href="/account/orders" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    {t('storefront.layout.footerOrderHistory')}
                  </Link>
                </li>
                <li>
                  <Link href="/account/addresses" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    {t('storefront.layout.footerAddresses')}
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    {t('storefront.layout.footerWishlist')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">{t('storefront.layout.footerHelp')}</h3>
              <ul className="mt-5 space-y-3.5">
                <li>
                  <Link href="/contact" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    {t('storefront.layout.footerContactUs')}
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    {t('storefront.layout.footerShipping')}
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    {t('storefront.layout.footerReturns')}
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    {t('storefront.layout.footerFaq')}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="sm:col-span-2 lg:col-span-2">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">{t('storefront.layout.footerNewsletter')}</h3>
              <p className="text-foreground/60 mt-5 text-sm leading-relaxed">
                {t('storefront.layout.footerNewsletterText')}
              </p>
              <form className="mt-4 flex gap-2">
                <Input
                  type="email"
                  placeholder={t('storefront.layout.footerEmailPlaceholder')}
                  className="flex-1 text-sm"
                />
                <Button type="submit" size="sm">{t('storefront.layout.footerJoin')}</Button>
              </form>
            </div>
          </div>

          <Separator className="my-10" />

          {/* Payment Methods */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <span className="text-muted-foreground text-[10px] tracking-widest uppercase">{t('storefront.layout.securePayments')}</span>
            <div className="flex items-center gap-3">
              {['Visa', 'Mastercard', 'Amex', 'PayPal', 'Stripe'].map((method) => (
                <div
                  key={method}
                  className="flex h-8 w-12 items-center justify-center rounded border bg-background text-[9px] font-bold tracking-wider text-muted-foreground"
                >
                  {method === 'Mastercard' ? 'MC' : method === 'Amex' ? 'AMEX' : method.toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-muted-foreground text-xs tracking-wide">
              &copy; {new Date().getFullYear()} {store?.name || 'Store'}. {t('storefront.layout.allRightsReserved')}
            </p>
            <div className="flex items-center gap-6">
              <div className="flex gap-8">
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-xs tracking-wide transition-colors">
                  {t('storefront.layout.privacy')}
                </Link>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground text-xs tracking-wide transition-colors">
                  {t('storefront.layout.terms')}
                </Link>
                <Link href="/about" className="text-muted-foreground hover:text-foreground text-xs tracking-wide transition-colors">
                  {t('storefront.layout.about')}
                </Link>
              </div>
              <Separator orientation="vertical" className="h-4 hidden sm:block" />
              <div className="flex items-center gap-3 text-muted-foreground text-xs">
                <select
                  className="bg-transparent text-xs border-0 focus:ring-0 cursor-pointer"
                  value={locale}
                  onChange={(e) => changeLocale(e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="tr">Türkçe</option>
                </select>
                <select
                  className="bg-transparent text-xs border-0 focus:ring-0 cursor-pointer"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD $</option>
                  <option value="EUR">EUR €</option>
                  <option value="TRY">TRY ₺</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
