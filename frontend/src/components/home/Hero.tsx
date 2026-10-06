import { ArrowDown, ArrowRight, MapPin, Phone } from 'lucide-react'
import { lazy, Suspense, useRef } from 'react'
import { Link } from 'react-router'
import { gsap, prefersReducedMotion, useGSAP } from '@/animations/gsap'
import { Wordmark } from '@/components/brand/Logo'
import { AnnouncementTicker } from '@/components/public/AnnouncementBar'
import { Block } from '@/components/public/Block'
import { LabelFrame } from '@/components/public/LabelFrame'
import { OpenStatus } from '@/components/public/OpenStatus'
import { PriceSticker } from '@/components/public/PriceSticker'
import { buttonClasses } from '@/components/ui/Button'
import { SmartImage } from '@/components/ui/SmartImage'
import { useIntro } from '@/context/IntroContext'
import { useSettings } from '@/context/SettingsContext'
import { useHeroDish } from '@/hooks/useHomeData'
import { useIsTouchSmallScreen, useMediaQuery, usePrefersReducedMotion } from '@/hooks/useMediaQuery'
import { useI18n } from '@/i18n/useI18n'
import { cn } from '@/utils/cn'

const HeroScene = lazy(() => import('@/components/three/HeroScene'))

/** Splits a headline into masked words so each can rise into place. */
function MaskedWords({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((word, i) => (
        <span key={i} className="inline-block overflow-hidden pb-[0.06em] align-bottom">
          <span data-hero-word className="inline-block">
            {word}
            {' '}
          </span>
        </span>
      ))}
    </>
  )
}

