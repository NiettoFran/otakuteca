import {
  animate,
  AnimatePresence,
  motion,
  MotionConfig,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type TargetAndTransition,
  type Transition,
  type Variants,
} from 'framer-motion'
import { BookCheck, BookOpen, Heart, Plus, Search, Star, ThumbsDown, Tv } from 'lucide-react'
import { useEffect, useRef, useState, type Ref } from 'react'

const SPRING: Transition = { type: 'spring', stiffness: 260, damping: 26 }
const SHORT_FADE: Transition = { duration: 0.2, ease: 'easeOut' }

type MotionSet = {
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

const MOTION: Record<'full' | 'reduced', MotionSet> = {
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

const useMotionSet = () => MOTION[useReducedMotion() ? 'reduced' : 'full']

type MangaStatus = 'leido' | 'leyendo' | 'sin-leer'
type Filter = 'todos' | 'gustaron' | 'no-gustaron'

type Anime = {
  id: number
  name: string
  seasons: number
  manga: MangaStatus
  liked: boolean
  review: string
}

const ANIMES: Anime[] = [
  {
    id: 1,
    name: 'Fullmetal Alchemist: Brotherhood',
    seasons: 1,
    manga: 'leido',
    liked: true,
    review:
      'Una historia redonda de principio a fin. Los hermanos Elric cargan con un peso enorme y cada arco suma algo. El final es de lo más satisfactorio que vi en un anime, sin cabos sueltos ni relleno.',
  },
  {
    id: 2,
    name: 'Frieren',
    seasons: 2,
    manga: 'leyendo',
    liked: true,
    review:
      'Melancólico y tranquilo, pero nunca aburrido. Habla del paso del tiempo y de lo que valen los vínculos de una forma que muy pocos animes se animan a hacer. La banda sonora es preciosa.',
  },
  {
    id: 3,
    name: 'Shingeki no Kyojin',
    seasons: 4,
    manga: 'leido',
    liked: true,
    review:
      'Las primeras temporadas son puro impacto y la tercera da vuelta todo lo que creías saber. El final divide opiniones, pero el viaje vale cada capítulo.',
  },
  {
    id: 4,
    name: 'Sword Art Online',
    seasons: 3,
    manga: 'sin-leer',
    liked: false,
    review:
      'La premisa del primer arco prometía mucho y se desinfló rápido. Kirito resuelve todo sin esfuerzo y los personajes secundarios quedan en segundo plano. No me enganchó.',
  },
  {
    id: 5,
    name: 'Jujutsu Kaisen',
    seasons: 2,
    manga: 'leyendo',
    liked: true,
    review:
      'Las peleas están animadas a otro nivel y el sistema de energía maldita es muy creativo. El arco de Shibuya es una montaña rusa que no te suelta.',
  },
  {
    id: 6,
    name: 'Tokyo Ghoul',
    seasons: 4,
    manga: 'leido',
    liked: false,
    review:
      'Arranca muy bien, pero la adaptación saltea demasiado del manga y a partir de la segunda temporada se vuelve confusa. Mejor leer el manga directamente.',
  },
  {
    id: 7,
    name: 'Spy x Family',
    seasons: 2,
    manga: 'sin-leer',
    liked: true,
    review:
      'Comedia familiar con espías y una nena telépata que se roba cada escena. Liviano, divertido y perfecto para ver después de algo más pesado.',
  },
  {
    id: 8,
    name: 'Mirai Nikki',
    seasons: 1,
    manga: 'sin-leer',
    liked: false,
    review:
      'La idea de los diarios del futuro es buenísima, pero la ejecución se pierde entre giros forzados y personajes que toman decisiones sin sentido.',
  },
]

const MANGA_BADGE: Record<MangaStatus, { label: string; className: string }> = {
  leido: { label: 'Manga leído', className: 'bg-cian/10 text-cian ring-cian/30' },
  leyendo: { label: 'Leyendo manga', className: 'bg-lavanda/10 text-lavanda ring-lavanda/30' },
  'sin-leer': { label: 'Sin leer', className: 'bg-ciruela text-niebla/60 ring-uva' },
}

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'gustaron', label: 'Me gustaron' },
  { id: 'no-gustaron', label: 'No me gustaron' },
]

