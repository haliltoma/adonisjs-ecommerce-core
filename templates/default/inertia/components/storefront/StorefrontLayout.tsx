import { ReactNode, useState } from 'react'
import { Link, usePage } from '@inertiajs/react'
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'

interface StorefrontLayoutProps {
  children: ReactNode
}

interface CartData {
  itemCount: number
  total: number
}

export default function StorefrontLayout({ children }: StorefrontLayoutProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const { props } = usePage()
  const cart = (props as { cart?: CartData }).cart
  const store = (props as { store?: { name: string } }).store

  const navigation = [
    { name: 'Shop', href: '/products' },
    { name: 'New Arrivals', href: '/products?sort=newest' },
    { name: 'Collections', href: '/collections' },
    { name: 'Sale', href: '/products?sale=true' },
  ]

  return (
    <div className="bg-background min-h-screen flex flex-col">
      {/* Announcement Bar */}
      <div className="bg-foreground text-background">
        <div className="mx-auto max-w-7xl px-4 py-2.5 text-center text-xs font-medium tracking-widest uppercase">
          Complimentary shipping on orders over $100
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
                  <span className="sr-only">Open menu</span>
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
                    Account
                  </Link>
                  <Link
                    href="/account/orders"
                    className="hover:bg-secondary rounded-md px-3 py-3 text-base tracking-wide transition-colors"
                  >
                    Orders
                  </Link>
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
                      placeholder="Search products..."
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
                  <span className="sr-only">Search</span>
                </Button>
              )}

              {/* Account */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/account">
                  <User className="h-[18px] w-[18px]" />
                  <span className="sr-only">Account</span>
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
                  <span className="sr-only">Cart</span>
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
                Carefully curated products for the discerning eye. Quality craftsmanship meets modern design.
              </p>
            </div>

            {/* Shop */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Shop</h3>
              <ul className="mt-5 space-y-3.5">
                <li>
                  <Link href="/products" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/products?sort=newest" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/products?sale=true" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    Sale
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    Collections
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Account</h3>
              <ul className="mt-5 space-y-3.5">
                <li>
                  <Link href="/account" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    My Account
                  </Link>
                </li>
                <li>
                  <Link href="/account/orders" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    Order History
                  </Link>
                </li>
                <li>
                  <Link href="/account/addresses" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    Addresses
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    Wishlist
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help */}
            <div className="lg:col-span-2">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Help</h3>
              <ul className="mt-5 space-y-3.5">
                <li>
                  <Link href="/contact" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    Shipping
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    Returns
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-foreground/80 hover:text-foreground text-sm transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div className="sm:col-span-2 lg:col-span-2">
              <h3 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">Newsletter</h3>
              <p className="text-foreground/60 mt-5 text-sm leading-relaxed">
                Be the first to know about new arrivals and exclusive offers.
              </p>
              <form className="mt-4 flex gap-2">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="flex-1 text-sm"
                />
                <Button type="submit" size="sm">Join</Button>
              </form>
            </div>
          </div>

          <Separator className="my-10" />

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-muted-foreground text-xs tracking-wide">
              &copy; {new Date().getFullYear()} {store?.name || 'Store'}. All rights reserved.
            </p>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-xs tracking-wide transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground text-xs tracking-wide transition-colors">
                Terms
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-foreground text-xs tracking-wide transition-colors">
                About
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
