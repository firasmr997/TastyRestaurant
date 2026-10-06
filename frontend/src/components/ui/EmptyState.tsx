import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description?: ReactNode
  action?: ReactNode
  className?: string
  tone?: 'default' | 'inverse'
}

export function EmptyState({ icon, title, description, action, className, tone = 'default' }: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        'flex flex-col items-center justify-center gap-3 px-6 py-14 text-center',
        tone === 'inverse' ? 'text-bg' : 'text-ink',
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mb-1 inline-flex size-16 items-center justify-center rounded-full [&_svg]:size-7',
          tone === 'inverse' ? 'bg-bg/10' : 'bg-ink/6 text-ink-muted',
        )}
      >
        {icon}
      </span>
      <p className="text-lg font-bold">{title}</p>
      {description && (
        <p className={cn('max-w-sm text-sm', tone === 'inverse' ? 'text-bg/75' : 'text-ink-muted')}>{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
