import { motion } from 'framer-motion'
import { Library } from 'lucide-react'

import { EmptyState, PendingCard } from '@/components'
import { useCatalog, useMotionSet } from '@/hooks'
import { sortWorks } from '@/lib'

export const PendingPage = () => {
  const m = useMotionSet()
  const { works, loading, error } = useCatalog()
  const pending = sortWorks(works.filter((w) => w.status === 'pending'))

  const animes = pending.filter((w) => w.type === 'anime').length
  const summary =
    !loading && !error && pending.length > 0
      ? `${animes} ${animes === 1 ? 'anime' : 'animes'} y ${pending.length - animes} ${pending.length - animes === 1 ? 'manga' : 'mangas'} esperando su turno.`
      : ''

  return (
    <section className='py-10'>
      <title>Pendientes · Otakuteca</title>
      <header className='mx-auto max-w-2xl text-center'>
        <h1 className='font-heading text-3xl font-extrabold tracking-tight sm:text-4xl'>
          Pendientes
        </h1>
        <p className='mt-3 text-pretty text-lavanda'>
          Lo que tengo en la lista para más adelante. {summary}
        </p>
      </header>
      <div className='mt-8'>
        {loading ? (
          <p className='py-12 text-center text-lavanda'>Cargando…</p>
        ) : error ? (
          <EmptyState message='No pudimos cargar el catálogo. Probá recargar la página' />
        ) : pending.length === 0 ? (
          <EmptyState icon={Library} message='Aún no hay obras en esta categoría' />
        ) : (
          <motion.div
            variants={m.grid}
            initial='hidden'
            animate='visible'
            className='mx-auto flex max-w-6xl flex-wrap justify-center gap-4 sm:gap-6'
          >
            {pending.map((work) => (
              <div
                key={work.id}
                className='w-[calc((100%-1rem)/2)] sm:w-[calc((100%-3rem)/3)] lg:w-[calc((100%-4.5rem)/4)]'
              >
                <PendingCard work={work} />
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
