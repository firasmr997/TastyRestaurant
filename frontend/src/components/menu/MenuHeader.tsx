import { Search, X } from 'lucide-react'
import { useId } from 'react'
import { Block, Container } from '@/components/public/Block'
import { useI18n } from '@/i18n/useI18n'
import { LabelFrame } from '@/components/public/LabelFrame'

interface MenuHeaderProps {
  title: string
  intro: string
  query: string
  onQueryChange: (value: string) => void
  resultLabel?: string
}

/** Pickle-green header with the big inline title and the search field. */
export function MenuHeader({ title, intro, query, onQueryChange, resultLabel }: MenuHeaderProps) {
  const { t } = useI18n()
  const id = useId()
  return (
    <Block tone="pickle" className="overflow-hidden pt-[6.5rem] pb-10 lg:pt-[8rem] lg:pb-14">
      <LabelFrame />
      <Container className="relative grid gap-8 px-10 sm:px-12 lg:grid-cols-12 lg:items-end lg:px-14">
        <div className="lg:col-span-7">
          <h1 className="font-inline text-[clamp(4rem,2rem+9vw,9rem)] font-black leading-[0.85] text-label">{title}</h1>
          <p className="mt-5 max-w-[46ch] text-lead text-pickle-soft">{intro}</p>
        </div>
        <div className="lg:col-span-5">
          <label htmlFor={id} className="mb-2 block font-stencil text-sm font-bold uppercase tracking-[0.14em] text-mustard">
            {t.menu.searchLabel}
          </label>
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-ink-faint" aria-hidden />
            <input
              id={id}
              type="search"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder={t.menu.searchPlaceholder}
              autoComplete="off"
              className="h-14 w-full rounded-control border-[3px] border-label bg-label pl-12 pr-12 text-[1.05rem] text-ink placeholder:text-ink-faint focus:border-mustard focus:outline-none [&::-webkit-search-cancel-button]:hidden"
            />
            {query && (
              <button
                type="button"
                onClick={() => onQueryChange('')}
                aria-label={t.menu.clearSearch}
                className="absolute right-2.5 top-1/2 inline-flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:bg-ink/8 hover:text-ink"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
          <p aria-live="polite" className="mt-3 h-5 text-sm text-pickle-soft">
            {resultLabel}
          </p>
        </div>
      </Container>
    </Block>
  )
}
