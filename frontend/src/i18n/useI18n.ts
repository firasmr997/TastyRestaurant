import { useCallback, useMemo } from 'react'
import { useLocation } from 'react-router'
import { en, type Dictionary } from './en'
import { fr } from './fr'
import { fmt, localeFromPath, localizePath, pick, pickList, stripLocale } from './locale'
import type { Locale } from './types'

const dictionaries: Record<Locale, Dictionary> = { en, fr }

/**
 * Current locale (from the URL), its dictionary and helpers:
 *   const { t, locale, path, pick } = useI18n()
 *   <Link to={path('/menu')}>{t.nav.menu}</Link>
 */
export function useI18n() {
  const { pathname } = useLocation()
  const locale = localeFromPath(pathname)
  const path = useCallback((to: string) => localizePath(to, locale), [locale])
  return useMemo(
    () => ({
      locale,
      t: dictionaries[locale],
      path,
      fmt,
      pick: (enValue: string, frValue?: string | null) => pick(locale, enValue, frValue),
      pickList: (enValue: string[], frValue?: string[] | null) => pickList(locale, enValue, frValue),
      /** Same page in the other language. */
      alternatePath: localizePath(stripLocale(pathname), locale === 'en' ? 'fr' : 'en'),
      basePath: stripLocale(pathname),
    }),
    [locale, path, pathname],
  )
}

export function dictionaryFor(locale: Locale): Dictionary {
  return dictionaries[locale]
}
