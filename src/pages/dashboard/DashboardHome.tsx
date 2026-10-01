import { useQueryClient } from '@tanstack/react-query'
import { Library, Plus, SearchX } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import {
  ConfirmDialog,
  EmptyState,
  PaginationBar,
  PaginationSummary,
  WorksEmptyState,
  WorksFilters,
  WorksTable,
} from '@/components'
import { Button, buttonVariants } from '@/components/ui'
import { useDebouncedValue, useWorksPage, worksPageKey } from '@/hooks'
import {
  cn,
  DEFAULT_PAGE_SIZE,
  EMPTY_DASHBOARD_FILTERS,
  hasDashboardFilters,
  isSessionError,
  supabase,
  type DashboardFilters,
  type Work,
} from '@/lib'

export const DashboardHome = () => {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE)
  const [filters, setFilters] = useState<DashboardFilters>(EMPTY_DASHBOARD_FILTERS)
  const debouncedSearch = useDebouncedValue(filters.search)
  // Con los filtros aplicados (la búsqueda va con retraso), no con lo que se está tipeando.
  const appliedFilters = { ...filters, search: debouncedSearch }
  const filtered = hasDashboardFilters(appliedFilters)
  const {
    data,
    isPending: loading,
    isError: error,
    isPlaceholderData: refreshing,
  } = useWorksPage(page, pageSize, appliedFilters)

  const clearFilters = () => {
    setFilters(EMPTY_DASHBOARD_FILTERS)
    setPage(1)
  }

  const changeFilters = (changes: Partial<DashboardFilters>) => {
    setFilters((current) => ({ ...current, ...changes }))
    setPage(1)
  }
  const works = data?.works ?? []
  const total = data?.total ?? 0
  const queryClient = useQueryClient()
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
    else {
      await queryClient.invalidateQueries({ queryKey: worksPageKey })
      if (works.length === 1 && page > 1) setPage(page - 1)
    }
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
      <div className='mt-6 space-y-4'>
        <WorksFilters filters={filters} onChange={changeFilters} onClear={clearFilters} />
        {loading ? (
          <p className='py-12 text-center text-lavanda'>Cargando…</p>
        ) : error ? (
          <EmptyState message='No pudimos cargar el catálogo. Probá recargar la página' />
        ) : total === 0 && filtered ? (
          <WorksEmptyState
            icon={SearchX}
            title='No encontramos nada'
            action={
              <Button onClick={clearFilters} className='rounded-full'>
                Limpiar filtros
              </Button>
            }
          >
            {debouncedSearch.trim() ? (
              <>
                No hay obras que coincidan con «
                <span className='break-all text-niebla'>{debouncedSearch.trim()}</span>» y los
                filtros elegidos.
              </>
            ) : (
              'No hay obras que coincidan con los filtros elegidos.'
            )}
          </WorksEmptyState>
        ) : total === 0 ? (
          <WorksEmptyState
            icon={Library}
            title='Todavía no cargaste ninguna obra'
            action={
              <Link to='/dashboard/obras/nueva' className={cn(buttonVariants(), 'rounded-full')}>
                Agregar obra
              </Link>
            }
          >
            ¡Empezá con la primera!
          </WorksEmptyState>
        ) : (
          <div
            className={cn('space-y-3 transition-opacity', refreshing && 'opacity-60')}
            aria-busy={refreshing}
          >
            <PaginationBar
              page={page}
              pageSize={pageSize}
              total={total}
              onPageChange={setPage}
              onPageSizeChange={(size) => {
                setPageSize(size)
                setPage(1)
              }}
            />
            <WorksTable works={works} onDelete={setToDelete} />
            <PaginationSummary page={page} pageSize={pageSize} total={total} />
          </div>
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
