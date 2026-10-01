import { motion } from 'framer-motion'
import { BookCheck, Heart, Tv } from 'lucide-react'
import { Link } from 'react-router'

import { Counter } from '@/components'
import { buttonVariants } from '@/components/ui'
import { useCatalog, useMotionSet } from '@/hooks'
import { cn, getHomeCounters } from '@/lib'

const BRAND_GRADIENT = 'bg-linear-to-b from-violeta via-magenta via-55% to-sakura'

export const Home = () => {
  const m = useMotionSet()
  const { works, error } = useCatalog()
  const counters = getHomeCounters(works)

  const stats = [
    { label: 'Animes vistos', value: counters.animesWatched, icon: Tv, color: 'text-sakura' },
    { label: 'Favoritos', value: counters.favorites, icon: Heart, color: 'text-dorado' },
    { label: 'Mangas leídos', value: counters.mangasRead, icon: BookCheck, color: 'text-cian' },
  ]

  return (
    <>
      <title>Otakuteca · Mi biblioteca de anime y manga</title>
      <section className='relative isolate py-16 text-center sm:py-20'>
        <div aria-hidden className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className='absolute top-1/2 left-1/2 h-64 w-[min(42rem,90%)] -translate-x-1/2 -translate-y-1/2'
          >
            <motion.div
              variants={m.glow}
              initial='rest'
              animate='breathe'
              className={`size-full rounded-full blur-3xl ${BRAND_GRADIENT}`}
            />
          </motion.div>
        </div>
        <motion.div variants={m.hero} initial='hidden' animate='visible'>
          <motion.h1
            variants={m.fadeUpBlur}
            className='font-heading text-4xl font-extrabold tracking-tight text-balance sm:text-5xl'
          >
            Mi biblioteca de <span className='text-sakura'>anime</span> y{' '}
            <span className='text-cian'>manga</span>
          </motion.h1>
          <motion.p
            variants={m.fadeUpBlur}
            className='mx-auto mt-4 max-w-xl text-lg text-pretty text-lavanda'
          >
            Lo que vi, lo que leí, lo que me encantó y lo que no me gusto. Con reseñas cortas y mi
            top personal.
          </motion.p>
          <motion.div
            variants={m.fadeUpBlur}
            className='mt-8 flex flex-wrap items-center justify-center gap-3'
          >
            <Link to='/animes' className={cn(buttonVariants({ size: 'lg' }), 'rounded-full px-6')}>
              Mirá los animes
            </Link>
            <Link
              to='/mangas'
              className={cn(
                buttonVariants({ size: 'lg', variant: 'outline' }),
                'rounded-full px-6'
              )}
            >
              Mirá los mangas
            </Link>
          </motion.div>
        </motion.div>
      </section>

      <motion.section
        variants={m.stats}
        initial='hidden'
        whileInView='visible'
        viewport={{ once: true, amount: 0.4 }}
        className='grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4'
      >
        {stats.map(({ label, value, icon: Icon, color }) => (
          <motion.div
            key={label}
            variants={m.fadeUp}
            className='flex items-center gap-3 rounded-2xl border border-ciruela bg-abismo p-4'
          >
            <div className='grid size-10 shrink-0 place-items-center rounded-xl bg-uva/60'>
              <Icon className={`size-5 ${color}`} />
            </div>
            <div>
              <p className='font-heading text-2xl leading-none font-bold'>
                <Counter value={value} />
              </p>
              <p className='mt-1 text-xs text-lavanda'>{label}</p>
            </div>
          </motion.div>
        ))}
      </motion.section>
      {error && (
        <p className='mt-4 text-center text-sm text-lavanda'>
          No pudimos cargar el catálogo. Probá recargar la página
        </p>
      )}
    </>
  )
}
