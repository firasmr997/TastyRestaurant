import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { useParallax, useReveal } from '@/animations/useReveal'
import { Block, Container } from '@/components/public/Block'
import { PriceSticker } from '@/components/public/PriceSticker'
import { Sticker } from '@/components/public/Sticker'
import { buttonClasses } from '@/components/ui/Button'
import { SmartImage } from '@/components/ui/SmartImage'
import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/i18n/useI18n'
import { cn } from '@/utils/cn'

/** Chef's special from admin -> Settings (title, text and linked dish). Hidden when the promotion is off. */
export function SpecialSection() {
  const { settings } = useSettings()
  const { t, path, pick } = useI18n()
  const text = useReveal<HTMLDivElement>()
  const parallax = useParallax<HTMLDivElement>(10)
  const dish = settings?.promoMenuItem
  if (!settings?.promoEnabled || !settings.promoTitle) return null

  return (
    <Block tone="ink" aria-labelledby="special-title" className="overflow-hidden py-16 sm:py-20 lg:py-24">
      <Container className="grid items-center gap-12 lg:grid-cols-12">
        <div ref={text} className="relative z-10 lg:col-span-6">
          <h2 id="special-title" data-reveal className="text-h2 text-label">
            {pick(settings.promoTitle, settings.promoTitleFr)}
          </h2>
          {settings.promoText && (
            <p data-reveal className="mt-6 max-w-[48ch] text-lead text-label/80">
              {pick(settings.promoText, settings.promoTextFr)}
            </p>
          )}
          {dish && (
            <Link
              data-reveal
              to={path(`/menu/${dish.slug}`)}
              className={cn(buttonClasses({ variant: 'primary', size: 'lg' }), 'mt-9 font-display text-lg uppercase tracking-[0.06em]')}
            >
              {t.home.special.cta}
              <ArrowRight className="size-5 transition-transform duration-300 group-hover/button:translate-x-1" aria-hidden />
            </Link>
          )}
        </div>
        {dish && (
          <div className="relative lg:col-span-6">
            <div className="relative ml-auto aspect-square w-full max-w-[34rem] overflow-hidden rounded-full border-[6px] border-mustard">
              <div ref={parallax} className="absolute inset-x-0 -inset-y-[12%]">
                <SmartImage
                  src={dish.mainImage?.url}
                  alt={dish.mainImage?.altText || pick(dish.name, dish.nameFr)}
                  width={1080}
                  sizes="(min-width: 1024px) 34rem, 90vw"
                  frameClassName="h-full w-full"
                />
              </div>
            </div>
            <Sticker tone="mustard" shape="oval" rotate={8} className="absolute right-0 top-6 px-6 py-3 text-xl sm:right-4">
              {t.home.special.label}
            </Sticker>
            <PriceSticker price={dish.price} size="lg" tone="tomato" rotate={10} className="absolute bottom-4 left-2 sm:left-10" />
          </div>
        )}
      </Container>
    </Block>
  )
}