export function Hero() {
  const { t, path, pick } = useI18n()
  const { settings } = useSettings()
  const { introDone } = useIntro()
  const { photo, dish } = useHeroDish()
  const reduceMotion = usePrefersReducedMotion()
  const smallScreen = useIsTouchSmallScreen()
  // The 3D layer lives in the right half of the two-column hero; stacked layouts have no clear rear plane.
  const twoColumn = useMediaQuery('(min-width: 1024px)')
  const root = useRef<HTMLElement>(null)

  const dishName = dish ? pick(dish.name, dish.nameFr) : photo ? pick(photo.title, photo.titleFr) : ''
  const imageUrl = photo?.imageUrl ?? dish?.mainImage?.url

  // Entrance: the label frame settles, the wordmark prints, words rise, the window opens, the sticker lands.
  useGSAP(
    () => {
      if (!introDone || !root.current || prefersReducedMotion()) return
      const q = gsap.utils.selector(root)
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.from(q('[data-hero-frame]'), { scale: 1.025, opacity: 0, duration: 0.9 })
        .from(q('[data-hero-mark]'), { clipPath: 'inset(0 100% 0 0)', duration: 1.1 }, 0.05)
        .from(q('[data-hero-word]'), { yPercent: 110, duration: 0.9, stagger: 0.06 }, 0.25)
        .from(q('[data-hero-window]'), { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.2, ease: 'expo.inOut' }, 0.1)
        .from(q('[data-hero-photo] img'), { scale: 1.25, duration: 1.6 }, 0.1)
        .from(q('[data-hero-sticker]'), { scale: 1.9, rotate: -40, opacity: 0, duration: 0.8, ease: 'back.out(2.2)' }, 0.95)
        .from(q('[data-hero-fade]'), { y: 18, opacity: 0, duration: 0.8, stagger: 0.07 }, 0.6)

      // Rear plane only: the photo drifts inside its window and the sticker turns as the page scrolls.
      gsap.to(q('[data-hero-photo]'), {
        yPercent: 10,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      gsap.fromTo(q('[data-hero-sticker-scroll]'), { rotate: 0 }, {
        rotate: 12,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
    },
    { scope: root, dependencies: [introDone] },
  )

  return (
    <Block
      ref={root}
      tone="pickle"
      aria-labelledby="hero-title"
      className={cn('overflow-hidden pt-[4.75rem] lg:pt-[5.5rem]', !introDone && 'invisible')}
    >
      {!reduceMotion && twoColumn && (
        <Suspense fallback={null}>
          <div className="absolute inset-0 -z-10">
            <HeroScene count={smallScreen ? 10 : 26} />
          </div>
        </Suspense>
      )}
      {/* The label ends above the ticker band, so its rules never cross the ticker text. */}
      <div data-hero-frame aria-hidden className="pointer-events-none absolute inset-x-0 top-0 bottom-[3.25rem]">
        <LabelFrame />
      </div>

      <div className="relative mx-auto grid w-full max-w-[90rem] gap-x-10 px-10 pb-12 sm:px-12 lg:min-h-[calc(100svh-8.75rem)] lg:grid-cols-12 lg:px-14 lg:pb-14">
        {/* Signature dish in an arched window (first on mobile so the food leads). */}
        <div className="relative order-1 mt-4 lg:order-2 lg:col-span-5 lg:mt-6 lg:self-stretch">
          <div
            data-hero-window
            className="relative h-[46svh] min-h-[18rem] overflow-hidden arch rounded-b-[1.1rem] border-[3px] border-mustard sm:h-[52svh] lg:h-full lg:min-h-[32rem]"
          >
            <div data-hero-photo className="absolute -inset-y-[8%] inset-x-0">
              <SmartImage
                src={imageUrl}
                alt={photo?.altText || dishName || 'Tasty signature dish'}
                priority
                width={1200}
                sizes="(min-width: 1024px) 40vw, 100vw"
                frameClassName="h-full w-full bg-pickle-deep"
              />
            </div>
          </div>
          {dish && (
            <div data-hero-sticker-scroll className="absolute right-0 top-6 z-10 sm:right-4 lg:-left-12 lg:right-auto lg:top-auto lg:bottom-16">
            <Link
              to={path(`/menu/${dish.slug}`)}
              data-hero-sticker
              className="flex items-center"
              aria-label={`${dishName}, ${t.common.viewDish}`}
            >
              <PriceSticker price={dish.price} size="lg" rotate={-10} />
              <span className="-ml-3 -rotate-6 rounded-full border-[3px] border-label bg-tomato py-1.5 pl-5 pr-4 font-display text-lg font-extrabold uppercase leading-none tracking-[0.04em] text-white shadow-[0_10px_24px_-12px_rgb(0_0_0/0.5)]">
                <span className="block text-[0.7rem] tracking-[0.18em] text-white/85">{t.hero.signature}</span>
                {dishName}
              </span>
            </Link>
            </div>
          )}
        </div>

        <div className="relative order-2 flex flex-col justify-end pt-8 lg:order-1 lg:col-span-7 lg:pt-6">
          {/* On shorter laptop screens the wordmark narrows (it is 3.09:1) so the whole label stays in view. */}
          <div
            data-hero-mark
            className="-mt-20 mb-6 w-full max-w-[44rem] text-label sm:-mt-24 lg:mt-0 lg:mb-10 lg:max-w-[min(44rem,max(26rem,calc((100svh-41.5rem)*3.09)))]"
          >
            <Wordmark variant="inline" className="h-auto w-full drop-shadow-[0_2px_0_rgb(22_56_41/0.6)]" />
          </div>
          <h1 id="hero-title" className="text-h1 text-label">
            <span className="sr-only">Tasty: </span>
            <MaskedWords text={t.hero.headline} />
          </h1>
          <p data-hero-fade className="mt-5 max-w-[38ch] text-lead text-pickle-soft">
            {t.hero.sub}
          </p>
          <div data-hero-fade className="mt-8 flex flex-wrap items-center gap-3">
            <Link to={path('/menu')} className={cn(buttonClasses({ variant: 'primary', size: 'lg' }), 'font-display text-lg uppercase tracking-[0.06em]')}>
              {t.hero.ctaMenu}
              <ArrowRight className="size-5 transition-transform duration-300 group-hover/button:translate-x-1" aria-hidden />
            </Link>
            <Link
              to={path('/contact')}
              className={cn(
                buttonClasses({ variant: 'outline', size: 'lg' }),
                'border-label font-display text-lg uppercase tracking-[0.06em] text-label hover:bg-label hover:text-pickle',
              )}
            >
              {t.hero.ctaFind}
            </Link>
          </div>

          {/* Ruled strip: the practical facts within one glance. */}
          <dl data-hero-fade className="mt-10 grid border-[1.5px] border-label/45 text-[0.95rem] sm:grid-cols-[auto_minmax(0,1fr)_auto] lg:mt-14">
            <div className="flex items-center gap-2 px-4 py-3">
              <dt className="sr-only">{t.home.location.hours}</dt>
              <dd>
                <OpenStatus />
              </dd>
            </div>
            <div className="flex items-center gap-2 border-t-[1.5px] border-label/45 px-4 py-3 sm:border-l-[1.5px] sm:border-t-0">
              <dt className="sr-only">{t.home.location.address}</dt>
              <MapPin className="size-4 shrink-0 text-mustard" aria-hidden />
              <dd className="truncate">{settings?.addressLine ?? '…'}</dd>
            </div>
            <div className="flex items-center gap-2 border-t-[1.5px] border-label/45 px-4 py-3 sm:border-l-[1.5px] sm:border-t-0">
              <dt className="sr-only">{t.home.location.phone}</dt>
              <Phone className="size-4 shrink-0 text-mustard" aria-hidden />
              <dd>
                {settings?.phone ? (
                  <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`} className="tnum hover:text-mustard">
                    {settings.phone}
                  </a>
                ) : (
                  '…'
                )}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div data-hero-fade className="relative flex h-[3.25rem] items-center gap-4 pl-6 text-mustard sm:pl-10 lg:pl-14">
        <a href="#signatures" className="hidden shrink-0 items-center gap-2 font-stencil text-sm font-bold uppercase tracking-[0.16em] text-label/80 hover:text-mustard sm:inline-flex">
          <ArrowDown className="size-4 animate-[nudge_1.8s_ease-in-out_infinite] motion-reduce:animate-none" aria-hidden />
          {t.hero.scroll}
        </a>
        <AnnouncementTicker className="min-w-0 flex-1" />
      </div>
    </Block>
  )
}
