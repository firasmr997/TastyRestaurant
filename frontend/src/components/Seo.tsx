import { useEffect } from 'react'
import { localizePath } from '@/i18n/locale'
import { useI18n } from '@/i18n/useI18n'
import { resolveImageUrl } from '@/utils/image'

interface SeoProps {
  title?: string
  description?: string
  /** Absolute or site-relative image for social cards. */
  image?: string | null
  type?: 'website' | 'article' | 'restaurant.menu'
  noIndex?: boolean
  /** Structured data (JSON-LD) for this page. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[]
}

function upsertMeta(attribute: 'name' | 'property', key: string, content: string) {
  let element = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`)
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, key)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

function upsertLink(rel: string, href: string, hreflang?: string) {
  const selector = hreflang ? `link[rel="${rel}"][hreflang="${hreflang}"]` : `link[rel="${rel}"]:not([hreflang])`
  let element = document.head.querySelector<HTMLLinkElement>(selector)
  if (!element) {
    element = document.createElement('link')
    element.rel = rel
    if (hreflang) element.hreflang = hreflang
    document.head.appendChild(element)
  }
  element.href = href
}

/**
 * Sets the document title, description, canonical + hreflang alternates, Open Graph and JSON-LD.
 * Tags are updated in place (no duplicates as the visitor navigates).
 */
export function Seo({ title, description, image, type = 'website', noIndex, jsonLd }: SeoProps) {
  const { t, locale, basePath } = useI18n()

  useEffect(() => {
    const origin = window.location.origin
    const fullTitle = title ? `${title} · ${t.meta.siteName}` : t.meta.defaultTitle
    const desc = description ?? t.meta.defaultDescription
    const url = origin + localizePath(basePath, locale)
    const imageUrl = image ? resolveImageUrl(image) : `${origin}/og-image.jpg`
    const absoluteImage = imageUrl?.startsWith('http') ? imageUrl : `${origin}${imageUrl}`

    document.title = fullTitle
    document.documentElement.lang = locale
    upsertMeta('name', 'description', desc)
    upsertMeta('name', 'robots', noIndex ? 'noindex, nofollow' : 'index, follow')
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', desc)
    upsertMeta('property', 'og:type', type)
    upsertMeta('property', 'og:url', url)
    upsertMeta('property', 'og:image', absoluteImage)
    upsertMeta('property', 'og:locale', locale === 'fr' ? 'fr_FR' : 'en_US')
    upsertMeta('name', 'twitter:title', fullTitle)
    upsertMeta('name', 'twitter:description', desc)
    upsertMeta('name', 'twitter:image', absoluteImage)
    upsertLink('canonical', url)
    upsertLink('alternate', origin + localizePath(basePath, 'en'), 'en')
    upsertLink('alternate', origin + localizePath(basePath, 'fr'), 'fr')
    upsertLink('alternate', origin + localizePath(basePath, 'en'), 'x-default')

    let script = document.head.querySelector<HTMLScriptElement>('script[data-seo="jsonld"]')
    if (jsonLd) {
      if (!script) {
        script = document.createElement('script')
        script.type = 'application/ld+json'
        script.dataset.seo = 'jsonld'
        document.head.appendChild(script)
      }
      script.textContent = JSON.stringify(jsonLd)
    } else {
      script?.remove()
    }
  }, [title, description, image, type, noIndex, jsonLd, t, locale, basePath])

  return null
}
