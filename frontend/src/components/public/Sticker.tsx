import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/utils/cn'

export type StickerTone = 'mustard' | 'tomato' | 'pickle' | 'label' | 'ink'

const tones: Record<StickerTone, string> = {
  mustard: 'bg-mustard text-ink',
  tomato: 'bg-tomato text-white',
  pickle: 'bg-pickle text-label',
  label: 'bg-label text-ink',
  ink: 'bg-ink text-label',
}

interface StickerProps {
  tone?: StickerTone
  shape?: 'round' | 'oval' | 'tag'
  rotate?: number
  className?: string
  children: ReactNode
  style?: CSSProperties
}

/**
 * A die-cut sticker: flat ink with a white cut edge. States (price, chef's pick, sold out, veggie)
 * are stuck onto surfaces with these rather than drawn as UI chips.
 */
export function Sticker({ tone = 'mustard', shape = 'round', rotate = -8, className, children, style }: StickerProps) {
  return (
    <span
      style={{ rotate: `${rotate}deg`, ...style }}
      className={cn(
        'inline-flex select-none items-center justify-center text-center font-display font-extrabold uppercase leading-[0.95] tracking-[0.04em]',
        'border-[3px] border-label',
        shape === 'round' && 'aspect-square rounded-full p-2',
        shape === 'oval' && 'rounded-[50%] px-4 py-2',
        shape === 'tag' && 'rounded-full px-3.5 py-1 text-sm',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
