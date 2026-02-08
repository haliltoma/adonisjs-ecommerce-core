import { Link, usePage } from '@inertiajs/react'
import {
  AudioWaveform,
  BookOpen,
  Bot,
  ChevronRight,
  ChevronsUpDown,
  Command,
  CreditCard,
  Folder,
  Forward,
  Frame,
  GalleryVerticalEnd,
  LayoutDashboard,
  LogOut,
  Map,
  MoreHorizontal,
  Package,
  Percent,
  PieChart,
  Settings2,
  ShoppingCart,
  Sparkles,
  SquareTerminal,
  Tag,
  Trash2,
  Users,
  Warehouse,
} from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar'

const mainNav = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
    isActive: true,
  },
  {
    title: 'Orders',
    url: '/admin/orders',
    icon: ShoppingCart,
    badge: '12',
  },
  {
    title: 'Products',
    url: '/admin/products',
    icon: Package,
    items: [
      { title: 'All Products', url: '/admin/products' },
      { title: 'Categories', url: '/admin/categories' },
      { title: 'Collections', url: '/admin/collections' },
      { title: 'Inventory', url: '/admin/inventory' },
    ],
  },
  {
    title: 'Customers',
    url: '/admin/customers',
    icon: Users,
  },
  {
    title: 'Discounts',
    url: '/admin/discounts',
    icon: Percent,
  },
  {
    title: 'Analytics',
    url: '/admin/analytics',
    icon: PieChart,
    items: [
      { title: 'Overview', url: '/admin/analytics' },
      { title: 'Sales', url: '/admin/analytics/sales' },
      { title: 'Products', url: '/admin/analytics/products' },
      { title: 'Customers', url: '/admin/analytics/customers' },
    ],
  },
]

const contentNav = [
  {
    title: 'Pages',
    url: '/admin/content/pages',
    icon: BookOpen,
  },
  {
    title: 'Menus',
    url: '/admin/content/menus',
    icon: Folder,
  },
  {
    title: 'Banners',
    url: '/admin/content/banners',
    icon: Frame,
  },
]

const settingsNav = [
  {
    title: 'General',
    url: '/admin/settings',
    icon: Settings2,
  },
  {
    title: 'Payments',
    url: '/admin/settings/payments',
    icon: CreditCard,
  },
  {
    title: 'Shipping',
    url: '/admin/settings/shipping',
    icon: Warehouse,
  },
  {
    title: 'Taxes',
    url: '/admin/settings/taxes',
    icon: Tag,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { url, props: pageProps } = usePage()
  const user = (pageProps as any).user

  const isActive = (href: string) => {
    if (href === '/admin') return url === '/admin'
    return url.startsWith(href)
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              asChild
            >
              <Link href="/admin">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <Command className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">AdonisCommerce</span>
                  <span className="truncate text-xs">Admin Panel</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Store</SidebarGroupLabel>
          <SidebarMenu>
            {mainNav.map((item) =>
              item.items ? (
                <Collapsible
                  key={item.title}
                  asChild
                  defaultOpen={isActive(item.url)}
                  className="group/collapsible"
                >
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title}>
                        <item.icon />
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <SidebarMenuSub>
                        {item.items.map((subItem) => (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              isActive={url === subItem.url}
                            >
                              <Link href={subItem.url}>
                                <span>{subItem.title}</span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        ))}
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>
              ) : (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive(item.url)}
                    asChild
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {item.badge && (
                    <SidebarMenuAction className="bg-primary text-primary-foreground pointer-events-none rounded-full px-1.5 text-xs font-medium">
                      {item.badge}
                    </SidebarMenuAction>
                  )}
                </SidebarMenuItem>
              )
            )}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>
          <SidebarMenu>
            {contentNav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive(item.url)}
                  asChild
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenu>
            {settingsNav.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  tooltip={item.title}
                  isActive={isActive(item.url)}
                  asChild
                >
                  <Link href={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.avatarUrl}
                      alt={user?.displayName}
                    />
                    <AvatarFallback className="rounded-lg">
                      {user?.displayName?.charAt(0) || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.displayName || 'Admin'}
                    </span>
                    <span className="truncate text-xs">{user?.email}</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={user?.avatarUrl}
                        alt={user?.displayName}
                      />
                      <AvatarFallback className="rounded-lg">
                        {user?.displayName?.charAt(0) || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        {user?.displayName || 'Admin'}
                      </span>
                      <span className="truncate text-xs">{user?.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/profile">
                      <Sparkles />
                      Account
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/settings">
                      <Settings2 />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/admin/logout" method="post" as="button" className="w-full">
                    <LogOut />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
