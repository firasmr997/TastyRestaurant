import type { CSSProperties } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/i18n/useI18n'
import { cn } from '@/utils/cn'
import { currencySymbol, formatAmount, formatPrice } from '@/utils/format'

interface PriceStickerProps {
  price: number
  size?: 'sm' | 'md' | 'lg'
  tone?: 'mustard' | 'tomato' | 'label'
  rotate?: number
  className?: string
}

const sizes = {
  sm: 'size-16 text-[1.35rem]',
  md: 'size-[4.75rem] text-[1.6rem]',
  lg: 'size-28 text-[2.4rem] sm:size-32 sm:text-[2.7rem]',
}

const tones = {
  mustard: 'bg-mustard text-ink',
  tomato: 'bg-tomato text-white',
  label: 'bg-label text-ink',
}

/** Round die-cut price sticker. The amount sits on fixed digit positions (tabular figures). */
export function PriceSticker({ price, size = 'md', tone = 'mustard', rotate = -8, className }: PriceStickerProps) {
  const { currency } = useSettings()
  const { locale } = useI18n()
  const symbol = currencySymbol(currency, locale)
  return (
    <span
      style={{ '--sticker-rotate': `${rotate}deg` } as CSSProperties}
      className={cn(
        '[rotate:var(--sticker-rotate)] inline-flex aspect-square flex-col items-center justify-center rounded-full border-[3px] border-label font-display font-extrabold leading-none',
        'transition-[rotate,scale] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
        sizes[size],
        tones[tone],
        className,
      )}
    >
      <span className="sr-only">{formatPrice(price, currency, locale)}</span>
      <span aria-hidden className="text-[0.42em] font-bold tracking-[0.06em] opacity-80">
        {symbol}
      </span>
      <span aria-hidden className="tnum -mt-0.5">
        {formatAmount(price, locale)}
      </span>
    </span>
  )
}
