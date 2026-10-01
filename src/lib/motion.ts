import type { TargetAndTransition, Transition, Variants } from 'framer-motion'

export const SPRING: Transition = { type: 'spring', stiffness: 260, damping: 26 }
export const SHORT_FADE: Transition = { duration: 0.2, ease: 'easeOut' }

export type MotionSet = {
  header: Variants
  headerBg: Variants
  headerRow: Variants
  logo: Variants
  cta: Variants
  ctaGlow: Variants
  hero: Variants
  fadeUpBlur: Variants
  glow: Variants
  stats: Variants
  fadeUp: Variants
  grid: Variants
  card: Variants
  cardExit: TargetAndTransition
  cardHover?: TargetAndTransition
  pop: Variants
}

export const MOTION: Record<'full' | 'reduced', MotionSet> = {
  full: {
    header: { hidden: { opacity: 0, y: -20 }, visible: { opacity: 1, y: 0 } },
    headerBg: { top: { opacity: 0, scaleY: 1 }, compact: { opacity: 1, scaleY: 0.875 } },
    headerRow: { top: { y: 0 }, compact: { y: -4 } },
    logo: {
      hidden: { opacity: 0, rotate: -12, scale: 0.8 },
      visible: {
        opacity: 1,
        rotate: 0,
        scale: 1,
        transition: { type: 'spring', stiffness: 320, damping: 14 },
      },
      hover: { rotate: 8 },
    },
    cta: { rest: { scale: 1 }, hover: { scale: 1.04 }, tap: { scale: 0.96 } },
    ctaGlow: { rest: { opacity: 0 }, hover: { opacity: 0.55 }, tap: { opacity: 0.55 } },
    hero: { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } },
    fadeUpBlur: {
      hidden: { opacity: 0, y: 24, filter: 'blur(6px)' },
      visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
    },
    glow: {
      rest: { opacity: 0.35, scale: 1 },
      breathe: {
        opacity: [0.35, 0.45, 0.35],
        scale: [1, 1.05, 1],
        transition: { duration: 8, ease: 'easeInOut', repeat: Infinity },
      },
    },
    stats: { hidden: {}, visible: { transition: { staggerChildren: 0.08 } } },
    fadeUp: { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } },
    grid: { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } },
    card: { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } },
    cardExit: { opacity: 0, scale: 0.9, transition: { duration: 0.2, ease: 'easeIn' } },
    cardHover: { y: -6 },
    pop: {
      hidden: { scale: 0, rotate: -45 },
      visible: {
        scale: [0, 1.2, 1],
        rotate: [-45, 12, 0],
        transition: { duration: 0.5, delay: 0.25, ease: 'easeOut' },
      },
    },
  },
  reduced: {
    header: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: SHORT_FADE } },
    headerBg: { top: { opacity: 0 }, compact: { opacity: 1, transition: SHORT_FADE } },
    headerRow: { top: {}, compact: {} },
    logo: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: SHORT_FADE } },
    cta: { rest: {}, hover: {}, tap: {} },
    ctaGlow: { rest: { opacity: 0 }, hover: { opacity: 0.55, transition: SHORT_FADE } },
    hero: { hidden: {}, visible: {} },
    fadeUpBlur: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: SHORT_FADE } },
    glow: { rest: { opacity: 0.35 }, breathe: { opacity: 0.35 } },
    stats: { hidden: {}, visible: {} },
    fadeUp: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: SHORT_FADE } },
    grid: { hidden: {}, visible: {} },
    card: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: SHORT_FADE } },
    cardExit: { opacity: 0, transition: SHORT_FADE },
    pop: { hidden: { opacity: 0 }, visible: { opacity: 1, transition: SHORT_FADE } },
  },
}
