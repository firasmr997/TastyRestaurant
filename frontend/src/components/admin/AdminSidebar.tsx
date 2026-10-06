import { ExternalLink, LogOut } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import { LogoMark, Wordmark } from '@/components/brand/Logo'
import { useAuth } from '@/context/AuthContext'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'
import { cn } from '@/utils/cn'
import { ADMIN_NAV } from './adminNav'

/** Pickle-green CMS sidebar. The current section floods tomato, like the public navigation cells. */
export function AdminSidebar({ onNavigate, onLogout }: { onNavigate?: () => void; onLogout: () => void }) {
  const { user } = useAuth()
  const unread = useUnreadMessages().data?.unread ?? 0

  return (
    <div data-tone="dark" className="flex h-full flex-col bg-pickle-deep text-label">
      <Link to="/admin" onClick={onNavigate} className="flex h-16 shrink-0 items-center gap-2.5 px-5" aria-label="Tasty admin dashboard">
        <LogoMark className="size-9" fill="var(--color-mustard)" letter="var(--color-ink)" solid />
        <Wordmark variant="solid" className="h-5 w-auto" />
        <span className="ml-1 rounded-full bg-label/12 px-2 py-0.5 font-stencil text-xs font-bold uppercase tracking-[0.12em] text-mustard">CMS</span>
      </Link>

      <nav aria-label="Admin" className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="flex flex-col gap-1">
          {ADMIN_NAV.map(({ to, label, icon: Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'group flex h-11 items-center gap-3 rounded-control px-3 text-[0.95rem] font-semibold transition-colors',
                    isActive ? 'bg-tomato text-white' : 'text-label/80 hover:bg-label/8 hover:text-label',
                  )
                }
              >
                <Icon className="size-[1.15rem] shrink-0" aria-hidden />
                <span className="flex-1">{label}</span>
                {label === 'Messages' && unread > 0 && (
                  <span className="tnum inline-flex min-w-6 items-center justify-center rounded-full bg-mustard px-1.5 text-xs font-bold text-ink">
                    {unread}
                    <span className="sr-only"> unread</span>
                  </span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-label/12 p-3">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 items-center gap-3 rounded-control px-3 text-sm font-semibold text-label/75 transition-colors hover:bg-label/8 hover:text-label"
        >
          <ExternalLink className="size-4" aria-hidden />
          View website
        </a>
        <button
          type="button"
          onClick={onLogout}
          className="flex h-10 w-full items-center gap-3 rounded-control px-3 text-sm font-semibold text-label/75 transition-colors hover:bg-label/8 hover:text-label"
        >
          <LogOut className="size-4" aria-hidden />
          Logout
        </button>
        {user && (
          <div className="mt-2 flex items-center gap-3 rounded-control bg-label/6 px-3 py-2.5">
            <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-mustard font-display text-sm font-extrabold text-ink">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{user.name}</span>
              <span className="block truncate text-xs text-pickle-soft">{user.role === 'ADMIN' ? 'Administrator' : 'Editor'}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
