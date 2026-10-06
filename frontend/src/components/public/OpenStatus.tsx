import { useOpenStatus } from '@/hooks/useOpenStatus'
import { cn } from '@/utils/cn'

/** "Open now · until 22:30" with a live dot. */
export function OpenStatus({ className, compact }: { className?: string; compact?: boolean }) {
  const status = useOpenStatus()
  if (!status) return <span className={cn('inline-block h-4 w-28 rounded-full skeleton', className)} aria-hidden />
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span aria-hidden className="relative flex size-2.5">
        {status.open && <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#7fd39a] opacity-60" />}
        <span className={cn('relative inline-flex size-2.5 rounded-full', status.open ? 'bg-[#7fd39a]' : 'bg-tomato-bright')} />
      </span>
      <span className="font-semibold">{status.label}</span>
      {!compact && status.detail && <span className="opacity-80">· {status.detail}</span>}
    </span>
  )
}
