import { ArrowRight, Mail, MapPin, Navigation, Phone } from 'lucide-react'
import { Link } from 'react-router'
import { useReveal } from '@/animations/useReveal'
import { Block, Container } from '@/components/public/Block'
import { HoursTable } from '@/components/public/HoursTable'
import { MapPlaceholder } from '@/components/public/MapPlaceholder'
import { OpenStatus } from '@/components/public/OpenStatus'
import { buttonClasses } from '@/components/ui/Button'
import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/i18n/useI18n'
import { cn } from '@/utils/cn'

/** Address, phone, email and hours with a map, so visitors can act straight from the homepage. */
export function LocationSection() {
  const { t, path } = useI18n()
  const { settings } = useSettings()
  const ref = useReveal<HTMLDivElement>()
  const address = settings ? [settings.addressLine, [settings.postalCode, settings.city].filter(Boolean).join(' ')].filter(Boolean) : []

  return (
    <Block tone="tint" aria-labelledby="location-title" className="py-16 sm:py-20 lg:py-24">
      <Container ref={ref} className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-5">
          <h2 id="location-title" data-reveal className="text-h2 text-pickle">
            {t.home.location.title}
          </h2>
          <p data-reveal className="mt-4 max-w-[44ch] text-ink-muted">
            {t.home.location.sub}
          </p>
          <div data-reveal className="mt-6">
            <OpenStatus className="text-ink" />
          </div>

          <dl data-reveal className="mt-8 divide-y-[1.5px] divide-ink/12 border-y-[1.5px] border-ink/12">
            <div className="flex gap-4 py-4">
              <dt className="flex w-28 shrink-0 items-center gap-2 font-semibold">
                <MapPin className="size-4 text-tomato" aria-hidden />
                {t.home.location.address}
              </dt>
              <dd>{address.length ? address.map((line) => <span key={line} className="block">{line}</span>) : '…'}</dd>
            </div>
            <div className="flex gap-4 py-4">
              <dt className="flex w-28 shrink-0 items-center gap-2 font-semibold">
                <Phone className="size-4 text-tomato" aria-hidden />
                {t.home.location.phone}
              </dt>
              <dd>
                {settings?.phone ? (
                  <a className="tnum underline-offset-4 hover:underline" href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`}>
                    {settings.phone}
                  </a>
                ) : (
                  '…'
                )}
              </dd>
            </div>
            <div className="flex gap-4 py-4">
              <dt className="flex w-28 shrink-0 items-center gap-2 font-semibold">
                <Mail className="size-4 text-tomato" aria-hidden />
                {t.home.location.email}
              </dt>
              <dd className="min-w-0 break-words">
                {settings?.email ? (
                  <a className="underline-offset-4 hover:underline" href={`mailto:${settings.email}`}>
                    {settings.email}
                  </a>
                ) : (
                  '…'
                )}
              </dd>
            </div>
          </dl>

          <div data-reveal className="mt-8 flex flex-wrap gap-3">
            {settings?.mapUrl && (
              <a
                href={settings.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonClasses({ variant: 'primary' }), 'font-display uppercase tracking-[0.06em]')}
              >
                <Navigation className="size-4" aria-hidden />
                {t.home.location.directions}
              </a>
            )}
            <Link to={path('/contact')} className={cn(buttonClasses({ variant: settings?.mapUrl ? 'outline' : 'primary' }), 'font-display uppercase tracking-[0.06em]')}>
              {t.home.location.contact}
              <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:col-span-7 lg:grid-rows-[1fr_auto]">
          <MapPlaceholder className="min-h-[18rem]" />
          <div data-reveal className="rounded-panel bg-label p-6 shadow-card">
            <h3 className="mb-3 font-stencil text-lg font-bold tracking-[0.12em] text-tomato-deep">{t.home.location.hours}</h3>
            <HoursTable />
          </div>
        </div>
      </Container>
    </Block>
  )
}
