import { motion } from 'framer-motion'
import { BookCheck, ChartColumn, Clock, Dices, Heart, Trophy, Tv } from 'lucide-react'
import { Link } from 'react-router'

import { CardGrid, Counter, HomeSection, WorkCard } from '@/components'
import { buttonVariants } from '@/components/ui'
import { useCatalog, useMotionSet } from '@/hooks'
import { cn, getHomeCounters } from '@/lib'

const SHORTCUTS = [
  { label: 'Ranking', text: 'Mi top personal de animes', to: '/ranking', icon: Trophy },
  { label: 'Ruleta', text: 'Que decida la suerte', to: '/ruleta', icon: Dices },
  { label: 'Pendientes', text: 'Lo que viene en la lista', to: '/pendientes', icon: Clock },
  { label: 'Estadísticas', text: 'Mi catálogo en números', to: '/estadisticas', icon: ChartColumn },
]

const FEATURED_COUNT = 4

// Degradé con caída suavizada (easing) para que el óvalo no tenga un borde marcado.
const glowStop = (color: string, percent: number, at: number) =>
  `color-mix(in oklab, var(--color-${color}) ${percent}%, transparent) ${at}%`

const BRAND_GLOW = `radial-gradient(closest-side, ${[
  glowStop('sakura', 45, 0),
  glowStop('sakura', 33, 20),
  glowStop('magenta', 24, 40),
  glowStop('magenta', 12, 60),
  glowStop('violeta', 5, 80),
  glowStop('violeta', 0, 100),
].join(', ')})`

export const Home = () => {
  const m = useMotionSet()
  const { works, error } = useCatalog()
  const counters = getHomeCounters(works)
  const favorites = works.filter((w) => w.is_favorite).slice(0, FEATURED_COUNT)
  const recent = [...works]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, FEATURED_COUNT)

  const stats = [
    { label: 'Animes vistos', value: counters.animesWatched, icon: Tv, color: 'text-sakura' },
    { label: 'Favoritos', value: counters.favorites, icon: Heart, color: 'text-dorado' },
    { label: 'Mangas leídos', value: counters.mangasRead, icon: BookCheck, color: 'text-cian' },
  ]

  return (
    <>
      <title>Otakuteca · Mi biblioteca de anime y manga</title>
      <section className='relative isolate py-16 text-center sm:py-20'>
        <div
          aria-hidden
          className='pointer-events-none absolute inset-x-0 -top-16 -bottom-16 -z-10 overflow-x-clip'
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className='absolute top-1/2 left-1/2 h-96 w-[min(60rem,100%)] -translate-x-1/2 -translate-y-1/2'
          >
            <motion.div
              variants={m.glow}
              initial='rest'
              animate='breathe'
              style={{ backgroundImage: BRAND_GLOW }}
              className='size-full'
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

      {favorites.length > 0 && (
        <HomeSection title='Mis favoritos' to='/animes?favoritos=1' linkLabel='Ver todos'>
          <CardGrid>
            {favorites.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </CardGrid>
        </HomeSection>
      )}

      {recent.length > 0 && (
        <HomeSection title='Lo último que sumé'>
          <CardGrid>
            {recent.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </CardGrid>
        </HomeSection>
      )}

      <HomeSection title='Explorá más'>
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4'>
          {SHORTCUTS.map(({ label, text, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className='group flex items-center gap-4 rounded-2xl border border-ciruela bg-abismo p-4 transition-colors hover:border-sakura focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none'
            >
              <span className='grid size-11 shrink-0 place-items-center rounded-xl bg-uva/60 text-sakura'>
                <Icon aria-hidden className='size-5' />
              </span>
              <span className='min-w-0'>
                <span className='block font-heading font-bold group-hover:text-sakura-claro'>
                  {label}
                </span>
                <span className='block truncate text-sm text-lavanda'>{text}</span>
              </span>
            </Link>
          ))}
        </div>
      </HomeSection>

      {error && (
        <p className='mt-4 text-center text-sm text-lavanda'>
          No pudimos cargar el catálogo. Probá recargar la página
        </p>
      )}
    </>
  )
}
