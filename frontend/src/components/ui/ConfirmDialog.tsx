import { TriangleAlert } from 'lucide-react'
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'

export interface ConfirmOptions {
  title: string
  description?: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'default'
  /** Extra content (e.g. a "move dishes to" select). */
  body?: ReactNode
}

interface ConfirmDialogProps extends ConfirmOptions {
  open: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Reusable confirmation for destructive actions. */
export function ConfirmDialog({
  open,
  loading,
  onConfirm,
  onCancel,
  title,
  description,
  body,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  tone = 'danger',
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      dismissible={!loading}
      size="sm"
      title={
        <span className="flex items-center gap-3">
          {tone === 'danger' && (
            <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-danger/12 text-danger">
              <TriangleAlert className="size-5" aria-hidden />
            </span>
          )}
          {title}
        </span>
      }
      description={description}
      footer={
        <>
          <Button variant="ghost" onClick={onCancel} disabled={loading} data-autofocus>
            {cancelLabel}
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={onConfirm} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {body}
    </Modal>
  )
}

type ConfirmFn = (options: ConfirmOptions & { action: () => Promise<unknown> | unknown }) => Promise<boolean>

const ConfirmContext = createContext<ConfirmFn | null>(null)

/**
 * `const confirm = useConfirm(); await confirm({ title, action: () => service.remove(id) })`
 * opens the dialog, runs the action with a loading state when confirmed, and resolves true on success.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<(ConfirmOptions & { action: () => Promise<unknown> | unknown }) | null>(null)
  const [loading, setLoading] = useState(false)
  const resolver = useRef<((value: boolean) => void) | null>(null)

  const confirm = useCallback<ConfirmFn>((options) => {
    setState(options)
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve
    })
  }, [])

  const close = (result: boolean) => {
    resolver.current?.(result)
    resolver.current = null
    setState(null)
    setLoading(false)
  }

  const handleConfirm = async () => {
    if (!state) return
    setLoading(true)
    try {
      await state.action()
      close(true)
    } catch {
      // The action reports its own error (toast); the dialog simply closes.
      close(false)
    }
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={!!state}
        loading={loading}
        title={state?.title ?? ''}
        description={state?.description}
        body={state?.body}
        confirmLabel={state?.confirmLabel}
        cancelLabel={state?.cancelLabel}
        tone={state?.tone}
        onConfirm={handleConfirm}
        onCancel={() => close(false)}
      />
    </ConfirmContext.Provider>
  )
}

export function useConfirm(): ConfirmFn {
  const context = useContext(ConfirmContext)
  if (!context) throw new Error('useConfirm must be used inside <ConfirmProvider>')
  return context
}