const STATS = [
  { label: 'Animes vistos', value: ANIMES.length, icon: Tv, color: 'text-sakura' },
  {
    label: 'Favoritos',
    value: ANIMES.filter((a) => a.liked).length,
    icon: Heart,
    color: 'text-dorado',
  },
  {
    label: 'Mangas leídos',
    value: ANIMES.filter((a) => a.manga === 'leido').length,
    icon: BookCheck,
    color: 'text-cian',
  },
  {
    label: 'Mangas en lectura',
    value: ANIMES.filter((a) => a.manga === 'leyendo').length,
    icon: BookOpen,
    color: 'text-lavanda',
  },
]

const BRAND_GRADIENT = 'bg-linear-to-b from-violeta via-magenta via-55% to-sakura'
const BRAND_GRADIENT_X = 'bg-linear-to-r from-violeta via-magenta via-55% to-sakura'

const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

export const Home = () => {
  const m = useMotionSet()
  const reduced = useReducedMotion()
  const [filter, setFilter] = useState<Filter>('todos')
  const [query, setQuery] = useState('')

  const { scrollY, scrollYProgress } = useScroll()
  const [compact, setCompact] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => setCompact(y > 40))
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })

  const gridRef = useRef<HTMLElement>(null)
  const gridInView = useInView(gridRef, { once: true, amount: 0.1 })

  const animes = ANIMES.filter((anime) => {
    if (filter === 'gustaron' && !anime.liked) return false
    if (filter === 'no-gustaron' && anime.liked) return false
    return normalize(anime.name).includes(normalize(query.trim()))
  })

  return (
    <MotionConfig transition={SPRING} reducedMotion='user'>
      <div className='min-h-dvh bg-noche text-niebla'>
        {/* Barra de progreso de scroll */}
        <motion.div
          aria-hidden
          style={{ scaleX: reduced ? scrollYProgress : smoothProgress }}
          className={`fixed inset-x-0 top-0 z-60 h-0.5 origin-left ${BRAND_GRADIENT_X}`}
        />

        {/* Header */}
        <motion.header
          variants={m.header}
          initial='hidden'
          animate='visible'
          className='fixed inset-x-0 top-0 z-50'
        >
          <motion.div
            aria-hidden
            variants={m.headerBg}
            initial={false}
            animate={compact ? 'compact' : 'top'}
            className='absolute inset-0 origin-top border-b border-ciruela bg-noche/80 backdrop-blur-md'
          />
          <motion.div
            variants={m.headerRow}
            initial={false}
            animate={compact ? 'compact' : 'top'}
            className='relative mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6'
          >
            <motion.a
              href='/'
              initial='hidden'
              animate='visible'
              whileHover='hover'
              className='flex items-center gap-2.5'
            >
              <motion.img variants={m.logo} src='/otakuteca-icono.svg' alt='' className='size-10' />
              <span className='font-heading text-xl font-extrabold tracking-tight'>
                <span className='text-niebla'>Otaku</span>
                <span className='text-sakura'>teca</span>
              </span>
            </motion.a>
            <motion.div
              initial='rest'
              animate='rest'
              whileHover='hover'
              whileTap='tap'
              className='relative isolate'
            >
              {/* Glow sakura: capa difuminada que solo cambia opacity (más barato que animar box-shadow) */}
              <motion.span
                aria-hidden
                variants={m.ctaGlow}
                className='absolute -inset-1 rounded-full bg-sakura blur-md'
              />
              <motion.button
                type='button'
                variants={m.cta}
                className='relative inline-flex items-center gap-1.5 rounded-full bg-sakura px-4 py-2 text-sm font-semibold text-noche transition-colors hover:bg-sakura-claro focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none'
              >
                <Plus className='size-4' strokeWidth={2.5} />
                <span className='hidden sm:inline'>Agregar anime</span>
                <span className='sm:hidden'>Agregar</span>
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.header>

        <main className='mx-auto max-w-6xl px-4 pt-16 sm:px-6'>
          {/* Hero */}
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
                Mi biblioteca de <span className='text-sakura'>anime</span>
              </motion.h1>
              <motion.p
                variants={m.fadeUpBlur}
                className='mx-auto mt-4 max-w-xl text-lg text-pretty text-lavanda'
              >
                Lo que vi, lo que me encantó y lo que no tanto. Con temporadas, manga y una reseña
                corta.
              </motion.p>
            </motion.div>
          </section>

          {/* Stats */}
          <motion.section
            variants={m.stats}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, amount: 0.4 }}
            className='grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4'
          >
            {STATS.map(({ label, value, icon: Icon, color }) => (
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

          {/* Filtros */}
          <section className='mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div
              role='tablist'
              className='flex gap-1 rounded-full border border-ciruela bg-abismo p-1'
            >
              {FILTERS.map(({ id, label }) => {
                const active = filter === id
                return (
                  <button
                    key={id}
                    type='button'
                    role='tab'
                    aria-selected={active}
                    onClick={() => setFilter(id)}
                    className={`relative flex-1 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors sm:flex-none ${
                      active ? 'text-noche' : 'text-lavanda hover:text-sakura-claro'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId='tab-activa'
                        className='absolute inset-0 rounded-full bg-sakura shadow-md shadow-sakura/20'
                      />
                    )}
                    <span className='relative'>{label}</span>
                  </button>
                )
              })}
            </div>
            <label className='relative block sm:w-72'>
              <Search className='pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-lavanda' />
              <input
                type='search'
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder='Buscar anime…'
                className='w-full rounded-full border border-ciruela bg-abismo py-2.5 pr-4 pl-10 text-sm text-niebla placeholder:text-lavanda/60 focus:border-cian focus:ring-2 focus:ring-cian/20 focus:outline-none'
              />
            </label>
          </section>

          <motion.section
            ref={gridRef}
            variants={m.grid}
            initial='hidden'
            animate={gridInView ? 'visible' : 'hidden'}
            className='relative mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'
          >
            <AnimatePresence mode='popLayout'>
              {animes.map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </AnimatePresence>
          </motion.section>
          {animes.length === 0 && (
            <p className='py-12 text-center text-lavanda'>No hay animes que coincidan.</p>
          )}
        </main>

        {/* Footer */}
        <footer className='mt-20 border-t border-ciruela py-8 text-center text-sm text-lavanda'>
          <span className='font-heading font-bold'>
            Otaku<span className='text-sakura'>teca</span>
          </span>{' '}
          · hecho por Francisco Nieto
        </footer>
      </div>
    </MotionConfig>
  )
}

const Counter = ({ value }: { value: number }) => {
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

const AnimeCard = ({ anime, ref }: { anime: Anime; ref?: Ref<HTMLElement> }) => {
  const m = useMotionSet()
  const badge = MANGA_BADGE[anime.manga]

  return (
    <motion.article
      ref={ref}
      layout
      variants={m.card}
      exit={m.cardExit}
      whileHover={m.cardHover}
      className='group flex flex-col overflow-hidden rounded-2xl border border-ciruela bg-abismo transition-[border-color,box-shadow] duration-300 hover:border-sakura hover:shadow-xl hover:shadow-sakura/15'
    >
      {/* Portada placeholder 3:4 */}
      <div className='relative aspect-3/4 overflow-hidden'>
        <div
          className={`absolute inset-0 grid place-items-center transition-transform duration-500 ease-out motion-safe:group-hover:scale-106 ${BRAND_GRADIENT}`}
        >
          <span className='font-heading text-8xl font-extrabold text-niebla/90 drop-shadow-lg select-none'>
            {anime.name.charAt(0)}
          </span>
        </div>
        <div className='absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-abismo to-transparent' />
        <div
          className='absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-noche/70 backdrop-blur'
          title={anime.liked ? 'Me gustó' : 'No me gustó'}
        >
          {anime.liked ? (
            <motion.span
              variants={m.pop}
              initial='hidden'
              whileInView='visible'
              viewport={{ once: true }}
              className='grid place-items-center'
            >
              <Star className='size-5 fill-dorado text-dorado' />
            </motion.span>
          ) : (
            <ThumbsDown className='size-5 text-magenta' />
          )}
        </div>
      </div>

      <div className='flex flex-1 flex-col gap-3 p-5'>
        <h2 className='font-heading text-lg leading-snug font-bold transition group-hover:text-sakura-claro'>
          {anime.name}
        </h2>
        <div className='flex flex-wrap items-center gap-2 text-xs'>
          <span className='text-lavanda'>
            {anime.seasons} {anime.seasons === 1 ? 'temporada' : 'temporadas'}
          </span>
          <span aria-hidden className='text-lavanda/40'>
            •
          </span>
          <span className={`rounded-full px-2.5 py-0.5 font-medium ring-1 ${badge.className}`}>
            {badge.label}
          </span>
        </div>
        <p className='line-clamp-3 text-sm leading-relaxed text-niebla/80'>{anime.review}</p>
      </div>
    </motion.article>
  )
}
