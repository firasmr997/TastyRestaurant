import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/utils/cn'

/** Page title row with optional description and actions. */
export function PageHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between lg:mb-8">
      <div className="min-w-0">
        <h1 className="font-display text-[2.25rem] font-extrabold uppercase leading-none text-pickle sm:text-[2.75rem]">{title}</h1>
        {description && <p className="mt-2 max-w-2xl text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

/** White content panel. */
export function Panel({ className, children, ...rest }: ComponentProps<'section'>) {
  return (
    <section className={cn('rounded-panel border border-line bg-surface shadow-[0_1px_2px_rgb(12_20_16/0.04)]', className)} {...rest}>
      {children}
    </section>
  )
}

export function PanelHeader({ title, description, actions }: { title: string; description?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
      <div>
        <h2 className="font-sans text-base font-bold normal-case tracking-normal text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
      </div>
      {actions}
    </div>
  )
}

/** Data table primitives: horizontally scrollable on small screens, numbers on tabular figures. */
export function Table({ children, className, caption }: { children: ReactNode; className?: string; caption: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full min-w-[44rem] border-collapse text-left text-sm', className)}>
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  )
}

export function Th({ children, className, ...rest }: ComponentProps<'th'>) {
  return (
    <th
      scope="col"
      className={cn('whitespace-nowrap border-b border-line bg-surface-2/60 px-4 py-3 text-xs font-bold uppercase tracking-[0.08em] text-ink-muted first:pl-5 last:pr-5', className)}
      {...rest}
    >
      {children}
    </th>
  )
}

export function Td({ children, className, ...rest }: ComponentProps<'td'>) {
  return (
    <td className={cn('border-b border-line px-4 py-3 align-middle first:pl-5 last:pr-5', className)} {...rest}>
      {children}
    </td>
  )
}

/** Skeleton rows while a table loads. */
export function TableSkeleton({ rows = 6, columns }: { rows?: number; columns: number }) {
  return (
    <>
      {Array.from({ length: rows }, (_, r) => (
        <tr key={r} aria-hidden>
          {Array.from({ length: columns }, (_, c) => (
            <td key={c} className="border-b border-line px-4 py-4 first:pl-5">
              <span className="skeleton block h-4 rounded" style={{ width: c === 0 ? '3rem' : `${60 + ((r * 7 + c * 13) % 35)}%` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  )
}
