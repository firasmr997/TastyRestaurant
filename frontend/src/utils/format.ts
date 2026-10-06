import type { Locale } from '@/i18n/types'

const INTL_LOCALE: Record<Locale, string> = { en: 'en-US', fr: 'fr-FR' }

export function intlLocale(locale: Locale): string {
  return INTL_LOCALE[locale]
}

/** "$14.50" in English, "14,50 $US" in French. Currency comes from restaurant settings. */
export function formatPrice(amount: number, currency = 'USD', locale: Locale = 'en'): string {
  try {
    return new Intl.NumberFormat(intlLocale(locale), {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${currency}`
  }
}

/** Price without the currency sign, for tabular price columns ("14.50"). */
export function formatAmount(amount: number, locale: Locale = 'en'): string {
  return new Intl.NumberFormat(intlLocale(locale), { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)
}

export function currencySymbol(currency = 'USD', locale: Locale = 'en'): string {
  try {
    const part = new Intl.NumberFormat(intlLocale(locale), { style: 'currency', currency, currencyDisplay: 'narrowSymbol' })
      .formatToParts(0)
      .find((p) => p.type === 'currency')
    return part?.value ?? currency
  } catch {
    return currency
  }
}

export function formatDate(iso: string, locale: Locale = 'en', options?: Intl.DateTimeFormatOptions): string {
  return new Intl.DateTimeFormat(intlLocale(locale), options ?? { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(iso),
  )
}

export function formatDateTime(iso: string, locale: Locale = 'en'): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

/** "3 hours ago", "il y a 2 jours". */
export function formatRelative(iso: string, locale: Locale = 'en', now = Date.now()): string {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000)
  const rtf = new Intl.RelativeTimeFormat(intlLocale(locale), { numeric: 'auto' })
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['week', 604_800],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ]
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return rtf.format(Math.round(seconds / size), unit)
  }
  return rtf.format(seconds, 'second')
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
