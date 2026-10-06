import { useEffect, useState } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { useI18n } from '@/i18n/useI18n'
import { isoDay, openState } from '@/utils/hours'

/** Human sentence for "are they open right now?", refreshed every minute. */
export function useOpenStatus() {
  const { settings } = useSettings()
  const { t, fmt } = useI18n()
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  if (!settings) return null
  const state = openState(settings.openingHours, now)
  let detail = ''
  if (state.open && state.until) detail = fmt(t.status.until, { time: state.until })
  else if (!state.open && state.until && state.nextDay === isoDay(now)) detail = fmt(t.status.opensToday, { time: state.until })
  else if (!state.open && state.until && state.nextDay)
    detail = fmt(t.status.opensOn, { day: t.days.long[state.nextDay - 1], time: state.until })

  return { open: state.open, label: state.open ? t.status.openNow : t.status.closedNow, detail }
}
