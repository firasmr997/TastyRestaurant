import { useReveal } from '@/animations/useReveal'
import { Block, Container } from '@/components/public/Block'
import { useI18n } from '@/i18n/useI18n'
import { cn } from '@/utils/cn'

const TONES = ['bg-pickle text-label', 'bg-tomato text-white', 'bg-ink text-label', 'bg-label text-ink']
const TILTS = ['-rotate-6', 'rotate-3', '-rotate-2', 'rotate-6']
const OFFSETS = ['lg:mt-0', 'lg:mt-16', 'lg:mt-4', 'lg:mt-20']

/** The four promises, stuck onto a mustard field as round die-cut stickers at different angles. */
export function WhyTasty() {
  const { t } = useI18n()
  const ref = useReveal<HTMLDivElement>({ stagger: 0.12 })

  return (
    <Block tone="mustard" aria-labelledby="why-title" className="overflow-hidden py-16 sm:py-20 lg:py-24">
      <Container ref={ref}>
        <h2 id="why-title" data-reveal className="text-h2 font-inline font-black tracking-[0.02em] text-pickle-deep">
          {t.home.why.title}
        </h2>
        <ul className="mt-12 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {t.home.why.items.map((item, i) => (
            <li key={item.title} data-reveal className={cn('flex flex-col items-start', OFFSETS[i])}>
              <span
                className={cn(
                  'flex size-40 items-center justify-center rounded-full border-[4px] border-label p-4 text-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:rotate-0 hover:scale-105 sm:size-44',
                  TONES[i],
                  TILTS[i],
                )}
              >
                <span className="font-display text-[1.65rem] font-extrabold uppercase leading-[0.92] sm:text-[1.8rem]">{item.title}</span>
              </span>
              <p className="mt-5 max-w-[30ch] text-ink/85">{item.text}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Block>
  )
}
