import type { ReactNode } from 'react'
import { cn } from '@/utils/cn'

interface SectionTitleProps {
  title: ReactNode
  sub?: ReactNode
  /** Action placed on the right on wide screens (e.g. a "See all" link). */
  action?: ReactNode
  as?: 'h1' | 'h2'
  align?: 'left' | 'center'
  className?: string
  /** Inline crate lettering for the biggest display moments. */
  inline?: boolean
}

/** Section heading: the heading carries its own weight (no eyebrow), with an optional lead and action. */
export function SectionTitle({ title, sub, action, as: Tag = 'h2', align = 'left', className, inline }: SectionTitleProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-5 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'items-center text-center md:flex-col md:items-center',
        className,
      )}
    >
      <div className={cn('max-w-3xl', align === 'center' && 'mx-auto')}>
        <Tag data-reveal className={cn(Tag === 'h1' ? 'text-h1' : 'text-h2', inline && 'font-inline font-black tracking-[0.02em]')}>
          {title}
        </Tag>
        {sub && (
          <p data-reveal className="mt-4 max-w-[52ch] text-lead opacity-85">
            {sub}
          </p>
        )}
      </div>
      {action && (
        <div data-reveal className="shrink-0">
          {action}
        </div>
      )}
    </div>
  )
}
