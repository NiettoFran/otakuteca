import { BarChart, EmptyState } from '@/components'
import { useCatalog } from '@/hooks'
import { countByGenre, countByStatus, countByType, TYPE_LABEL, type WorkStatus } from '@/lib'

const STATUS_COLOR: Record<WorkStatus, string> = {
  pending: 'bg-lavanda',
  in_progress: 'bg-cian',
  completed: 'bg-sakura',
  dropped: 'bg-magenta',
}

export const StatsPage = () => {
  const { works, loading, error } = useCatalog()

  return (
    <section className='py-10'>
      <title>Estadísticas · Otakuteca</title>
      <h1 className='font-heading text-3xl font-extrabold tracking-tight sm:text-4xl'>
        Estadísticas
      </h1>
      <div className='mt-8'>
        {loading ? (
          <p className='py-12 text-center text-lavanda'>Cargando…</p>
        ) : error ? (
          <EmptyState message='No pudimos cargar el catálogo. Probá recargar la página' />
        ) : (
          <div className='grid gap-6 lg:grid-cols-2'>
            <BarChart
              title='Por estado'
              items={countByStatus(works).map((s) => ({
                label: s.label,
                value: s.value,
                colorClass: STATUS_COLOR[s.status],
              }))}
            />
            <BarChart
              title='Anime vs. manga'
              items={countByType(works).flatMap((t) => [
                { label: TYPE_LABEL[t.type], value: t.total, colorClass: 'bg-sakura' },
                ...t.byStatus.map((s) => ({
                  label: `${TYPE_LABEL[t.type]} · ${s.label}`,
                  value: s.value,
                  colorClass: STATUS_COLOR[s.status],
                })),
              ])}
            />
            <div className='lg:col-span-2'>
              <BarChart
                title='Por género'
                items={countByGenre(works).map((g) => ({ ...g, colorClass: 'bg-cian' }))}
              />
              <p className='mt-2 text-sm text-lavanda'>
                Una obra con varios géneros suma en cada uno.
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
