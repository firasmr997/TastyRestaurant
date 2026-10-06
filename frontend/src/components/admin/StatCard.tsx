import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router'
import { cn } from '@/utils/cn'

interface StatCardProps {
  label: string
  value: number | undefined
  detail?: string
  icon: LucideIcon
  to: string
  tone?: 'pickle' | 'tomato' | 'mustard' | 'ink'
  loading?: boolean
}

const iconTones = {
  pickle: 'bg-pickle text-label',
  tomato: 'bg-tomato text-white',
  mustard: 'bg-mustard text-ink',
  ink: 'bg-ink text-label',
}

/** Stat tile: label, value in the UI sans (proportional figures), one line of context, links to its section. */
export function StatCard({ label, value, detail, icon: Icon, to, tone = 'pickle', loading }: StatCardProps) {
  return (
    <Link
      to={to}
      className="group flex items-start justify-between gap-4 rounded-panel border border-line bg-surface p-5 transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-pickle hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      <div className="min-w-0">
        <p className="text-sm font-semibold text-ink-muted">{label}</p>
        {loading || value === undefined ? (
          <span className="skeleton mt-3 block h-9 w-16 rounded" />
        ) : (
          <p className="mt-2 text-[2.25rem] font-semibold leading-none text-ink">{value.toLocaleString('en-US')}</p>
        )}
        {detail && <p className="mt-2 text-xs text-ink-muted">{detail}</p>}
      </div>
      <span aria-hidden className={cn('inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-transform group-hover:rotate-[-8deg]', iconTones[tone])}>
        <Icon className="size-5" />
      </span>
    </Link>
  )
}
