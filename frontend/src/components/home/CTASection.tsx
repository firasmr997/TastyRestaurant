import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router'
import { useReveal } from '@/animations/useReveal'
import { Container } from '@/components/public/Block'
import { buttonClasses } from '@/components/ui/Button'
import { useI18n } from '@/i18n/useI18n'
import { cn } from '@/utils/cn'

/** Closing call to action, in the inline crate lettering. */
export function CTASection() {
  const { t, path } = useI18n()
  const ref = useReveal<HTMLDivElement>()
  return (
    <section aria-labelledby="cta-title" className="py-20 lg:py-28">
      <Container ref={ref} className="flex flex-col items-center text-center">
        <h2 id="cta-title" data-reveal className="font-inline text-[clamp(3.5rem,1.6rem+7vw,6rem)] font-black leading-[0.9] text-pickle">
          {t.home.cta.title}
        </h2>
        <p data-reveal className="mt-5 max-w-[42ch] text-lead text-ink-muted">
          {t.home.cta.sub}
        </p>
        <div data-reveal className="mt-9 flex flex-wrap justify-center gap-3">
          <Link to={path('/menu')} className={cn(buttonClasses({ variant: 'primary', size: 'lg' }), 'font-display text-lg uppercase tracking-[0.06em]')}>
            {t.home.cta.menu}
            <ArrowRight className="size-5 transition-transform duration-300 group-hover/button:translate-x-1" aria-hidden />
          </Link>
          <Link to={path('/contact')} className={cn(buttonClasses({ variant: 'outline', size: 'lg' }), 'font-display text-lg uppercase tracking-[0.06em]')}>
            {t.home.cta.contact}
          </Link>
        </div>
      </Container>
    </section>
  )
}
