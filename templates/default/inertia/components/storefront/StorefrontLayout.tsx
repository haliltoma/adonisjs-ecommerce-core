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
    <div className="bg-background min-h-screen">
      {/* Announcement Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-2 text-center text-sm">
          Free shipping on orders over $100
        </div>
      </div>

      {/* Header */}
      <header className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 border-b backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-left">{store?.name || 'Store'}</SheetTitle>
                </SheetHeader>
                <nav className="mt-8 flex flex-col gap-1">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="hover:bg-accent rounded-md px-3 py-2 text-lg font-medium transition-colors"
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Separator className="my-4" />
                  <Link
                    href="/account"
                    className="hover:bg-accent rounded-md px-3 py-2 text-lg font-medium transition-colors"
                  >
                    Account
                  </Link>
                  <Link
                    href="/account/orders"
                    className="hover:bg-accent rounded-md px-3 py-2 text-lg font-medium transition-colors"
                  >
                    Orders
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span className="text-xl font-semibold tracking-tight">
                {store?.name || 'Store'}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex lg:gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Right Section */}
            <div className="flex items-center gap-1">
              {/* Search */}
              {searchOpen ? (
                <div className="absolute inset-x-0 top-0 z-50 flex h-16 items-center gap-2 bg-background px-4">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    className="flex-1"
                    autoFocus
                  />
                  <Button variant="ghost" size="icon" onClick={() => setSearchOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSearchOpen(true)}
                  className="hidden sm:flex"
                >
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
                </Button>
              )}

              {/* Account */}
              <Button variant="ghost" size="icon" asChild>
                <Link href="/account">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Link>
              </Button>

              {/* Cart */}
              <Button variant="ghost" size="icon" className="relative" asChild>
                <Link href="/cart">
                  <ShoppingBag className="h-5 w-5" />
                  {cart && cart.itemCount > 0 && (
                    <Badge
                      variant="default"
                      className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                    >
                      {cart.itemCount}
                    </Badge>
                  )}
                  <span className="sr-only">Cart</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-muted/40 mt-auto border-t">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Shop */}
            <div>
              <h3 className="text-sm font-semibold">Shop</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link href="/products" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    All Products
                  </Link>
                </li>
                <li>
                  <Link href="/products?sort=newest" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    New Arrivals
                  </Link>
                </li>
                <li>
                  <Link href="/products?sale=true" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Sale
                  </Link>
                </li>
                <li>
                  <Link href="/collections" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Collections
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-sm font-semibold">Account</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link href="/account" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    My Account
                  </Link>
                </li>
                <li>
                  <Link href="/account/orders" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Order History
                  </Link>
                </li>
                <li>
                  <Link href="/account/addresses" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Addresses
                  </Link>
                </li>
                <li>
                  <Link href="/wishlist" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Wishlist
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold">Support</h3>
              <ul className="mt-4 space-y-3">
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Shipping Info
                  </Link>
                </li>
                <li>
                  <Link href="/returns" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    Returns & Exchanges
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-sm font-semibold">Stay Updated</h3>
              <p className="text-muted-foreground mt-4 text-sm">
                Subscribe for exclusive offers and updates.
              </p>
              <form className="mt-4 flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter email"
                  className="flex-1"
                />
                <Button type="submit">Subscribe</Button>
              </form>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-muted-foreground text-sm">
              &copy; {new Date().getFullYear()} {store?.name || 'Store'}. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
