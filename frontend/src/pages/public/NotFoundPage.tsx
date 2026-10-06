import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { LogoMark } from '@/components/brand/Logo'
import { Block, Container } from '@/components/public/Block'
import { Seo } from '@/components/Seo'
import { buttonClasses } from '@/components/ui/Button'
import { useI18n } from '@/i18n/useI18n'
import { cn } from '@/utils/cn'
import { LabelFrame } from '@/components/public/LabelFrame'

export default function NotFoundPage() {
  const { t, path } = useI18n()
  return (
    <>
      <Seo title={t.meta.notFound.title} description={t.meta.notFound.description} noIndex />
      <Block tone="pickle" className="flex min-h-[80svh] items-center overflow-hidden pt-[6rem] pb-16">
        <LabelFrame />
        <Container className="relative flex flex-col items-start gap-6 px-10 sm:px-12 lg:px-14">
          <LogoMark className="size-24 -rotate-12" fill="var(--color-mustard)" letter="var(--color-ink)" ring="#fffdf8" />
          <p className="font-inline text-[clamp(5rem,3rem+10vw,11rem)] font-black leading-[0.8] text-label">404</p>
          <h1 className="text-h2 text-label">{t.notFound.title}</h1>
          <p className="max-w-[40ch] text-lead text-pickle-soft">{t.notFound.text}</p>
          <Link to={path('/')} className={cn(buttonClasses({ variant: 'primary', size: 'lg' }), 'font-display text-lg uppercase tracking-[0.06em]')}>
            {t.notFound.cta}
            <ArrowRight className="size-5 transition-transform duration-300 group-hover/button:translate-x-1" aria-hidden />
          </Link>
        </Container>
      </Block>
    </>
  )
}
