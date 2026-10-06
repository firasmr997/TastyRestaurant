import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/i18n/useI18n'

/** Optional one-line announcement from admin -> Settings, shown in the footer-of-hero ticker. */
export function useAnnouncement(): string | null {
  const { settings } = useSettings()
  const { pick } = useI18n()
  if (!settings?.announcement) return null
  return pick(settings.announcement, settings.announcementFr)
}

/** Slow ticker of the announcement, set in stencil caps like a market banner. Static under reduced motion. */
export function AnnouncementTicker({ className }: { className?: string }) {
  const text = useAnnouncement()
  if (!text) return null
  const items = Array.from({ length: 6 }, (_, i) => i)
  return (
    <div className={className} aria-label={text}>
      <div className="flex overflow-hidden" aria-hidden>
        <div className="flex shrink-0 animate-[ticker_38s_linear_infinite] items-center motion-reduce:animate-none">
          {items.map((i) => (
            <span key={i} className="flex items-center gap-6 pr-6 font-stencil text-lg font-bold uppercase tracking-[0.12em]">
              {text}
              <span className="inline-block size-2 rotate-45 bg-current" />
            </span>
          ))}
        </div>
        <div className="flex shrink-0 animate-[ticker_38s_linear_infinite] items-center motion-reduce:hidden">
          {items.map((i) => (
            <span key={i} className="flex items-center gap-6 pr-6 font-stencil text-lg font-bold uppercase tracking-[0.12em]">
              {text}
              <span className="inline-block size-2 rotate-45 bg-current" />
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
