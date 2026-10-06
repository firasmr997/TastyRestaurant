import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/** Single registration point for GSAP plugins; import gsap from here, never from 'gsap' directly. */
gsap.registerPlugin(ScrollTrigger, useGSAP)

gsap.defaults({ ease: 'expo.out', duration: 0.9 })

export const EASE_OUT = 'expo.out'
export const EASE_IN_OUT = 'power3.inOut'

export { gsap, ScrollTrigger, useGSAP }

/** True when the visitor asked the OS for reduced motion. */
export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}
