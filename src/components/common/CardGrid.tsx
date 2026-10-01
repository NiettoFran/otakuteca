import { motion } from 'framer-motion'
import { Children, type ReactNode } from 'react'

import { useMotionSet } from '@/hooks'

export const CardGrid = ({ children }: { children: ReactNode }) => {
  const m = useMotionSet()

  return (
    <motion.div
      variants={m.grid}
      initial='hidden'
      animate='visible'
      className='mx-auto flex max-w-6xl flex-wrap justify-center gap-4 sm:gap-6'
    >
      {Children.map(children, (child) => (
        <div className='w-[calc((100%-1rem)/2)] sm:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]'>
          {child}
        </div>
      ))}
    </motion.div>
  )
}
