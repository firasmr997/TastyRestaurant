import type { Transition, Variants } from 'framer-motion'

/** Exponential ease-out: quick to arrive, gentle to settle. */
export const easeOutExpo = [0.16, 1, 0.3, 1] as const

export const spring: Transition = { type: 'spring', stiffness: 380, damping: 30 }

/**
 * Page transitions: quick so navigation never feels slow. Opacity only, so the page wrapper never carries a
 * transform (a transformed ancestor would break ScrollTrigger pinning).
 */
export const pageVariants: Variants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.35, ease: easeOutExpo } },
  exit: { opacity: 0, transition: { duration: 0.16, ease: 'easeIn' } },
}

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easeOutExpo } },
}

export const stagger = (delayChildren = 0, staggerChildren = 0.06): Variants => ({
  hidden: {},
  show: { transition: { delayChildren, staggerChildren } },
})

/** A sticker being slapped onto a surface: oversized and tilted, then settling with a little overshoot. */
export const stickerSlap: Variants = {
  hidden: { opacity: 0, scale: 1.7, rotate: -24 },
  show: { opacity: 1, scale: 1, rotate: -8, transition: { type: 'spring', stiffness: 520, damping: 18, mass: 0.8 } },
}
