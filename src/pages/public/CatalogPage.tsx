import { Library } from 'lucide-react'
import { Link, useSearchParams } from 'react-router'

import { CardGrid, CatalogFilters, EmptyState, ErrorState, WorkCard } from '@/components'
import { buttonVariants } from '@/components/ui'
import { useCatalog } from '@/hooks'
import {
  applyFilters,
  cn,
  countByStatus,
  hasActiveFilters,
  parseFilters,
  sortWorks,
  TYPE_PATH,
  type WorkType,
} from '@/lib'

const TITLE: Record<WorkType, string> = { anime: 'Animes', manga: 'Mangas' }

const DESCRIPTION: Record<WorkType, string> = {
  anime: 'Todos los animes que vi, estoy viendo o tengo en la mira.',
  manga: 'Todos los mangas que leí, estoy leyendo o tengo en la mira.',
}

export const CatalogPage = ({ type }: { type: WorkType }) => {
  const [params] = useSearchParams()
  const { works, loading, error, reload } = useCatalog()
  const filters = parseFilters(params)
  const ofType = works.filter((w) => w.type === type)
  const visible = sortWorks(applyFilters(ofType, filters))

  return (
    <section className='py-10'>
      <title>{`${TITLE[type]} · Otakuteca`}</title>
      <header className='mx-auto max-w-2xl text-center'>
        <h1 className='font-heading text-3xl font-extrabold tracking-tight sm:text-4xl'>
          {TITLE[type]}
        </h1>
        <p className='mt-3 text-pretty text-lavanda'>{DESCRIPTION[type]}</p>
      </header>
      <div className='mt-8'>
        <CatalogFilters type={type} counts={countByStatus(ofType)} />
      </div>
      <div className='mt-8'>
        {loading ? (
          <p className='py-12 text-center text-lavanda'>Cargando…</p>
        ) : error ? (
          <ErrorState what='el catálogo' onRetry={reload} />
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
          <CardGrid key={`${type}-${params.toString()}`}>
            {visible.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </CardGrid>
        )}
      </div>
    </section>
  )
}
