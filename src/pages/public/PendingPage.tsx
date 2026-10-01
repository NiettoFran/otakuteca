import { motion } from 'framer-motion'
import { Library } from 'lucide-react'

import { EmptyState, WorkCard } from '@/components'
import { useCatalog, useMotionSet } from '@/hooks'
import { sortWorks } from '@/lib'

export const PendingPage = () => {
  const m = useMotionSet()
  const { works, loading, error } = useCatalog()
  const pending = sortWorks(works.filter((w) => w.status === 'pending'))

  return (
    <section className='py-10'>
      <title>Pendientes · Otakuteca</title>
      <h1 className='font-heading text-3xl font-extrabold tracking-tight sm:text-4xl'>
        Pendientes
      </h1>
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
            className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          >
            {pending.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
