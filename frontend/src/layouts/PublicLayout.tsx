import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router'
import { pageVariants } from '@/animations/variants'
import { Footer } from '@/components/public/Footer'
import { Navbar } from '@/components/public/Navbar'
import { SplashScreen } from '@/components/public/SplashScreen'
import { IntroProvider } from '@/context/IntroContext'
import { useI18n } from '@/i18n/useI18n'
import { ScrollTrigger } from '@/animations/gsap'

/** Public website frame: splash (once per session), navbar, animated page outlet and footer. */
export function PublicLayout() {
  const location = useLocation()
  const outlet = useOutlet()
  const reduce = useReducedMotion()
  const { t, locale } = useI18n()

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  // Recalculate scroll-driven animations once the new page has mounted.
  useEffect(() => {
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 450)
    return () => window.clearTimeout(id)
  }, [location.pathname])

  return (
    <IntroProvider>
      <a
        href="#main"
        className="fixed left-3 top-3 z-[110] -translate-y-24 rounded-control bg-mustard px-4 py-2 font-semibold text-ink transition-transform focus:translate-y-0"
      >
        {t.a11y.skipToContent}
      </a>
      <SplashScreen />
      <Navbar />
      <AnimatePresence mode="wait" initial={false} onExitComplete={() => window.scrollTo({ top: 0, behavior: 'instant' })}>
        <motion.main
          id="main"
          key={location.pathname}
          variants={reduce ? undefined : pageVariants}
          initial="initial"
          animate="enter"
          exit="exit"
          className="pt-2 sm:pt-3 lg:pt-4"
        >
          {outlet}
        </motion.main>
      </AnimatePresence>
      <Footer />
    </IntroProvider>
  )
}
