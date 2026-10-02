import { motion, useReducedMotion } from 'framer-motion'
import { Compass, Dices, House } from 'lucide-react'
import { Link } from 'react-router'

import { buttonVariants } from '@/components/ui'
import { useMotionSet } from '@/hooks'
import { cn } from '@/lib'

export const NotFoundPage = () => {
  const m = useMotionSet()
  const reduced = useReducedMotion()

  return (
    <motion.section
      variants={m.hero}
      initial='hidden'
      animate='visible'
      className='mx-auto flex max-w-xl flex-col items-center py-20 text-center sm:py-28'
    >
      <title>Página no encontrada · Otakuteca</title>
      <motion.div variants={m.fadeUpBlur} className='relative'>
        <span
          aria-hidden
          className='bg-linear-to-r from-lavanda via-magenta to-sakura bg-clip-text font-heading text-8xl font-extrabold tracking-tighter text-transparent sm:text-9xl'
        >
          404
        </span>
        <motion.span
          aria-hidden
          animate={reduced ? undefined : { rotate: [-12, 12, -12] }}
          transition={{ duration: 4, ease: 'easeInOut', repeat: Infinity }}
          className='absolute -top-3 -right-5 grid size-12 place-items-center rounded-full border border-ciruela bg-abismo text-cian sm:-right-8 sm:size-14'
        >
          <Compass className='size-6 sm:size-7' />
        </motion.span>
      </motion.div>
      <motion.h1
        variants={m.fadeUpBlur}
        className='mt-4 font-heading text-2xl font-extrabold tracking-tight sm:text-3xl'
      >
        Te perdiste en el camino
      </motion.h1>
      <motion.p variants={m.fadeUpBlur} className='mt-3 max-w-md text-pretty text-lavanda'>
        La página que buscás no existe o se mudó. Volvé al inicio o dejá que la ruleta elija por
        vos.
      </motion.p>
      <motion.div
        variants={m.fadeUpBlur}
        className='mt-8 flex flex-wrap items-center justify-center gap-3'
      >
        <Link to='/' className={cn(buttonVariants({ size: 'lg' }), 'rounded-full px-6')}>
          <House className='size-4' />
          Volver al inicio
        </Link>
        <Link
          to='/ruleta'
          className={cn(buttonVariants({ size: 'lg', variant: 'outline' }), 'rounded-full px-6')}
        >
          <Dices className='size-4' />
          Probá la ruleta
        </Link>
      </motion.div>
    </motion.section>
  )
}
