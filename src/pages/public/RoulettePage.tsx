import { motion, useReducedMotion } from 'framer-motion'
import { BookOpen, Dices, ExternalLink, Tv } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import { EmptyState, ErrorState, RouletteReel, WorkDetail } from '@/components'
import { Button, buttonVariants, ToggleGroup, ToggleGroupItem } from '@/components/ui'
import { useCatalog } from '@/hooks'
import { cn, pickRandomPending, TYPE_PATH, type Work, type WorkType } from '@/lib'

const SPIN_MS = 1400
const TICK_MS = 90

export const RoulettePage = () => {
  const [params, setParams] = useSearchParams()
  const { works, loading, error, reload } = useCatalog()
  const reduced = useReducedMotion()
  const type: WorkType = params.get('tipo') === 'manga' ? 'manga' : 'anime'
  const [result, setResult] = useState<Work | null>(null)
  const [preview, setPreview] = useState<Work | null>(null)
  const [spinning, setSpinning] = useState(false)
  const [spun, setSpun] = useState(false)
  const picked = useRef<Work | null>(null)
  const pool = useRef<Work[]>([])

  const candidates = works.filter((w) => w.status === 'pending' && w.type === type)

  useEffect(() => {
    if (!spinning) return
    const tick = setInterval(
      () => setPreview(pool.current[Math.floor(Math.random() * pool.current.length)]),
      TICK_MS
    )
    const done = setTimeout(() => {
      setResult(picked.current)
      setSpinning(false)
    }, SPIN_MS)
    return () => {
      clearInterval(tick)
      clearTimeout(done)
    }
  }, [spinning])

  const changeType = (next: WorkType) => {
    setSpinning(false)
    setResult(null)
    setPreview(null)
    setSpun(false)
    setParams(next === 'anime' ? {} : { tipo: next }, { replace: true })
  }

  const spin = () => {
    picked.current = pickRandomPending(works, type, result?.id ?? null)
    pool.current = candidates
    setSpun(true)
    if (!picked.current || reduced) {
      setResult(picked.current)
      return
    }
    setSpinning(true)
  }

  const other: WorkType = type === 'anime' ? 'manga' : 'anime'
  const plural = (t: WorkType) => (t === 'anime' ? 'animes' : 'mangas')
  const current = !spinning && result && result.type === type ? result : null

  return (
    <section className='py-10'>
      <title>Ruleta · Otakuteca</title>
      <header className='mx-auto max-w-2xl text-center'>
        <h1 className='font-heading text-3xl font-extrabold tracking-tight sm:text-4xl'>Ruleta</h1>
        <p className='mt-3 text-pretty text-lavanda'>
          ¿No sabés qué mirar o leer? Dejá que decida la suerte.
        </p>
      </header>

      <div className='mt-8 flex flex-col items-center gap-5'>
        <ToggleGroup
          value={[type]}
          onValueChange={(v) => {
            if (v[0]) changeType(v[0] as WorkType)
          }}
          aria-label='Tipo de obra'
        >
          <ToggleGroupItem value='anime' variant='outline'>
            <Tv className='size-4' />
            Anime
          </ToggleGroupItem>
          <ToggleGroupItem value='manga' variant='outline'>
            <BookOpen className='size-4' />
            Manga
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <div className='mt-10'>
        {error ? (
          <ErrorState what='el catálogo' onRetry={reload} />
        ) : spun && !spinning && !current ? (
          <EmptyState
            icon={Dices}
            message={`No tengo ${plural(type)} pendientes. Probá con ${plural(other)}`}
          >
            <Button variant='outline' onClick={() => changeType(other)} className='rounded-full'>
              Probar con {plural(other)}
            </Button>
          </EmptyState>
        ) : (
          <div className='mx-auto max-w-4xl space-y-8' aria-live='polite'>
            {!current && <RouletteReel work={preview} spinning={spinning} />}
            {current && (
              <motion.div
                key={current.id}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 22 }}
              >
                <WorkDetail work={current} />
              </motion.div>
            )}
            <div className='flex flex-wrap items-center justify-center gap-3'>
              <Button
                onClick={spin}
                disabled={loading || spinning}
                size='lg'
                className='rounded-full px-8'
              >
                <Dices className='size-4' />
                {spinning ? 'Girando…' : current ? 'Otra opción' : '¡Girá la ruleta!'}
              </Button>
              {current && (
                <Link
                  to={`${TYPE_PATH[current.type]}/${current.id}`}
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'lg' }),
                    'rounded-full px-6'
                  )}
                >
                  <ExternalLink className='size-4' />
                  Ver el detalle
                </Link>
              )}
            </div>
            {!spun && !loading && (
              <p className='text-center text-sm text-lavanda'>
                Tengo {candidates.length} {plural(type)} pendientes esperando su turno.
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
