import { useId } from 'react'
import { cn } from '@/utils/cn'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  /** Hide the visible label (keeps it for assistive tech), e.g. inside table cells. */
  hideLabel?: boolean
  description?: string
  disabled?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export function Switch({ checked, onChange, label, hideLabel, description, disabled, size = 'md', className }: SwitchProps) {
  const id = useId()
  const track = size === 'sm' ? 'h-5 w-9' : 'h-6 w-11'
  const thumb = size === 'sm' ? 'size-4 data-[on=true]:translate-x-4' : 'size-5 data-[on=true]:translate-x-5'
  return (
    <div className={cn('flex items-start gap-3', className)}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={hideLabel ? label : undefined}
        aria-labelledby={hideLabel ? undefined : `${id}-label`}
        disabled={disabled}
        data-on={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative inline-flex shrink-0 cursor-pointer items-center rounded-full p-0.5 transition-colors duration-200',
          'bg-line data-[on=true]:bg-success focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus',
          'focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:cursor-not-allowed disabled:opacity-50',
          track,
        )}
      >
        <span
          data-on={checked}
          className={cn('block rounded-full bg-white shadow-[0_1px_3px_rgb(0_0_0/0.25)] transition-transform duration-200 ease-out', thumb)}
        />
      </button>
      {!hideLabel && (
        <span className="flex flex-col">
          <label id={`${id}-label`} htmlFor={id} className="cursor-pointer text-sm font-semibold text-ink">
            {label}
          </label>
          {description && <span className="text-xs text-ink-muted">{description}</span>}
        </span>
      )}
    </div>
  )
}
