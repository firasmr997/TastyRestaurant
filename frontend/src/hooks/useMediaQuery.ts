import { useCallback, useSyncExternalStore } from 'react'

export function useMediaQuery(query: string, serverFallback = false): boolean {
  const subscribe = useCallback(
    (callback: () => void) => {
      if (typeof window.matchMedia !== 'function') return () => undefined
      const list = window.matchMedia(query)
      list.addEventListener('change', callback)
      return () => list.removeEventListener('change', callback)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => (typeof window.matchMedia === 'function' ? window.matchMedia(query).matches : serverFallback),
    () => serverFallback,
  )
}

export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)')
}

/** Small screens or coarse pointers: skip heavy effects (3D, magnetic hovers). */
export function useIsTouchSmallScreen(): boolean {
  return useMediaQuery('(max-width: 767px), (pointer: coarse)')
}
