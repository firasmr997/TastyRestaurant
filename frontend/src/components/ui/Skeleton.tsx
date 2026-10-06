import { cn } from '@/utils/cn'

/** Shimmering placeholder block. Size it with classes (h-*, w-*, aspect-*). */
export function Skeleton({ className }: { className?: string }) {
  return <span aria-hidden className={cn('skeleton block rounded-card', className)} />
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <span aria-hidden className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }, (_, i) => (
        <span key={i} className="skeleton block h-3 rounded-full" style={{ width: i === lines - 1 ? '60%' : '100%' }} />
      ))}
    </span>
  )
}
