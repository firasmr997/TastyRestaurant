import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

/**
 * Editorial photo rhythm: a repeating twelve-beat pattern of feature, tall, wide and standard tiles,
 * packed densely so the wall never reads as a grid of identical cards. The first eight tiles fill
 * exactly four rows of four (the home preview) and all twelve fill six, so walls end flush.
 */
const PATTERN = [
  'col-span-2 row-span-2',
  'row-span-1',
  'row-span-2',
  'row-span-1',
  'col-span-2 row-span-1',
  'row-span-2',
  'row-span-2',
  'col-span-2 row-span-1',
  'col-span-2 row-span-2',
  'row-span-1',
  'row-span-1',
  'col-span-2 row-span-1',
]

export function tileSpan(index: number): string {
  return PATTERN[index % PATTERN.length]
}

export function EditorialGrid({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('grid grid-flow-dense grid-cols-2 auto-rows-[10.5rem] gap-3 sm:auto-rows-[12rem] md:grid-cols-4 md:gap-4 lg:auto-rows-[14rem]', className)}>
      {children}
    </div>
  )
}
