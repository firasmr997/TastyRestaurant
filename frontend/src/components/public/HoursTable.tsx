import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/i18n/useI18n'
import { cn } from '@/utils/cn'
import { groupHours, isoDay } from '@/utils/hours'

/** Opening hours as ruled rows; today's row is marked. Consecutive days with the same hours are grouped. */
export function HoursTable({ tone = 'light', className }: { tone?: 'light' | 'dark'; className?: string }) {
  const { settings } = useSettings()
  const { t } = useI18n()
  if (!settings) {
    return (
      <div className={cn('flex flex-col gap-2', className)} aria-hidden>
        {Array.from({ length: 4 }, (_, i) => (
          <span key={i} className="skeleton block h-5 rounded" />
        ))}
      </div>
    )
  }
  const today = isoDay(new Date())
  const groups = groupHours(settings.openingHours)
  const dayLabel = (from: number, to: number) =>
    from === to ? t.days.short[from - 1] : `${t.days.short[from - 1]}–${t.days.short[to - 1]}`

  return (
    <table className={cn('w-full text-[0.95rem]', className)}>
      <caption className="sr-only">{t.home.location.hours}</caption>
      <tbody>
        {groups.map(({ from, to, entry }) => {
          const isToday = today >= from && today <= to
          return (
            <tr
              key={from}
              className={cn(
                'border-b-[1.5px] last:border-b-0',
                tone === 'dark' ? 'border-label/20' : 'border-ink/12',
                isToday && (tone === 'dark' ? 'text-mustard' : 'text-tomato-deep'),
              )}
            >
              <th scope="row" className="py-2 pr-4 text-left font-semibold">
                {dayLabel(from, to)}
                {isToday && <span className="sr-only"> ({t.status.today})</span>}
              </th>
              <td className="tnum py-2 text-right">
                {entry.closed ? t.status.closed : `${entry.opensAt} – ${entry.closesAt}`}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
