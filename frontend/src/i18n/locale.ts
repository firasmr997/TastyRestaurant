import { DEFAULT_LOCALE, type Locale } from './types'

/** French pages live under /fr (e.g. /fr/menu); English pages have no prefix. */
export function localeFromPath(pathname: string): Locale {
  return pathname === '/fr' || pathname.startsWith('/fr/') ? 'fr' : DEFAULT_LOCALE
}

/** Strips the locale prefix: "/fr/menu/x" becomes "/menu/x". */
export function stripLocale(pathname: string): string {
  if (pathname === '/fr') return '/'
  return pathname.startsWith('/fr/') ? pathname.slice(3) : pathname
}

/** Builds a path for a locale: ("/menu", "fr") becomes "/fr/menu". */
export function localizePath(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (locale === DEFAULT_LOCALE) return clean
  return clean === '/' ? '/fr' : `/fr${clean}`
}

/** Picks the French value when the site is in French and a translation exists; English otherwise. */
export function pick(locale: Locale, en: string, fr?: string | null): string
export function pick(locale: Locale, en: string | null, fr?: string | null): string | null
export function pick(locale: Locale, en: string | null, fr?: string | null): string | null {
  if (locale === 'fr' && fr && fr.trim()) return fr
  return en
}

export function pickList(locale: Locale, en: string[], fr?: string[] | null): string[] {
  return locale === 'fr' && fr && fr.length > 0 ? fr : en
}

/** Replaces {name} placeholders. */
export function fmt(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match))
}
