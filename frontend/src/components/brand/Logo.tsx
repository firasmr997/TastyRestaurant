import { useId } from 'react'
import { cn } from '@/utils/cn'
import { MARK_BITE, MARK_T_INLINE, MARK_T_SOLID, WORDMARK_INLINE, WORDMARK_SOLID } from './logoPaths'

function safeId(raw: string) {
  return raw.replace(/[^a-zA-Z0-9_-]/g, '')
}

interface MarkProps {
  className?: string
  /** Sticker fill. */
  fill?: string
  /** Letter colour. */
  letter?: string
  /** Optional die-cut ring colour (a white edge, as on a real sticker). */
  ring?: string
  /** Solid letter for small sizes (favicons, tight UI). */
  solid?: boolean
  title?: string
}

/** The Tasty mark: a round produce sticker with a bite out of its edge and an inline T. */
export function LogoMark({ className, fill = 'var(--color-tomato)', letter = '#fffdf8', ring, solid, title }: MarkProps) {
  const id = `bite-${safeId(useId())}`
  return (
    <svg viewBox="0 0 120 120" className={className} role={title ? 'img' : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <defs>
        <mask id={id} maskUnits="userSpaceOnUse" x="0" y="0" width="120" height="120">
          <rect width="120" height="120" fill="#fff" />
          <g fill="#000" dangerouslySetInnerHTML={{ __html: MARK_BITE }} />
        </mask>
      </defs>
      <g mask={`url(#${id})`}>
        {ring && <circle cx="60" cy="60" r="58" fill={ring} />}
        <circle cx="60" cy="60" r={ring ? 53 : 58} fill={fill} />
        <path d={solid ? MARK_T_SOLID : MARK_T_INLINE} fill={letter} />
      </g>
    </svg>
  )
}

/** "TASTY" lettering. Inline for display moments, solid where it must hold up small. */
export function Wordmark({ variant = 'inline', className, title }: { variant?: 'inline' | 'solid'; className?: string; title?: string }) {
  const word = variant === 'inline' ? WORDMARK_INLINE : WORDMARK_SOLID
  return (
    <svg
      viewBox={`0 0 ${word.width} ${word.height}`}
      className={className}
      role={title ? 'img' : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      preserveAspectRatio="xMinYMid meet"
    >
      <path d={word.d} fill="currentColor" />
    </svg>
  )
}

/** Primary lockup: mark + inline wordmark. `tone="dark"` for green or ink grounds. */
export function Logo({
  tone = 'light',
  className,
  compact,
  hideWordmark,
}: {
  tone?: 'light' | 'dark'
  className?: string
  compact?: boolean
  hideWordmark?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', tone === 'dark' ? 'text-label' : 'text-pickle', className)}>
      <LogoMark
        className="h-full w-auto shrink-0"
        fill={tone === 'dark' ? 'var(--color-mustard)' : 'var(--color-tomato)'}
        letter={tone === 'dark' ? 'var(--color-ink)' : '#fffdf8'}
        solid={compact}
      />
      <Wordmark variant={compact ? 'solid' : 'inline'} className={cn('h-[78%] w-auto transition-opacity duration-300', hideWordmark && 'opacity-0')} />
      <span className="sr-only">Tasty</span>
    </span>
  )
}
