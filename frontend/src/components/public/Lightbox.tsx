import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { useI18n } from '@/i18n/useI18n'
import type { GalleryImage } from '@/types/models'
import { resolveImageUrl, sizedImage } from '@/utils/image'

interface LightboxProps {
  images: GalleryImage[]
  index: number | null
  onClose: () => void
  onIndexChange: (index: number) => void
}

/** Fullscreen photo viewer: arrow keys, Escape, swipe, focus kept inside, caption with a link to the dish. */
export function Lightbox({ images, index, onClose, onIndexChange }: LightboxProps) {
  const { t, fmt, pick, path } = useI18n()
  const reduce = useReducedMotion()
  const open = index !== null && images[index] !== undefined
  const closeRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<number | null>(null)
  useLockBodyScroll(open)

  const go = useCallback(
    (delta: number) => {
      if (index === null || images.length === 0) return
      onIndexChange((index + delta + images.length) % images.length)
    },
    [index, images.length, onIndexChange],
  )

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement as HTMLElement | null
    closeRef.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      else if (event.key === 'ArrowRight') go(1)
      else if (event.key === 'ArrowLeft') go(-1)
      else if (event.key === 'Tab' && dialogRef.current) {
        const focusable = [...dialogRef.current.querySelectorAll<HTMLElement>('button, a[href]')]
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      previous?.focus?.()
    }
  }, [open, go, onClose])

  const image = open ? images[index!] : null
  const title = image ? pick(image.title, image.titleFr) : ''
  const description = image ? pick(image.description ?? '', image.descriptionFr) : ''

  return createPortal(
    <AnimatePresence>
      {open && image && (
        <motion.div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          data-tone="dark"
          className="fixed inset-0 z-[95] flex flex-col bg-ink text-label"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22 }}
          onTouchStart={(e) => (touchStart.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStart.current === null) return
            const delta = e.changedTouches[0].clientX - touchStart.current
            if (Math.abs(delta) > 50) go(delta < 0 ? 1 : -1)
            touchStart.current = null
          }}
        >
          <div className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
            <span className="tnum font-stencil text-lg font-bold tracking-[0.12em] text-pickle-soft">
              {fmt(t.gallery.counter, { n: index! + 1, total: images.length })}
            </span>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={t.gallery.close}
              className="inline-flex size-12 items-center justify-center rounded-full bg-label/10 transition-colors hover:bg-tomato"
            >
              <X className="size-6" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-20">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={image.id}
                src={sizedImage(resolveImageUrl(image.imageUrl), 1920, 82)}
                alt={image.altText || title}
                className="max-h-full max-w-full rounded-card object-contain"
                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                draggable={false}
              />
            </AnimatePresence>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label={t.gallery.previous}
                  className="absolute left-2 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-label text-ink transition-colors hover:bg-mustard sm:left-5"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label={t.gallery.next}
                  className="absolute right-2 top-1/2 inline-flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-label text-ink transition-colors hover:bg-mustard sm:right-5"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2 px-4 pb-5 pt-4 sm:flex-row sm:items-end sm:justify-between sm:px-6">
            <div className="min-w-0">
              <p className="font-display text-2xl font-extrabold uppercase leading-none sm:text-3xl">{title}</p>
              {description && <p className="mt-1.5 max-w-2xl text-sm text-pickle-soft">{description}</p>}
            </div>
            {image.menuItem && (
              <Link
                to={path(`/menu/${image.menuItem.slug}`)}
                onClick={onClose}
                className="group inline-flex shrink-0 items-center gap-2 font-display text-lg font-extrabold uppercase tracking-[0.04em] text-mustard"
              >
                {t.gallery.viewDish}: {pick(image.menuItem.name, image.menuItem.nameFr)}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
