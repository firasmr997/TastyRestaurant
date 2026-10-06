import { useRef } from 'react'
import { gsap, prefersReducedMotion, useGSAP } from './gsap'

interface RevealOptions {
  /** Selector for the children to reveal, inside the returned ref. */
  selector?: string
  y?: number
  stagger?: number
  start?: string
}

/**
 * Scroll reveal for a section: children marked `[data-reveal]` rise in as the section enters.
 * Content is visible by default (no flash if JS or motion is off); reduced motion skips the effect.
 */
export function useReveal<T extends HTMLElement = HTMLElement>({
  selector = '[data-reveal]',
  y = 36,
  stagger = 0.08,
  start = 'top 82%',
}: RevealOptions = {}) {
  const ref = useRef<T>(null)
  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return
      const targets = ref.current.querySelectorAll<HTMLElement>(selector)
      if (targets.length === 0) return
      gsap.from(targets, {
        y,
        opacity: 0,
        duration: 0.9,
        stagger,
        ease: 'expo.out',
        scrollTrigger: { trigger: ref.current, start, once: true },
      })
    },
    { scope: ref },
  )
  return ref
}

/**
 * Parallax for rear-plane imagery only (the reading plane never moves): the element drifts
 * against the scroll inside its frame.
 */
export function useParallax<T extends HTMLElement = HTMLElement>(amount = 12) {
  const ref = useRef<T>(null)
  useGSAP(
    () => {
      if (!ref.current || prefersReducedMotion()) return
      gsap.fromTo(
        ref.current,
        { yPercent: -amount / 2, scale: 1.08 },
        {
          yPercent: amount / 2,
          scale: 1.08,
          ease: 'none',
          scrollTrigger: { trigger: ref.current.parentElement ?? ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
        },
      )
    },
    { scope: ref },
  )
  return ref
}
