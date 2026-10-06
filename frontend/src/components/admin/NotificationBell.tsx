import { AnimatePresence, motion } from 'framer-motion'
import { Bell, Inbox } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'
import { cn } from '@/utils/cn'
import { formatRelative } from '@/utils/format'

/** Bell with the unread-message count and a dropdown of the newest messages. */
export function NotificationBell() {
  const { data } = useUnreadMessages()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const unread = data?.unread ?? 0

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => !root.current?.contains(event.target as Node) && setOpen(false)
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={unread ? `Notifications: ${unread} unread messages` : 'Notifications'}
        className="relative inline-flex size-10 items-center justify-center rounded-control text-ink transition-colors hover:bg-ink/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="tnum absolute right-1 top-1 inline-flex min-w-[1.15rem] items-center justify-center rounded-full border-2 border-surface bg-tomato px-1 text-[0.65rem] font-bold leading-4 text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 top-12 z-50 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-panel border border-line bg-surface shadow-overlay"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="font-semibold">New messages</p>
              <span className="text-sm text-ink-muted">{unread} unread</span>
            </div>
            {data?.latest.length ? (
              <ul className="max-h-80 divide-y divide-line overflow-y-auto">
                {data.latest.map((message) => (
                  <li key={message.id}>
                    <Link
                      to={`/admin/messages?open=${message.id}`}
                      onClick={() => setOpen(false)}
                      className="block px-4 py-3 transition-colors hover:bg-surface-2"
                    >
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate font-semibold">{message.name}</span>
                        <span className="shrink-0 text-xs text-ink-muted">{formatRelative(message.createdAt)}</span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 text-sm text-ink-muted">{message.message}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-ink-muted">
                <Inbox className="size-6" aria-hidden />
                You're all caught up.
              </div>
            )}
            <Link
              to="/admin/messages"
              onClick={() => setOpen(false)}
              className={cn('block border-t border-line px-4 py-3 text-center text-sm font-semibold text-tomato-deep hover:bg-surface-2')}
            >
              Open the inbox
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
