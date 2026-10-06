import type { OpeningHours } from '@/types/models'

/** ISO weekday (1 = Monday ... 7 = Sunday) for a Date in local time. */
export function isoDay(date: Date): number {
  const day = date.getDay()
  return day === 0 ? 7 : day
}

function minutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export interface OpenState {
  open: boolean
  /** "22:30" when open (closing time) or the next opening time when closed. */
  until: string | null
  /** ISO day of the next opening when closed. */
  nextDay: number | null
}

/**
 * Whether the restaurant is open at `now`. A closing time earlier than the opening time means the
 * service runs past midnight (e.g. 11:30 - 00:30), so yesterday's late hours are checked too.
 */
export function openState(hours: OpeningHours[], now = new Date()): OpenState {
  const byDay = new Map(hours.map((h) => [h.dayOfWeek, h]))
  const today = isoDay(now)
  const current = now.getHours() * 60 + now.getMinutes()

  const yesterday = byDay.get(today === 1 ? 7 : today - 1)
  if (yesterday && !yesterday.closed && yesterday.opensAt && yesterday.closesAt) {
    const opens = minutes(yesterday.opensAt)
    const closes = minutes(yesterday.closesAt)
    if (closes <= opens && current < closes) return { open: true, until: yesterday.closesAt, nextDay: null }
  }

  const todays = byDay.get(today)
  if (todays && !todays.closed && todays.opensAt && todays.closesAt) {
    const opens = minutes(todays.opensAt)
    const closes = minutes(todays.closesAt)
    const overnight = closes <= opens
    if (current >= opens && (overnight || current < closes)) return { open: true, until: todays.closesAt, nextDay: null }
    if (current < opens) return { open: false, until: todays.opensAt, nextDay: today }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const day = ((today - 1 + offset) % 7) + 1
    const candidate = byDay.get(day)
    if (candidate && !candidate.closed && candidate.opensAt) {
      return { open: false, until: candidate.opensAt, nextDay: day }
    }
  }
  return { open: false, until: null, nextDay: null }
}

/** Groups consecutive days with identical hours: [{ from: 2, to: 4, hours }]. */
export function groupHours(hours: OpeningHours[]) {
  const sorted = [...hours].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  const groups: { from: number; to: number; entry: OpeningHours }[] = []
  for (const entry of sorted) {
    const last = groups[groups.length - 1]
    const same =
      last &&
      last.to === entry.dayOfWeek - 1 &&
      last.entry.closed === entry.closed &&
      (entry.closed || (last.entry.opensAt === entry.opensAt && last.entry.closesAt === entry.closesAt))
    if (same) last.to = entry.dayOfWeek
    else groups.push({ from: entry.dayOfWeek, to: entry.dayOfWeek, entry })
  }
  return groups
}
