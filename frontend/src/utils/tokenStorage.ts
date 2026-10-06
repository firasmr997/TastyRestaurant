import type { AuthSession } from '@/types/models'

const KEY = 'tasty.session'

/**
 * Persists the staff session. Storage can be unavailable (private mode, blocked site data), so every
 * access is guarded and the app keeps working with an in-memory session for the current tab.
 */
let memory: AuthSession | null = null

export const tokenStorage = {
  get(): AuthSession | null {
    let session = memory
    try {
      const raw = window.localStorage.getItem(KEY)
      if (raw) session = JSON.parse(raw) as AuthSession
    } catch {
      /* storage unavailable: fall back to memory */
    }
    if (session && new Date(session.expiresAt).getTime() <= Date.now()) {
      this.clear()
      return null
    }
    return session
  },
  set(session: AuthSession) {
    memory = session
    try {
      window.localStorage.setItem(KEY, JSON.stringify(session))
    } catch {
      /* memory only */
    }
  },
  clear() {
    memory = null
    try {
      window.localStorage.removeItem(KEY)
    } catch {
      /* ignore */
    }
  },
}
