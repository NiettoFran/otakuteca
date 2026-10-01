import { motion } from 'framer-motion'
import { Library } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'

import { CatalogFilters, EmptyState, WorkCard } from '@/components'
import { buttonVariants } from '@/components/ui'
import { useCatalog, useMotionSet } from '@/hooks'
import {
  applyFilters,
  cn,
  hasActiveFilters,
  parseFilters,
  sortWorks,
  TYPE_PATH,
  type WorkType,
} from '@/lib'

const TITLE: Record<WorkType, string> = { anime: 'Animes', manga: 'Mangas' }

export const CatalogPage = ({ type }: { type: WorkType }) => {
  const m = useMotionSet()
  const [params] = useSearchParams()
  const { works, loading, error } = useCatalog()
  const filters = parseFilters(params)
  const ofType = works.filter((w) => w.type === type)
  const visible = sortWorks(applyFilters(ofType, filters))

  return (
    <section className='py-10'>
      <title>{`${TITLE[type]} · Otakuteca`}</title>
      <h1 className='font-heading text-3xl font-extrabold tracking-tight sm:text-4xl'>
        {TITLE[type]}
      </h1>
      <div className='mt-6'>
        <CatalogFilters type={type} />
      </div>
      <div className='mt-8'>
        {loading ? (
          <p className='py-12 text-center text-lavanda'>Cargando…</p>
        ) : error ? (
          <EmptyState message='No pudimos cargar el catálogo. Probá recargar la página' />
        ) : visible.length === 0 ? (
          <EmptyState icon={Library} message='Aún no hay obras en esta categoría'>
            {hasActiveFilters(filters) && (
              <Link
                to={TYPE_PATH[type]}
                className={cn(buttonVariants({ variant: 'outline' }), 'rounded-full')}
              >
                Ver todo
              </Link>
            )}
          </EmptyState>
        ) : (
          <motion.div
            key={`${type}-${params.toString()}`}
            variants={m.grid}
            initial='hidden'
            animate='visible'
            className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          >
            {visible.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </motion.div>
        )}
      </div>
    </section>
  )
}
