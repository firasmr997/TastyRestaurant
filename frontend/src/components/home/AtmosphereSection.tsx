import { ArrowRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { Link } from 'react-router'
import { gsap, prefersReducedMotion, useGSAP } from '@/animations/gsap'
import { useReveal } from '@/animations/useReveal'
import { Block, Container } from '@/components/public/Block'
import { GalleryCard } from '@/components/public/GalleryCard'
import { Lightbox } from '@/components/public/Lightbox'
import { useGalleryPhotos } from '@/hooks/useHomeData'
import { useI18n } from '@/i18n/useI18n'
import { cn } from '@/utils/cn'

const SHAPES = ['aspect-[4/5] w-[68vw] sm:w-[22rem]', 'aspect-[5/4] w-[78vw] sm:w-[30rem]', 'aspect-square w-[64vw] sm:w-[24rem]']

/** The room, on a pickle field: a ribbon of photos that drifts sideways as the page scrolls. */
export function AtmosphereSection() {
  const { t, path } = useI18n()
  const { data } = useGalleryPhotos('atmosphere', ['INTERIOR', 'DINING', 'BAR', 'ATMOSPHERE', 'EXTERIOR'], 8, undefined)
  const images = data?.content ?? []
  const [open, setOpen] = useState<number | null>(null)
  const section = useRef<HTMLElement>(null)
  const ribbon = useRef<HTMLDivElement>(null)
  const heading = useReveal<HTMLDivElement>()

  useGSAP(
    () => {
      if (!ribbon.current || prefersReducedMotion() || images.length === 0) return
      gsap.fromTo(
        ribbon.current,
        { x: 0 },
        {
          x: () => -(ribbon.current!.scrollWidth - window.innerWidth) * 0.5,
          ease: 'none',
          scrollTrigger: { trigger: section.current, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
        },
      )
    },
    { scope: section, dependencies: [images.length] },
  )

  return (
    <Block ref={section} tone="pickle" aria-labelledby="atmosphere-title" className="overflow-hidden py-16 sm:py-20 lg:py-24">
      <Container ref={heading} className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-2xl">
          <h2 id="atmosphere-title" data-reveal className="text-h2 text-label">
            {t.home.atmosphere.title}
          </h2>
          <p data-reveal className="mt-4 max-w-[46ch] text-lead text-pickle-soft">
            {t.home.atmosphere.sub}
          </p>
        </div>
        <Link
          data-reveal
          to={path('/gallery/restaurant')}
          className="group inline-flex items-center gap-2 font-display text-xl font-extrabold uppercase tracking-[0.04em] text-mustard"
        >
          {t.home.atmosphere.cta}
          <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
        </Link>
      </Container>

      <div className="mt-12 overflow-x-auto [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
        <div ref={ribbon} className="flex w-max items-end gap-4 px-5 sm:gap-6 sm:px-8 lg:px-12">
          {(images.length ? images : Array.from({ length: 5 })).map((image, i) =>
            image ? (
              <div key={(image as { id: number }).id} className={cn('shrink-0', SHAPES[i % SHAPES.length], i % 2 === 1 && 'sm:-mb-10')}>
                <GalleryCard image={images[i]} onOpen={() => setOpen(i)} sizes="(min-width: 640px) 30rem, 80vw" />
              </div>
            ) : (
              <span key={i} className={cn('skeleton shrink-0 rounded-card', SHAPES[i % SHAPES.length])} />
            ),
          )}
        </div>
      </div>
      <Lightbox images={images} index={open} onClose={() => setOpen(null)} onIndexChange={setOpen} />
    </Block>
  )
}
