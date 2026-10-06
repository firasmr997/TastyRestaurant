import { ChevronRight, Menu, Search } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { breadcrumbsFor } from './adminNav'
import { NotificationBell } from './NotificationBell'

/** Top bar: breadcrumbs, a dish search that jumps to the menu table, and notifications. */
export function AdminTopbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const crumbs = breadcrumbsFor(pathname)

  const onSearch = (event: FormEvent) => {
    event.preventDefault()
    const q = query.trim()
    navigate(q ? `/admin/menu?q=${encodeURIComponent(q)}` : '/admin/menu')
    setQuery('')
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-surface/95 px-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenSidebar}
        aria-label="Open navigation"
        className="inline-flex size-10 items-center justify-center rounded-control hover:bg-ink/8 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <nav aria-label="Breadcrumb" className="hidden min-w-0 md:block">
        <ol className="flex items-center gap-1.5 text-sm">
          {crumbs.map((crumb, i) => (
            <li key={crumb.label} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3.5 text-ink-faint" aria-hidden />}
              {crumb.to ? (
                <Link to={crumb.to} className="text-ink-muted hover:text-ink">
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-semibold text-ink">
                  {crumb.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <form role="search" onSubmit={onSearch} className="ml-auto w-full max-w-xs">
        <label htmlFor="admin-search" className="sr-only">
          Search dishes
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <input
            id="admin-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dishes…"
            className="h-10 w-full rounded-control border border-line bg-surface-2 pl-9 pr-3 text-sm placeholder:text-ink-faint focus:border-focus focus:bg-surface focus:outline-none focus:ring-4 focus:ring-focus/20"
          />
        </div>
      </form>
      <NotificationBell />
    </header>
  )
}
