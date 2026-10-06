import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import { clearQueryCache } from '@/hooks/useQuery'
import { tokenStorage } from '@/utils/tokenStorage'

// jsdom lacks a few browser APIs the UI relies on.
if (!window.matchMedia) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: query.includes('reduce'), // treat tests as reduced-motion: no GSAP/3D work
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }))
}

class MockIntersectionObserver {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  takeRecords = vi.fn(() => [])
}
window.IntersectionObserver = window.IntersectionObserver ?? (MockIntersectionObserver as unknown as typeof IntersectionObserver)
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo

afterEach(() => {
  cleanup()
  clearQueryCache()
  tokenStorage.clear()
  window.localStorage.clear()
  window.sessionStorage.clear()
})
