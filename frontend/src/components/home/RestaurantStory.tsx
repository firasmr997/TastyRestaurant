import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { useParallax, useReveal } from '@/animations/useReveal'
import { Container } from '@/components/public/Block'
import { Sticker } from '@/components/public/Sticker'
import { SmartImage } from '@/components/ui/SmartImage'
import { useGalleryPhotos } from '@/hooks/useHomeData'
import { useI18n } from '@/i18n/useI18n'

/** Editorial story: a big statement, two short paragraphs and two photos layered over each other. */
export function RestaurantStory() {
  const { t, path, pick } = useI18n()
  const { data } = useGalleryPhotos('story', ['KITCHEN'], 2)
  const [main, second] = data?.content ?? []
  const text = useReveal<HTMLDivElement>()
  const parallax = useParallax<HTMLDivElement>(14)

  return (
    <section aria-labelledby="story-title" className="py-20 lg:py-28">
      <Container className="grid items-center gap-14 lg:grid-cols-12">
        <div className="relative lg:col-span-6">
          <div className="relative aspect-[4/5] w-[86%] overflow-hidden arch rounded-b-card bg-surface-2">
            <div ref={parallax} className="absolute inset-x-0 -inset-y-[12%]">
              <SmartImage
                src={main?.imageUrl}
                alt={main ? pick(main.altText ?? main.title, main.titleFr) : ''}
                width={1080}
                sizes="(min-width: 1024px) 40vw, 86vw"
                frameClassName="h-full w-full"
              />
            </div>
          </div>
          {second && (
            <div className="absolute -bottom-8 right-0 w-[44%] rotate-3 rounded-card border-[6px] border-label bg-label shadow-lift">
              <SmartImage
                src={second.imageUrl}
                alt={pick(second.altText ?? second.title, second.titleFr)}
                width={640}
                sizes="20vw"
                frameClassName="aspect-square rounded-[0.6rem]"
              />
            </div>
          )}
          <Sticker tone="mustard" rotate={-12} className="absolute -left-2 top-8 size-28 text-[1.05rem] sm:size-32 sm:text-xl">
            {t.home.story.sticker}
          </Sticker>
        </div>

        <div ref={text} className="lg:col-span-6 lg:pl-6">
          <h2 id="story-title" data-reveal className="text-h2 text-pickle">
            {t.home.story.title}
          </h2>
          <p data-reveal className="mt-7 max-w-[60ch] text-lead">
            {t.home.story.p1}
          </p>
          <p data-reveal className="mt-4 max-w-[60ch] text-ink-muted">
            {t.home.story.p2}
          </p>
          <Link
            data-reveal
            to={path('/about')}
            className="group mt-8 inline-flex items-center gap-2 border-b-[3px] border-tomato pb-1 font-display text-xl font-extrabold uppercase tracking-[0.04em] text-ink"
          >
            {t.home.story.cta}
            <ArrowRight className="size-5 text-tomato transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
      </Container>
    </section>
  )
}
