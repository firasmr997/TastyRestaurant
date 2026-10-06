import { ArrowRight } from 'lucide-react'
import { useRef } from 'react'
import { Link } from 'react-router'
import { gsap, useGSAP } from '@/animations/gsap'
import { useReveal } from '@/animations/useReveal'
import { Container } from '@/components/public/Block'
import { FoodCard, FoodCardSkeleton } from '@/components/public/FoodCard'
import { QueryError } from '@/components/public/QueryState'
import { SectionTitle } from '@/components/public/SectionTitle'
import { useFeaturedDishes } from '@/hooks/useHomeData'
import { useI18n } from '@/i18n/useI18n'

/**
 * Signatures: on large screens the row of labels is pinned and scrubs sideways as you scroll down,
 * like a crate sliding along the market stall; on phones it is a native swipe row.
 */
export function FeaturedMenu() {
  const { t, path } = useI18n()
  const { data, error, isLoading, refetch } = useFeaturedDishes(10)
  const section = useRef<HTMLElement>(null)
  const pinned = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const progress = useRef<HTMLSpanElement>(null)
  const heading = useReveal<HTMLDivElement>()

  useGSAP(
    () => {
      if (!data?.content.length) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const trackEl = track.current
        if (!trackEl) return
        const distance = () => Math.max(0, trackEl.scrollWidth - trackEl.clientWidth)
        const tween = gsap.to(trackEl, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pinned.current,
            start: 'top top+=80',
            end: () => `+=${distance()}`,
            scrub: 0.6,
            pin: true,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => progress.current && gsap.set(progress.current, { scaleX: self.progress }),
          },
        })

        // Keyboard users: tabbing to a card that is still off-screen scrolls the page to where it slides in.
        const onFocus = (event: FocusEvent) => {
          const st = tween.scrollTrigger
          const card = (event.target as HTMLElement).closest<HTMLElement>('[data-card]')
          if (!st || !card) return
          const rect = card.getBoundingClientRect()
          if (rect.left >= 0 && rect.right <= window.innerWidth) return
          const offset = rect.left - trackEl.getBoundingClientRect().left - 48
          window.scrollTo({ top: st.start + Math.min(distance(), Math.max(0, offset)), behavior: 'instant' })
        }
        trackEl.addEventListener('focusin', onFocus)
        return () => trackEl.removeEventListener('focusin', onFocus)
      })
      return () => mm.revert()
    },
    { scope: section, dependencies: [data?.content.length] },
  )

  // ScrollTrigger wraps the pinned element in a spacer div. Pinning an inner element keeps the section
  // where React expects it, so sibling sections can mount and unmount around it safely.
  return (
    <section id="signatures" ref={section} aria-labelledby="signatures-title">
      <div ref={pinned} className="overflow-x-clip py-16 lg:py-20">
        <Container ref={heading}>
          <SectionTitle
            title={<span id="signatures-title">{t.home.featured.title}</span>}
            sub={t.home.featured.sub}
            action={
              <Link to={path('/menu')} className="group inline-flex items-center gap-2 font-display text-xl font-extrabold uppercase tracking-[0.04em] text-tomato-deep">
                {t.nav.cta}
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            }
          />
        </Container>

        <div className="mt-10 lg:mt-12">
          {error && !data ? (
            <QueryError error={error} onRetry={refetch} />
          ) : (
            <div
              ref={track}
              className="flex snap-x snap-mandatory scroll-px-5 gap-5 overflow-x-auto px-5 pb-6 sm:scroll-px-8 sm:px-8 lg:scroll-px-12 lg:px-12 lg:motion-safe:snap-none lg:motion-safe:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {isLoading || !data
                ? Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="w-[78vw] shrink-0 sm:w-[22rem]">
                      <FoodCardSkeleton />
                    </div>
                  ))
                : data.content.map((item, index) => (
                    <div key={item.id} data-card className="w-[78vw] shrink-0 snap-start sm:w-[22rem]">
                      <FoodCard item={item} priority={index < 2} sizes="(min-width: 640px) 22rem, 78vw" />
                    </div>
                  ))}
            </div>
          )}
          <div className="mx-5 hidden h-[3px] overflow-hidden bg-ink/10 sm:mx-8 lg:mx-12 lg:motion-safe:block" aria-hidden>
            <span ref={progress} className="block h-full origin-left scale-x-0 bg-tomato" />
          </div>
        </div>
      </div>
    </section>
  )
}
