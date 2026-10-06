import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type BlockTone = 'pickle' | 'tomato' | 'mustard' | 'ink' | 'label' | 'tint'

const tones: Record<BlockTone, { classes: string; dark: boolean }> = {
  pickle: { classes: 'bg-pickle text-label', dark: true },
  tomato: { classes: 'bg-tomato text-white', dark: true },
  mustard: { classes: 'bg-mustard text-ink', dark: false },
  ink: { classes: 'bg-ink text-label', dark: true },
  label: { classes: 'bg-label text-ink', dark: false },
  tint: { classes: 'bg-surface-2 text-ink', dark: false },
}

interface BlockProps extends ComponentProps<'section'> {
  tone?: BlockTone
  /** Inset "crate" block with rounded corners and gutters, or full-bleed. */
  inset?: boolean
  children: ReactNode
}

/**
 * Sections stack like cut crate blocks with deep gutters between them. Coloured blocks are inset with
 * rounded corners; label-white sections run full width.
 */
export function Block({ tone = 'label', inset = true, className, children, ...rest }: BlockProps) {
  const t = tones[tone]
  return (
    <section
      data-tone={t.dark ? 'dark' : undefined}
      className={cn(t.classes, inset && 'mx-2 rounded-block sm:mx-3 lg:mx-4', 'relative isolate', className)}
      {...rest}
    >
      {children}
    </section>
  )
}

/** Page-width container used inside blocks. */
export function Container({ className, children, ...rest }: ComponentProps<'div'>) {
  return (
    <div className={cn('mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12', className)} {...rest}>
      {children}
    </div>
  )
}
