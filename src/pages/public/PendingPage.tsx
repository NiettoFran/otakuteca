import { Library } from 'lucide-react'

import { CardGrid, EmptyState, PendingCard } from '@/components'
import { useCatalog } from '@/hooks'
import { sortWorks } from '@/lib'

export const PendingPage = () => {
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
          <CardGrid>
            {pending.map((work) => (
              <PendingCard key={work.id} work={work} />
            ))}
          </CardGrid>
        )}
      </div>
    </section>
  )
}
