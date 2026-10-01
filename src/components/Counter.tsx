import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion'
import { useEffect, useRef } from 'react'

export const Counter = ({ value }: { value: number }) => {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.4 })
  const reduced = useReducedMotion()
  const count = useMotionValue(0)
  const rounded = useTransform(count, (v) => Math.round(v))

  useEffect(() => {
    if (!inView) return
    if (reduced) {
      count.set(value)
      return
    }
    const controls = animate(count, value, { duration: 1.2, ease: 'easeOut' })
    return () => controls.stop()
  }, [inView, reduced, value, count])

  return <motion.span ref={ref}>{rounded}</motion.span>
}
