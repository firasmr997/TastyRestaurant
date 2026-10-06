import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type BadgeTone = 'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

const tones: Record<BadgeTone, string> = {
  neutral: 'bg-ink/8 text-ink',
  primary: 'bg-primary/12 text-primary-strong',
  accent: 'bg-accent/25 text-ink',
  success: 'bg-success/14 text-success-strong',
  warning: 'bg-warning/20 text-warning-strong',
  danger: 'bg-danger/12 text-danger',
  info: 'bg-info/14 text-info',
}

export function Badge({
  tone = 'neutral',
  icon,
  children,
  className,
}: {
  tone?: BadgeTone
  icon?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  )
}
