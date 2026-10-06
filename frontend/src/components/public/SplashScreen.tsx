import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
import { LogoMark, Wordmark } from '@/components/brand/Logo'
import { useIntro } from '@/context/IntroContext'
import { useI18n } from '@/i18n/useI18n'

/** Minimum and maximum time the splash stays up (ms). It never waits longer than MAX. */
const MIN_MS = 1300
const MAX_MS = 2200

/**
 * First visit of the session: the pickle-green label appears, the sticker is slapped on, the wordmark
 * prints, a fill bar runs while fonts load, then the label lifts away to reveal the hero.
 */
export function SplashScreen() {
  const { showSplash, finishIntro } = useIntro()
  const { t } = useI18n()
  const reduce = useReducedMotion()

  useEffect(() => {
    if (!showSplash) return
    const started = performance.now()
    let done = false
    // Finishing the intro removes the splash (it wipes up) while the hero starts its entrance underneath.
    const finish = () => {
      if (done) return
      done = true
      finishIntro()
    }
    const fontsReady = document.fonts?.ready ?? Promise.resolve()
    fontsReady.then(() => {
      const elapsed = performance.now() - started
      window.setTimeout(finish, Math.max(0, (reduce ? 500 : MIN_MS) - elapsed))
    })
    const cap = window.setTimeout(finish, MAX_MS)
    return () => window.clearTimeout(cap)
  }, [showSplash, reduce, finishIntro])

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          key="splash"
          role="status"
          aria-live="polite"
          aria-label={t.splash.loading}
          data-tone="dark"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-pickle text-label"
          exit={reduce ? { opacity: 0, transition: { duration: 0.25 } } : { clipPath: 'inset(0 0 100% 0)', transition: { duration: 0.7, ease: [0.76, 0, 0.24, 1] } }}
        >
          <motion.div
            className="label-frame absolute inset-3 [--frame:var(--color-mustard)] sm:inset-5"
            initial={reduce ? false : { opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          />
          <div className="relative flex flex-col items-center gap-7 px-6">
            <motion.div
              initial={reduce ? false : { scale: 1.8, rotate: -28, opacity: 0 }}
              animate={{ scale: 1, rotate: -8, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 480, damping: 17, mass: 0.9, delay: 0.15 }}
            >
              <LogoMark className="size-24 sm:size-28" fill="var(--color-tomato)" letter="#fffdf8" ring="#fffdf8" />
            </motion.div>
            <motion.div
              initial={reduce ? false : { clipPath: 'inset(0 100% 0 0)' }}
              animate={{ clipPath: 'inset(0 0% 0 0)' }}
              transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            >
              <Wordmark variant="inline" className="h-20 w-auto text-label sm:h-28" />
            </motion.div>
            <div className="flex w-48 flex-col items-center gap-3">
              <span className="relative block h-1.5 w-full overflow-hidden rounded-full bg-label/15">
                <motion.span
                  className="absolute inset-y-0 left-0 rounded-full bg-mustard"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: reduce ? 0.4 : 1.2, ease: [0.65, 0, 0.35, 1], delay: 0.2 }}
                />
              </span>
              <span className="font-stencil text-sm font-bold uppercase tracking-[0.14em] text-pickle-soft">{t.splash.loading}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
