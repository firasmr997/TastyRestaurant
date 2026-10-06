import { Mail, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { FacebookIcon, InstagramIcon, TikTokIcon } from '@/components/brand/SocialIcons'
import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/i18n/useI18n'
import { Block, Container } from './Block'
import { HoursTable } from './HoursTable'
import { useNavItems } from './Navbar'

export function Footer() {
  const { t, pick, fmt, path } = useI18n()
  const { settings } = useSettings()
  const items = useNavItems()
  const socials = [
    { href: settings?.instagramUrl, label: 'Instagram', Icon: InstagramIcon },
    { href: settings?.facebookUrl, label: 'Facebook', Icon: FacebookIcon },
    { href: settings?.tiktokUrl, label: 'TikTok', Icon: TikTokIcon },
  ].filter((s) => !!s.href)

  return (
    <footer className="pb-2 sm:pb-3 lg:pb-4">
      <Block tone="pickle" className="overflow-hidden pt-16 pb-8 sm:pt-20">
        <Container>
          <div className="label-frame grid gap-12 p-8 [--frame:var(--color-mustard)] sm:p-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div className="flex flex-col gap-5">
              <Link to={path('/')} aria-label={t.a11y.home} className="h-12 self-start">
                <Logo tone="dark" className="h-full" />
              </Link>
              {settings?.description && (
                <p className="max-w-[38ch] text-pickle-soft">{pick(settings.description, settings.descriptionFr)}</p>
              )}
              {socials.length > 0 && (
                <ul className="flex gap-2" aria-label={t.footer.follow}>
                  {socials.map(({ href, label, Icon }) => (
                    <li key={label}>
                      <a
                        href={href!}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="inline-flex size-11 items-center justify-center rounded-full border-[1.5px] border-label/40 transition-colors hover:border-mustard hover:bg-mustard hover:text-ink"
                      >
                        <Icon className="size-5" />
                      </a>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <nav aria-label={t.footer.explore}>
              <h2 className="mb-4 font-stencil text-lg font-bold tracking-[0.12em] text-mustard">{t.footer.explore}</h2>
              <ul className="flex flex-col gap-2">
                {items.map((item) => (
                  <li key={item.to}>
                    <Link to={item.to} className="font-display text-2xl font-bold uppercase transition-colors hover:text-mustard">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            <div>
              <h2 className="mb-4 font-stencil text-lg font-bold tracking-[0.12em] text-mustard">{t.footer.visit}</h2>
              <ul className="flex flex-col gap-3 text-pickle-soft">
                {settings?.addressLine && (
                  <li className="flex gap-2.5">
                    <MapPin className="mt-1 size-4 shrink-0 text-mustard" aria-hidden />
                    <span>
                      {settings.addressLine}
                      <br />
                      {[settings.postalCode, settings.city].filter(Boolean).join(' ')}
                    </span>
                  </li>
                )}
                {settings?.phone && (
                  <li className="flex gap-2.5">
                    <Phone className="mt-1 size-4 shrink-0 text-mustard" aria-hidden />
                    <a href={`tel:${settings.phone.replace(/[^+\d]/g, '')}`} className="hover:text-label">
                      {settings.phone}
                    </a>
                  </li>
                )}
                {settings?.email && (
                  <li className="flex gap-2.5">
                    <Mail className="mt-1 size-4 shrink-0 text-mustard" aria-hidden />
                    <a href={`mailto:${settings.email}`} className="break-all hover:text-label">
                      {settings.email}
                    </a>
                  </li>
                )}
              </ul>
            </div>

            <div>
              <h2 className="mb-4 font-stencil text-lg font-bold tracking-[0.12em] text-mustard">{t.footer.hours}</h2>
              <HoursTable tone="dark" />
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 text-sm text-pickle-soft sm:flex-row sm:items-center sm:justify-between">
            <p>{fmt(t.footer.rights, { year: new Date().getFullYear() })}</p>
            <p className="flex flex-wrap items-center gap-x-5 gap-y-2">
              <span>{t.footer.madeBy}</span>
              <span>{t.footer.credits}</span>
              <Link to="/admin" className="underline-offset-4 hover:text-label hover:underline">
                {t.footer.staff}
              </Link>
            </p>
          </div>
        </Container>
      </Block>
    </footer>
  )
}
