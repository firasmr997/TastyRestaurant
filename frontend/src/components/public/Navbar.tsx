import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { Logo } from '@/components/brand/Logo'
import { buttonClasses } from '@/components/ui/Button'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { stripLocale } from '@/i18n/locale'
import { useI18n } from '@/i18n/useI18n'
import { cn } from '@/utils/cn'
import { LanguageSwitch } from './LanguageSwitch'
import { OpenStatus } from './OpenStatus'

export function useNavItems() {
  const { t, path } = useI18n()
  return [
    { to: path('/'), label: t.nav.home, end: true },
    { to: path('/menu'), label: t.nav.menu, end: false },
    { to: path('/gallery'), label: t.nav.gallery, end: false },
    { to: path('/about'), label: t.nav.about, end: true },
    { to: path('/contact'), label: t.nav.contact, end: true },
  ]
}

/**
 * Sits on the dark page header at the top of every public page, then turns into a solid label-white
 * strip once the visitor scrolls. Navigation is a row of ruled cells; the current page floods tomato.
 */
export function Navbar() {
  const { t, path } = useI18n()
  const items = useNavItems()
  const { pathname } = useLocation()
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => setScrolled(y > 24))
  useEffect(() => setOpen(false), [pathname])

  const solid = scrolled && !open
  // At the top of the home page the hero's own wordmark is on screen, so the bar shows the mark alone.
  const markOnly = stripLocale(pathname) === '/' && !scrolled && !open
  return (
    <>
      <header
        data-tone={solid ? undefined : 'dark'}
        className={cn(
          'fixed inset-x-0 top-0 z-50 transition-[background-color,color,box-shadow] duration-300',
          solid ? 'bg-label text-ink shadow-[0_1px_0_var(--color-line),0_10px_30px_-20px_rgb(12_20_16/0.35)]' : 'bg-transparent text-label',
        )}
      >
        <div className="mx-auto flex h-[4.5rem] w-full max-w-[96rem] items-center gap-4 px-4 sm:px-6 lg:h-[5rem] lg:px-8">
          <Link to={path('/')} aria-label={t.a11y.home} className="flex h-10 items-center rounded-control lg:h-11">
            <Logo tone={solid ? 'light' : 'dark'} className="h-full" hideWordmark={markOnly} />
          </Link>

          <nav aria-label={t.a11y.mainNav} className="ml-auto hidden lg:block">
            <ul className={cn('flex border-[1.5px]', solid ? 'border-ink/80' : 'border-label/60')}>
              {items.map((item, index) => (
                <li key={item.to} className={cn(index > 0 && (solid ? 'border-l-[1.5px] border-ink/80' : 'border-l-[1.5px] border-label/60'))}>
                  <NavLink to={item.to} end={item.end} className="cell hover:bg-tomato/15">
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-3 lg:ml-4">
            <LanguageSwitch tone={solid ? 'light' : 'dark'} className="hidden sm:flex" />
            <span className="hidden md:block">
              <Link to={path('/menu')} className={cn(buttonClasses({ variant: 'primary', size: 'md' }), 'font-display text-base uppercase tracking-[0.06em]')}>
                {t.nav.cta}
                <ArrowRight className="size-4 transition-transform duration-300 group-hover/button:translate-x-1" aria-hidden />
              </Link>
            </span>
            <MenuToggle open={open} onToggle={() => setOpen((v) => !v)} label={open ? t.a11y.closeMenu : t.a11y.openMenu} />
          </div>
        </div>
      </header>
      <MobileMenu open={open} onClose={() => setOpen(false)} />
    </>
  )
}

function MenuToggle({ open, onToggle, label }: { open: boolean; onToggle: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={label}
      aria-expanded={open}
      aria-controls="mobile-menu"
      className="relative z-[60] inline-flex size-12 items-center justify-center rounded-full bg-tomato text-white lg:hidden"
    >
      <span className="relative block h-3.5 w-5" aria-hidden>
        <motion.span
          className="absolute left-0 top-0 block h-[2.5px] w-5 rounded-full bg-current"
          animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
        <motion.span
          className="absolute bottom-0 left-0 block h-[2.5px] w-5 rounded-full bg-current"
          animate={open ? { rotate: -45, y: -5.5 } : { rotate: 0, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </span>
    </button>
  )
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t, path } = useI18n()
  const items = useNavItems()
  const reduce = useReducedMotion()
  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          id="mobile-menu"
          data-tone="dark"
          className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-pickle-deep px-5 pb-8 pt-24 text-label lg:hidden"
          initial={reduce ? { opacity: 0 } : { clipPath: 'circle(0% at calc(100% - 2.5rem) 2.25rem)' }}
          animate={reduce ? { opacity: 1 } : { clipPath: 'circle(150% at calc(100% - 2.5rem) 2.25rem)' }}
          exit={reduce ? { opacity: 0 } : { clipPath: 'circle(0% at calc(100% - 2.5rem) 2.25rem)' }}
          transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
        >
          <nav aria-label={t.a11y.mainNav}>
            <ul className="border-y-[1.5px] border-label/30">
              {items.map((item, index) => (
                <motion.li
                  key={item.to}
                  className="border-b-[1.5px] border-label/30 last:border-b-0"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0, transition: { delay: 0.15 + index * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] } }}
                >
                  <NavLink
                    to={item.to}
                    end={item.end}
                    onClick={onClose}
                    className="group flex items-center justify-between py-3 font-display text-[clamp(2.5rem,11vw,3.75rem)] font-extrabold uppercase leading-none tracking-[0.01em] aria-[current=page]:text-mustard"
                  >
                    {item.label}
                    <ArrowRight className="size-8 opacity-40 transition-transform group-hover:translate-x-1 group-aria-[current=page]:opacity-100" aria-hidden />
                  </NavLink>
                </motion.li>
              ))}
            </ul>
          </nav>
          <div className="mt-8 flex flex-col gap-5">
            <OpenStatus />
            <LanguageSwitch tone="dark" className="self-start border-[1.5px] border-label/40" />
            <Link to={path('/menu')} onClick={onClose} className={cn(buttonClasses({ variant: 'primary', size: 'lg' }), 'font-display text-lg uppercase tracking-[0.06em]')}>
              {t.nav.cta}
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
