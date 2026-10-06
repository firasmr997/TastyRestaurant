import { API_BASE_URL } from '@/api/client'

/**
 * Image URLs come from the CMS: absolute (placeholder stock photos, a CDN) or relative to the API
 * (`/uploads/...`). Relative ones resolve against the API origin so the site works whether the API
 * is proxied on the same origin or hosted elsewhere.
 */
const apiOrigin = (() => {
  try {
    return /^https?:\/\//.test(API_BASE_URL) ? new URL(API_BASE_URL).origin : ''
  } catch {
    return ''
  }
})()

export function resolveImageUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined
  if (/^(https?:)?\/\//.test(url) || url.startsWith('data:') || url.startsWith('blob:')) return url
  return `${apiOrigin}${url.startsWith('/') ? url : `/${url}`}`
}

const isUnsplash = (url: string) => /^https:\/\/images\.unsplash\.com\//.test(url)

/** Same image at another width (only providers that support it; others are returned unchanged). */
export function sizedImage(url: string | null | undefined, width: number, quality = 75): string | undefined {
  const resolved = resolveImageUrl(url)
  if (!resolved || !isUnsplash(resolved)) return resolved
  const u = new URL(resolved)
  u.searchParams.set('w', String(width))
  u.searchParams.set('q', String(quality))
  u.searchParams.set('auto', 'format')
  u.searchParams.set('fit', 'crop')
  return u.toString()
}

/** Responsive srcset for providers that can resize on the fly; undefined otherwise. */
export function imageSrcSet(url: string | null | undefined, widths = [480, 768, 1080, 1440, 1920]): string | undefined {
  const resolved = resolveImageUrl(url)
  if (!resolved || !isUnsplash(resolved)) return undefined
  return widths.map((w) => `${sizedImage(resolved, w)} ${w}w`).join(', ')
}
