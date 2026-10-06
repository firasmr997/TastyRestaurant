import { AnimatePresence, motion } from 'framer-motion'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

type ToastTone = 'success' | 'error' | 'info'

interface ToastItem {
  id: number
  tone: ToastTone
  title: string
  description?: string
}

interface ToastApi {
  success: (title: string, description?: string) => void
  error: (title: string, description?: string) => void
  info: (title: string, description?: string) => void
  dismiss: (id: number) => void
}

const ToastContext = createContext<ToastApi | null>(null)

const icons = { success: CircleCheck, error: CircleAlert, info: Info }
const accents = {
  success: 'text-success',
  error: 'text-danger',
  info: 'text-info',
}

/** Stacked notifications announced politely to screen readers (errors assertively). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), [])

  const push = useCallback(
    (tone: ToastTone, title: string, description?: string) => {
      const id = nextId.current++
      setToasts((list) => [...list.slice(-3), { id, tone, title, description }])
      window.setTimeout(() => dismiss(id), tone === 'error' ? 7000 : 4500)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, description) => push('success', title, description),
      error: (title, description) => push('error', title, description),
      info: (title, description) => push('info', title, description),
      dismiss,
    }),
    [push, dismiss],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 p-4 sm:bottom-4 sm:right-4 sm:left-auto sm:items-end">
        <div className="sr-only" aria-live="polite">
          {toasts.filter((t) => t.tone !== 'error').map((t) => `${t.title}. ${t.description ?? ''}`).join(' ')}
        </div>
        <div className="sr-only" aria-live="assertive">
          {toasts.filter((t) => t.tone === 'error').map((t) => `${t.title}. ${t.description ?? ''}`).join(' ')}
        </div>
        <AnimatePresence initial={false}>
          {toasts.map((toast) => {
            const Icon = icons[toast.tone]
            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, transition: { duration: 0.18 } }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-card bg-ink p-4 pr-3 text-bg shadow-overlay"
              >
                <Icon className={cn('mt-0.5 size-5 shrink-0', accents[toast.tone])} aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{toast.title}</p>
                  {toast.description && <p className="mt-0.5 text-sm text-bg/75">{toast.description}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(toast.id)}
                  aria-label="Dismiss notification"
                  className="-mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-control text-bg/70 transition-colors hover:bg-bg/10 hover:text-bg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <X className="size-4" />
                </button>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside <ToastProvider>')
  return context
}
