import { Eye, EyeOff } from 'lucide-react'
import { cloneElement, isValidElement, useId, useState, type ComponentProps, type ReactElement, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

const control =
  'block w-full rounded-control border border-line bg-surface px-3.5 text-ink placeholder:text-ink-faint ' +
  'transition-[border-color,box-shadow,background-color] duration-200 ' +
  'hover:border-ink/40 focus:border-focus focus:outline-none focus:ring-4 focus:ring-focus/20 ' +
  'disabled:cursor-not-allowed disabled:opacity-60 aria-[invalid=true]:border-danger aria-[invalid=true]:focus:ring-danger/20'

interface FieldProps {
  label: ReactNode
  /** Short help shown under the control. */
  hint?: ReactNode
  error?: string
  required?: boolean
  className?: string
  /** A single Input, Textarea, Select or custom control; ids and aria attributes are wired automatically. */
  children: ReactElement<{ id?: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean; required?: boolean }>
  /** Visually hide the label (it stays available to screen readers). */
  hideLabel?: boolean
}

export function Field({ label, hint, error, required, className, children, hideLabel }: FieldProps) {
  const generatedId = useId()
  const id = (isValidElement(children) && children.props.id) || generatedId
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = error ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined
  const child = isValidElement(children)
    ? cloneElement(children, { id, 'aria-describedby': describedBy, 'aria-invalid': !!error, required })
    : children

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={cn('text-sm font-semibold text-ink', hideLabel && 'sr-only')}>
        {label}
        {required && (
          <span aria-hidden className="ml-0.5 text-primary">
            *
          </span>
        )}
      </label>
      {child}
      {hint && !error && (
        <p id={hintId} className="text-xs text-ink-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  )
}

export function Input({ className, ...props }: ComponentProps<'input'>) {
  return <input className={cn(control, 'h-11', className)} {...props} />
}

export function Textarea({ className, rows = 4, ...props }: ComponentProps<'textarea'>) {
  return <textarea rows={rows} className={cn(control, 'resize-y py-2.5 leading-relaxed', className)} {...props} />
}

export function Select({ className, children, ...props }: ComponentProps<'select'>) {
  return (
    <select
      className={cn(
        control,
        'h-11 appearance-none bg-[length:1rem] bg-[right_0.85rem_center] bg-no-repeat pr-10',
        "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23786b62' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

/** Password input with a show/hide toggle; Field wires the label to the input itself. */
export function PasswordInput({ className, ...props }: Omit<ComponentProps<'input'>, 'type'>) {
  const [visible, setVisible] = useState(false)
  return (
    <div className="relative">
      <Input type={visible ? 'text' : 'password'} className={cn('pr-12', className)} {...props} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
        className="absolute right-1.5 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-control text-ink-muted hover:bg-ink/8 hover:text-ink"
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  )
}
