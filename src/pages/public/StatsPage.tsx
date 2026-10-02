import { CircleCheck, Heart, Library, Star } from 'lucide-react'

import { BarChart, ErrorState, StatTile, StatusBreakdown } from '@/components'
import { useCatalog } from '@/hooks'
import { countByGenre, countByStatus, countByType, getStatsSummary, TYPE_LABEL } from '@/lib'

const MAX_GENRES = 10

export const StatsPage = () => {
  const { works, loading, error, reload } = useCatalog()
  const summary = getStatsSummary(works)
  const genres = countByGenre(works)

  return (
    <section className='py-10'>
      <title>Estadísticas · Otakuteca</title>
      <header className='mx-auto max-w-2xl text-center'>
        <h1 className='font-heading text-3xl font-extrabold tracking-tight sm:text-4xl'>
          Estadísticas
        </h1>
        <p className='mt-3 text-pretty text-lavanda'>Mi catálogo en números.</p>
      </header>
      <div className='mt-8'>
        {loading ? (
          <p className='py-12 text-center text-lavanda'>Cargando…</p>
        ) : error ? (
          <ErrorState what='el catálogo' onRetry={reload} />
        ) : (
          <div className='space-y-6'>
            <div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
              <StatTile
                icon={Library}
                label='Obras en total'
                value={String(summary.total)}
                accentClass='text-cian'
              />
              <StatTile
                icon={CircleCheck}
                label='Completadas'
                value={String(summary.completed)}
                accentClass='text-sakura'
              />
              <StatTile
                icon={Heart}
                label='Favoritas'
                value={String(summary.favorites)}
                accentClass='text-magenta'
              />
              <StatTile
                icon={Star}
                label='Puntaje promedio'
                value={summary.averageRating === null ? '–' : summary.averageRating.toFixed(1)}
                accentClass='text-dorado'
              />
            </div>
            <StatusBreakdown title='Por estado' segments={countByStatus(works)} />
            <div className='grid gap-6 md:grid-cols-2'>
              {countByType(works).map((t) => (
                <StatusBreakdown
                  key={t.type}
                  title={TYPE_LABEL[t.type]}
                  total={t.total}
                  segments={t.byStatus}
                />
              ))}
            </div>
            <div>
              <BarChart
                title='Géneros más frecuentes'
                items={genres.slice(0, MAX_GENRES).map((g) => ({ ...g, colorClass: 'bg-cian' }))}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
