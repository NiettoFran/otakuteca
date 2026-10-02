import { SearchX } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { EmptyState, ErrorState } from '@/components'
import { useWork } from '@/hooks'

import { WorkEditor } from './WorkEditor'

const NotFound = () => (
  <EmptyState icon={SearchX} message='Obra no encontrada'>
    <Link to='/dashboard' className='text-sakura hover:text-sakura-claro'>
      Volver a las obras
    </Link>
  </EmptyState>
)

const EditExisting = ({ id }: { id: string }) => {
  const { work, loading, error, notFound } = useWork(id)
  if (loading) return <p className='py-12 text-center text-lavanda'>Cargando…</p>
  if (error) return <ErrorState what='la obra' />
  if (notFound || !work) return <NotFound />
  return <WorkEditor key={work.id} work={work} />
}

export const WorkEditPage = () => {
  const { id } = useParams()
  return id ? <EditExisting id={id} /> : <WorkEditor work={null} />
}
