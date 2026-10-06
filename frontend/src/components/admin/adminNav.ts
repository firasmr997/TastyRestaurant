import { Images, LayoutDashboard, MessageSquare, Settings, Store, Tags, UtensilsCrossed, type LucideIcon } from 'lucide-react'

export interface AdminNavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
}

export const ADMIN_NAV: AdminNavItem[] = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/admin/categories', label: 'Categories', icon: Tags },
  { to: '/admin/food-images', label: 'Food Images', icon: Images },
  { to: '/admin/restaurant-gallery', label: 'Restaurant Gallery', icon: Store },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

/** Breadcrumb trail for an admin path, e.g. /admin/menu/12 → Dashboard / Menu / Edit dish. */
export function breadcrumbsFor(pathname: string): { label: string; to?: string }[] {
  const crumbs: { label: string; to?: string }[] = [{ label: 'Dashboard', to: '/admin' }]
  if (pathname === '/admin' || pathname === '/admin/') return [{ label: 'Dashboard' }]
  const section = ADMIN_NAV.find((item) => item.to !== '/admin' && pathname.startsWith(item.to))
  if (section) crumbs.push({ label: section.label, to: section.to })
  if (/^\/admin\/menu\/new/.test(pathname)) crumbs.push({ label: 'New dish' })
  else if (/^\/admin\/menu\/\d+/.test(pathname)) crumbs.push({ label: 'Edit dish' })
  const last = crumbs[crumbs.length - 1]
  if (last && last.to === pathname) delete last.to
  return crumbs
}
