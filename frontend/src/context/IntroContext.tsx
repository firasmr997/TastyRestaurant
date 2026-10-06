import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'tasty.intro-seen'

function alreadySeen(): boolean {
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

interface IntroContextValue {
  /** True while the splash screen covers the page. */
  showSplash: boolean
  /** True once the hero may play its entrance. */
  introDone: boolean
  finishIntro: () => void
}

const IntroContext = createContext<IntroContextValue>({ showSplash: false, introDone: true, finishIntro: () => undefined })

/** The splash plays once per browser session; returning visitors land straight on the page. */
export function IntroProvider({ children }: { children: ReactNode }) {
  const [seen] = useState(alreadySeen)
  const [introDone, setIntroDone] = useState(seen)

  const finishIntro = useCallback(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      /* storage unavailable: the splash will simply show again next session */
    }
    setIntroDone(true)
  }, [])

  return (
    <IntroContext.Provider value={{ showSplash: !introDone, introDone, finishIntro }}>{children}</IntroContext.Provider>
  )
}

export function useIntro() {
  return useContext(IntroContext)
}
