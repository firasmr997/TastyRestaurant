import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'
import { gsap, prefersReducedMotion, useGSAP } from '@/animations/gsap'
import { useParallax, useReveal } from '@/animations/useReveal'
import { Block, Container } from '@/components/public/Block'
import { Sticker } from '@/components/public/Sticker'
import { Seo } from '@/components/Seo'
import { buttonClasses } from '@/components/ui/Button'
import { SmartImage } from '@/components/ui/SmartImage'
import { useGalleryPhotos } from '@/hooks/useHomeData'
import { useI18n } from '@/i18n/useI18n'
import { cn } from '@/utils/cn'
import { LabelFrame } from '@/components/public/LabelFrame'

export default function AboutPage() {
  const { t, path, pick } = useI18n()
  const hero = useGalleryPhotos('about-hero', ['INTERIOR'], 1, true)
  const kitchen = useGalleryPhotos('about-kitchen', ['KITCHEN', 'BURGER', 'FOOD'], 6, true)
  const team = useGalleryPhotos('about-team', ['TEAM'], 4)
  const room = useGalleryPhotos('about-room', ['DINING', 'BAR', 'EXTERIOR', 'ATMOSPHERE'], 8)
  const heroImage = hero.data?.content[0]
  const intro = useReveal<HTMLDivElement>()
  const heroParallax = useParallax<HTMLDivElement>(12)

  return (
    <>
      <Seo title={t.meta.about.title} description={t.meta.about.description} />

      <Block tone="pickle" className="overflow-hidden pt-[6.5rem] pb-12 lg:pt-[8rem] lg:pb-16">
        <LabelFrame />
        <Container className="relative grid gap-10 px-10 sm:px-12 lg:grid-cols-12 lg:items-end lg:px-14">
          <div ref={intro} className="lg:col-span-7">
            <h1 data-reveal className="text-h1 text-label">
              {t.about.title}
            </h1>
            <p data-reveal className="mt-6 max-w-[44ch] text-lead text-pickle-soft">
              {t.about.intro}
            </p>
          </div>
          <div className="relative lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden arch rounded-b-[1.1rem] border-[3px] border-mustard">
              <div ref={heroParallax} className="absolute inset-x-0 -inset-y-[12%]">
                <SmartImage
                  src={heroImage?.imageUrl}
                  alt={heroImage ? pick(heroImage.altText ?? heroImage.title, heroImage.titleFr) : ''}
                  priority
                  width={1080}
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  frameClassName="h-full w-full"
                />
              </div>
            </div>
            <Sticker tone="mustard" rotate={-10} className="absolute -left-3 bottom-8 size-32 text-xl">
              {t.home.story.sticker}
            </Sticker>
          </div>
        </Container>
      </Block>

      <StoryBlock />
      <Chapters images={kitchen.data?.content.map((p) => ({ url: p.imageUrl, alt: pick(p.altText ?? p.title, p.titleFr) })) ?? []} />

      <Block tone="tint" aria-labelledby="team-title" className="py-16 sm:py-20 lg:py-24">
        <Container>
          <h2 id="team-title" className="text-h2 text-pickle">
            {t.about.team.title}
          </h2>
          <p className="mt-4 max-w-[52ch] text-ink-muted">{t.about.team.sub}</p>
          <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {(team.data?.content ?? Array.from({ length: 4 }, () => null)).map((member, i) => (
              <li key={member?.id ?? i} className={cn(i % 2 === 1 && 'lg:mt-12')}>
                <div className="overflow-hidden arch rounded-b-card bg-surface">
                  {member ? (
                    <SmartImage
                      src={member.imageUrl}
                      alt={pick(member.altText ?? member.title, member.titleFr)}
                      width={720}
                      sizes="(min-width: 1024px) 22vw, 45vw"
                      frameClassName="aspect-[3/4]"
                    />
                  ) : (
                    <span className="skeleton block aspect-[3/4]" />
                  )}
                </div>
                {member && (
                  <p className="mt-3 font-display text-xl font-extrabold uppercase leading-none">{pick(member.title, member.titleFr)}</p>
                )}
              </li>
            ))}
          </ul>
        </Container>
      </Block>

      <RoomRibbon images={room.data?.content.map((p) => ({ id: p.id, url: p.imageUrl, alt: pick(p.altText ?? p.title, p.titleFr), title: pick(p.title, p.titleFr) })) ?? []} />

      <Block tone="tomato" aria-labelledby="mission-title" className="py-20 sm:py-24 lg:py-28">
        <Container className="text-center">
          <h2 id="mission-title" className="font-stencil text-xl font-bold uppercase tracking-[0.16em] text-white/85">
            {t.about.mission.title}
          </h2>
          <p className="mx-auto mt-6 max-w-[22ch] font-display text-[clamp(2.25rem,1.3rem+3.6vw,4.5rem)] font-extrabold uppercase leading-[0.95]">
            {t.about.mission.text}
          </p>
          <Link
            to={path('/menu')}
            className={cn(buttonClasses({ variant: 'inverse', size: 'lg' }), 'mt-10 font-display text-lg uppercase tracking-[0.06em] text-tomato-deep')}
          >
            {t.about.cta}
            <ArrowRight className="size-5 transition-transform duration-300 group-hover/button:translate-x-1" aria-hidden />
          </Link>
        </Container>
      </Block>
    </>
  )
}

