import { Mail, MapPin, Navigation, Phone } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'
import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/brand/SocialIcons'
import { Block, Container } from '@/components/public/Block'
import { ContactForm } from '@/components/public/ContactForm'
import { HoursTable } from '@/components/public/HoursTable'
import { MapPlaceholder } from '@/components/public/MapPlaceholder'
import { OpenStatus } from '@/components/public/OpenStatus'
import { Seo } from '@/components/Seo'
import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/i18n/useI18n'
import { restaurantJsonLd } from '@/utils/structuredData'
import { LabelFrame } from '@/components/public/LabelFrame'

export default function ContactPage() {
  const { t, locale } = useI18n()
  const { settings } = useSettings()
  const jsonLd = useMemo(() => (settings ? restaurantJsonLd(settings, locale) : undefined), [settings, locale])
  const socials = [
    { href: settings?.instagramUrl, label: 'Instagram', Icon: InstagramIcon },
    { href: settings?.facebookUrl, label: 'Facebook', Icon: FacebookIcon },
    { href: settings?.tiktokUrl, label: 'TikTok', Icon: TikTokIcon },
  ].filter((s) => !!s.href)

  return (
    <>
      <Seo title={t.meta.contact.title} description={t.meta.contact.description} jsonLd={jsonLd} />
      <Block tone="pickle" className="overflow-hidden pt-[6.5rem] pb-12 lg:pt-[8rem] lg:pb-14">
        <LabelFrame />
        <Container className="relative px-10 sm:px-12 lg:px-14">
          <h1 className="text-h1 text-label">{t.contact.title}</h1>
          <p className="mt-5 max-w-[50ch] text-lead text-pickle-soft">{t.contact.intro}</p>
          <div className="mt-6 text-label">
            <OpenStatus />
          </div>
        </Container>
      </Block>

      <Container className="grid gap-10 py-14 lg:grid-cols-12 lg:py-20">
        <div className="flex flex-col gap-8 lg:col-span-5">
          <ul className="divide-y-[1.5px] divide-ink/12 border-y-[1.5px] border-ink/12">
            <InfoRow icon={<MapPin />} label={t.contact.visit}>
              {settings ? (
                <>
                  <span className="block">{settings.addressLine}</span>
                  <span className="block">{[settings.postalCode, settings.city].filter(Boolean).join(' ')}</span>
                  {settings.mapUrl && (
                    <a href={settings.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1.5 font-semibold text-tomato-deep underline-offset-4 hover:underline">
                      <Navigation className="size-4" aria-hidden />
                      {t.home.location.directions}
                    </a>
                  )}
                </>
              ) : (
                '…'
              )}
            </InfoRow>
            <InfoRow icon={<Phone />} label={t.contact.call}>
              {settings?.phone ? (
                <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`} className="tnum text-lg font-semibold underline-offset-4 hover:underline">
                  {settings.phone}
                </a>
              ) : (
                '…'
              )}
            </InfoRow>
            <InfoRow icon={<Mail />} label={t.contact.write}>
              {settings?.email ? (
                <a href={`mailto:${settings.email}`} className="break-all text-lg font-semibold underline-offset-4 hover:underline">
                  {settings.email}
                </a>
              ) : (
                '…'
              )}
            </InfoRow>
          </ul>

          <div className="rounded-panel bg-surface-2 p-6">
            <h2 className="mb-3 font-stencil text-lg font-bold tracking-[0.12em] text-tomato-deep">{t.contact.hours}</h2>
            <HoursTable />
          </div>

          {socials.length > 0 && (
            <div>
              <h2 className="mb-3 font-stencil text-lg font-bold tracking-[0.12em] text-tomato-deep">{t.contact.follow}</h2>
              <ul className="flex gap-2">
                {socials.map(({ href, label, Icon }) => (
                  <li key={label}>
                    <a
                      href={href!}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="inline-flex size-12 items-center justify-center rounded-full bg-pickle text-label transition-colors hover:bg-tomato"
                    >
                      <Icon className="size-5" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <MapPlaceholder className="aspect-[4/3]" />
        </div>

        <div className="lg:col-span-7">
          <ContactForm />
        </div>
      </Container>
    </>
  )
}

function InfoRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex gap-4 py-5">
      <span aria-hidden className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-tomato text-white [&_svg]:size-5">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="font-stencil text-sm font-bold uppercase tracking-[0.14em] text-ink-faint">{label}</p>
        <div className="mt-1">{children}</div>
      </div>
    </li>
  )
}
