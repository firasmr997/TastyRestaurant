import { useId, useState, type ReactNode } from 'react'
import { cn } from '@/utils/cn'

/**
 * English / French versions of the same fields. French is optional: the public site falls back to
 * English when a French field is empty, and the tab shows whether a translation exists.
 */
export function LangTabs({ en, fr, frFilled }: { en: ReactNode; fr: ReactNode; frFilled: boolean }) {
  const [tab, setTab] = useState<'en' | 'fr'>('en')
  const id = useId()
  const tabs = [
    { key: 'en' as const, label: 'English', hint: null },
    { key: 'fr' as const, label: 'Français', hint: frFilled ? null : 'not translated' },
  ]
  return (
    <div>
      <div role="tablist" aria-label="Language" className="mb-4 inline-flex rounded-control border border-line bg-surface-2 p-1">
        {tabs.map(({ key, label, hint }) => (
          <button
            key={key}
            id={`${id}-${key}-tab`}
            type="button"
            role="tab"
            aria-selected={tab === key}
            aria-controls={`${id}-${key}-panel`}
            onClick={() => setTab(key)}
            className={cn(
              'flex items-center gap-2 rounded-[0.45rem] px-3.5 py-1.5 text-sm font-semibold transition-colors',
              tab === key ? 'bg-surface text-ink shadow-[0_1px_3px_rgb(12_20_16/0.12)]' : 'text-ink-muted hover:text-ink',
            )}
          >
            {label}
            {hint && <span className="text-xs font-medium text-warning-strong">· {hint}</span>}
          </button>
        ))}
      </div>
      <div id={`${id}-en-panel`} role="tabpanel" aria-labelledby={`${id}-en-tab`} hidden={tab !== 'en'} className="flex flex-col gap-5">
        {en}
      </div>
      <div id={`${id}-fr-panel`} role="tabpanel" aria-labelledby={`${id}-fr-tab`} hidden={tab !== 'fr'} className="flex flex-col gap-5">
        {fr}
      </div>
    </div>
  )
}
