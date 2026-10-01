import { Plus, Star } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { ConfirmDialog, EmptyState, StatusBadge } from '@/components'
import { Button, buttonVariants } from '@/components/ui'
import { useCatalog } from '@/hooks'
import { cn, isSessionError, sortWorks, supabase, TYPE_LABEL, type Work } from '@/lib'

export const DashboardHome = () => {
  const { works, loading, error, reload } = useCatalog()
  const navigate = useNavigate()
  const [toDelete, setToDelete] = useState<Work | null>(null)
  const [deleteError, setDeleteError] = useState(false)

  const remove = async (work: Work) => {
    setDeleteError(false)
    const { data, error } = await supabase.from('works').delete().eq('id', work.id).select('id')
    if (isSessionError(error) || (!error && data?.length === 0)) {
      navigate('/login?next=/dashboard&motivo=sesion', { replace: true })
      return
    }
    if (error) setDeleteError(true)
    else reload()
  }

  return (
    <section>
      <title>Obras · Panel · Otakuteca</title>
      <div className='flex flex-wrap items-center justify-between gap-3'>
        <h1 className='font-heading text-3xl font-extrabold'>Obras</h1>
        <Link to='/dashboard/obras/nueva' className={cn(buttonVariants(), 'rounded-full')}>
          <Plus className='size-4' />
          Agregar obra
        </Link>
      </div>
      {deleteError && (
        <p role='alert' className='mt-4 text-sm text-sakura'>
          No pudimos eliminar la obra. Revisá tu conexión y probá de nuevo.
        </p>
      )}
      <div className='mt-6'>
        {loading ? (
          <p className='py-12 text-center text-lavanda'>Cargando…</p>
        ) : error ? (
          <EmptyState message='No pudimos cargar el catálogo. Probá recargar la página' />
        ) : works.length === 0 ? (
          <EmptyState message='Todavía no cargaste ninguna obra. ¡Empezá con la primera!'>
            <Link to='/dashboard/obras/nueva' className={cn(buttonVariants(), 'rounded-full')}>
              Agregar obra
            </Link>
          </EmptyState>
        ) : (
          <ul className='divide-y divide-ciruela rounded-2xl border border-ciruela bg-abismo'>
            {sortWorks(works).map((work) => (
              <li key={work.id} className='flex flex-wrap items-center gap-3 p-4'>
                <div className='min-w-0 flex-1'>
                  <p className='flex items-center gap-2 font-medium'>
                    <span className='truncate'>{work.title}</span>
                    {work.is_favorite && (
                      <Star
                        className='size-4 shrink-0 fill-dorado text-dorado'
                        aria-label='Favorita'
                      />
                    )}
                  </p>
                  <p className='mt-1 text-sm text-lavanda'>{TYPE_LABEL[work.type]}</p>
                </div>
                <StatusBadge status={work.status} type={work.type} />
                <div className='flex gap-2'>
                  <Link
                    to={`/dashboard/obras/${work.id}`}
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    Editar
                  </Link>
                  <Button variant='destructive' size='sm' onClick={() => setToDelete(work)}>
                    Eliminar
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <ConfirmDialog
        open={toDelete !== null}
        onOpenChange={(open) => !open && setToDelete(null)}
        title={`¿Eliminar «${toDelete?.title ?? ''}»?`}
        description='No se puede deshacer.'
        confirmLabel='Eliminar'
        onConfirm={() => toDelete && remove(toDelete)}
      />
    </section>
  )
}
