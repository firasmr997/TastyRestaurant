import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/utils/cn'

interface PaginationProps {
  page: number
  totalPages: number
  totalElements: number
  size: number
  onPageChange: (page: number) => void
  onSizeChange?: (size: number) => void
  sizeOptions?: number[]
  className?: string
  labels?: { previous: string; next: string; perPage: string; showing: (from: number, to: number, total: number) => string }
}

const defaultLabels = {
  previous: 'Previous page',
  next: 'Next page',
  perPage: 'Rows per page',
  showing: (from: number, to: number, total: number) => `${from}–${to} of ${total}`,
}

/** Page numbers with ellipses: 1 … 4 5 6 … 12 */
export function pageWindow(page: number, totalPages: number): (number | 'gap')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i)
  const pages = new Set([0, totalPages - 1, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 0 && p < totalPages).sort((a, b) => a - b)
  const result: (number | 'gap')[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('gap')
    result.push(p)
  })
  return result
}

export function Pagination({
  page,
  totalPages,
  totalElements,
  size,
  onPageChange,
  onSizeChange,
  sizeOptions = [10, 20, 50],
  className,
  labels = defaultLabels,
}: PaginationProps) {
  if (totalElements === 0) return null
  const from = page * size + 1
  const to = Math.min(totalElements, (page + 1) * size)
  const button =
    'inline-flex h-9 min-w-9 items-center justify-center rounded-control px-2 text-sm font-semibold tabular-nums transition-colors ' +
    'hover:bg-ink/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:pointer-events-none disabled:opacity-35'

  return (
    <nav aria-label="Pagination" className={cn('flex flex-wrap items-center justify-between gap-3 text-sm', className)}>
      <div className="flex items-center gap-3 text-ink-muted">
        <span className="tabular-nums">{labels.showing(from, to, totalElements)}</span>
        {onSizeChange && (
          <label className="flex items-center gap-2">
            <span className="hidden sm:inline">{labels.perPage}</span>
            <select
              value={size}
              onChange={(e) => onSizeChange(Number(e.target.value))}
              className="h-9 rounded-control border border-line bg-surface px-2 text-ink focus:outline-none focus:ring-2 focus:ring-focus"
            >
              {sizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button type="button" className={button} onClick={() => onPageChange(page - 1)} disabled={page === 0} aria-label={labels.previous}>
            <ChevronLeft className="size-4" />
          </button>
          {pageWindow(page, totalPages).map((p, i) =>
            p === 'gap' ? (
              <span key={`gap-${i}`} className="px-1 text-ink-faint" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                className={cn(button, p === page && 'bg-ink text-bg hover:bg-ink')}
                aria-current={p === page ? 'page' : undefined}
                onClick={() => onPageChange(p)}
              >
                {p + 1}
              </button>
            ),
          )}
          <button
            type="button"
            className={button}
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            aria-label={labels.next}
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </nav>
  )
}
