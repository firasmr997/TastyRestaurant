import { RotateCcw } from 'lucide-react'
import { isRouteErrorResponse, useRouteError } from 'react-router'
import { LogoMark } from '@/components/brand/Logo'

/** Last-resort error screen (a page chunk failed to load, a render crashed). */
export function RouteError() {
  const error = useRouteError()
  const chunkFailed = error instanceof Error && /dynamically imported module|Loading chunk/i.test(error.message)
  const title = isRouteErrorResponse(error) && error.status === 404 ? 'Not on the menu' : 'Something went wrong'
  const text = chunkFailed
    ? 'A new version of the site is available. Reload to continue.'
    : 'Please reload the page. If it keeps happening, try again in a few minutes.'

  return (
    <div data-tone="dark" className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-pickle p-8 text-center text-label">
      <LogoMark className="size-20" fill="var(--color-mustard)" letter="var(--color-ink)" />
      <h1 className="text-h2">{title}</h1>
      <p className="max-w-md text-pickle-soft">{text}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="inline-flex h-12 items-center gap-2 rounded-control bg-tomato px-6 font-display text-lg font-extrabold uppercase tracking-[0.06em] text-white hover:bg-tomato-deep"
      >
        <RotateCcw className="size-4" aria-hidden /> Reload
      </button>
    </div>
  )
}