function StoryBlock() {
  const { t } = useI18n()
  const ref = useReveal<HTMLDivElement>()
  return (
    <section aria-labelledby="about-story" className="py-20 lg:py-28">
      <Container ref={ref} className="grid gap-8 lg:grid-cols-12">
        <h2 id="about-story" data-reveal className="text-h2 text-pickle lg:col-span-4">
          {t.about.story.title}
        </h2>
        <div className="lg:col-span-8">
          <p data-reveal className="max-w-[34ch] font-display text-[clamp(1.75rem,1.2rem+1.8vw,2.75rem)] font-bold uppercase leading-[1.02] text-ink">
            {t.about.story.p1}
          </p>
          <p data-reveal className="mt-8 max-w-[62ch] text-lead text-ink-muted">
            {t.about.story.p2}
          </p>
        </div>
      </Container>
    </section>
  )
}

/** Sticky storytelling: the photo stays pinned while the chapters scroll past and swaps with each one. */
function Chapters({ images }: { images: { url: string; alt: string }[] }) {
  const { t } = useI18n()
  const [active, setActive] = useState(0)
  const refs = useRef<(HTMLElement | null)[]>([])

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(Number((entry.target as HTMLElement).dataset.index))
        })
      },
      { rootMargin: '-45% 0px -45% 0px' },
    )
    refs.current.forEach((el) => el && observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const image = images.length ? images[active % images.length] : undefined

  return (
    <Block tone="ink" aria-label={t.about.chapters.map((c) => c.title).join(', ')} className="py-16 lg:py-0">
      <Container className="grid gap-10 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-24 lg:flex lg:h-[calc(100svh-7rem)] lg:items-center">
            <div className="relative aspect-[4/5] w-full overflow-hidden arch rounded-b-card border-[3px] border-mustard lg:max-h-full">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={image?.url ?? 'none'}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                >
                  <SmartImage src={image?.url} alt={image?.alt ?? ''} width={1080} sizes="(min-width: 1024px) 45vw, 100vw" frameClassName="h-full w-full" />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
        <ol className="lg:col-span-6">
          {t.about.chapters.map((chapter, index) => (
            <li
              key={chapter.title}
              ref={(el) => {
                refs.current[index] = el
              }}
              data-index={index}
              className="flex min-h-[48svh] flex-col justify-center border-b-[1.5px] border-label/20 py-12 last:border-b-0 lg:min-h-[80svh]"
            >
              <h2 className={cn('text-h2 transition-colors duration-500', active === index ? 'text-mustard' : 'text-label')}>{chapter.title}</h2>
              <p className="mt-6 max-w-[46ch] text-lead text-label/80">{chapter.text}</p>
            </li>
          ))}
        </ol>
      </Container>
    </Block>
  )
}

function RoomRibbon({ images }: { images: { id: number; url: string; alt: string; title: string }[] }) {
  const { t } = useI18n()
  const section = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!track.current || prefersReducedMotion() || images.length === 0) return
      gsap.fromTo(
        track.current,
        { x: 0 },
        {
          x: () => -(track.current!.scrollWidth - window.innerWidth) * 0.6,
          ease: 'none',
          scrollTrigger: { trigger: section.current, start: 'top bottom', end: 'bottom top', scrub: true, invalidateOnRefresh: true },
        },
      )
    },
    { scope: section, dependencies: [images.length] },
  )

  return (
    <section ref={section} aria-labelledby="room-title" className="overflow-hidden py-20 lg:py-24">
      <Container>
        <h2 id="room-title" className="text-h2 text-pickle">
          {t.about.room.title}
        </h2>
        <p className="mt-4 max-w-[48ch] text-lead text-ink-muted">{t.about.room.sub}</p>
      </Container>
      <div className="mt-10 overflow-x-auto [scrollbar-width:none] lg:overflow-visible [&::-webkit-scrollbar]:hidden">
        <div ref={track} className="flex w-max gap-4 px-5 sm:gap-6 sm:px-8 lg:px-12">
          {images.map((image, i) => (
            <figure key={image.id} className={cn('shrink-0', i % 3 === 1 ? 'w-[70vw] sm:w-[30rem]' : 'w-[60vw] sm:w-[22rem]')}>
              <SmartImage
                src={image.url}
                alt={image.alt}
                width={960}
                sizes="(min-width: 640px) 30rem, 70vw"
                frameClassName={cn('rounded-card', i % 3 === 1 ? 'aspect-[5/4]' : 'aspect-[4/5]')}
              />
              <figcaption className="mt-3 font-display text-lg font-extrabold uppercase">{image.title}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
