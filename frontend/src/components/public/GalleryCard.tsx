import { Expand } from 'lucide-react'
import { SmartImage } from '@/components/ui/SmartImage'
import { useI18n } from '@/i18n/useI18n'
import type { GalleryImage } from '@/types/models'
import { cn } from '@/utils/cn'

interface GalleryCardProps {
  image: GalleryImage
  onOpen: () => void
  className?: string
  /** Frame classes controlling the shape (aspect, spans are set by the grid). */
  frameClassName?: string
  sizes?: string
  priority?: boolean
}

/** Photo tile: zooms on hover and reveals its caption; opens the lightbox. */
export function GalleryCard({ image, onOpen, className, frameClassName, sizes = '(min-width: 1024px) 33vw, 50vw', priority }: GalleryCardProps) {
  const { t, fmt, pick } = useI18n()
  const title = pick(image.title, image.titleFr)
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={fmt(t.gallery.open, { title })}
      className={cn(
        'group/tile relative block h-full w-full overflow-hidden rounded-card bg-surface-2 text-left',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-focus focus-visible:ring-offset-2',
        className,
      )}
    >
      <SmartImage
        src={image.imageUrl}
        alt={image.altText || title}
        width={960}
        sizes={sizes}
        priority={priority}
        frameClassName={cn('h-full w-full', frameClassName)}
        className="transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/tile:scale-[1.06]"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-3 bottom-3 flex translate-y-3 items-center justify-between gap-3 rounded-control bg-label px-3.5 py-2.5 text-ink opacity-0 transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/tile:translate-y-0 group-hover/tile:opacity-100 group-focus-visible/tile:translate-y-0 group-focus-visible/tile:opacity-100"
      >
        <span className="font-display text-lg font-extrabold uppercase leading-none">{title}</span>
        <Expand className="size-4 shrink-0 text-tomato" />
      </span>
    </button>
  )
}
