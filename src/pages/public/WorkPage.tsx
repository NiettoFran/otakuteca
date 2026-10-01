import { ArrowLeft, SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { EmptyState, WorkDetail } from '@/components'
import { useWork } from '@/hooks'
import { TYPE_PATH, type WorkType } from '@/lib'

const BACK_LABEL: Record<WorkType, string> = {
  anime: 'Volver a Animes',
  manga: 'Volver a Mangas',
}

export const WorkPage = ({ type }: { type: WorkType }) => {
  const { id } = useParams()
  const { work, loading, error, notFound } = useWork(id, type)
  const backLink = (
    <Link
      to={TYPE_PATH[type]}
      className='inline-flex items-center gap-1.5 text-sakura hover:text-sakura-claro'
    >
      <ArrowLeft className='size-4' />
      {BACK_LABEL[type]}
    </Link>
  )

  return (
    <section className='py-10'>
      <title>{work ? `${work.title} · Otakuteca` : 'Obra · Otakuteca'}</title>
      {loading ? (
        <p className='py-12 text-center text-lavanda'>Cargando…</p>
      ) : error ? (
        <EmptyState message='No pudimos cargar el catálogo. Probá recargar la página' />
      ) : notFound || !work ? (
        <EmptyState icon={SearchX} message='Obra no encontrada'>
          {backLink}
        </EmptyState>
      ) : (
        <div className='space-y-6'>
          {backLink}
          <WorkDetail work={work} />
        </div>
      )}
    </section>
  )
}
