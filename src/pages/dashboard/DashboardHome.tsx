import { useQueryClient } from '@tanstack/react-query'
import { Eraser, Library, Plus, SearchX } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router'

import {
  ConfirmDialog,
  ErrorState,
  PageHeader,
  PaginationBar,
  PaginationSummary,
  PanelEmptyState,
  TooltipHint,
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

const AddWorkLink = () => (
  <TooltipHint label='Cargar una obra nueva al catálogo'>
    <Link to='/dashboard/obras/nueva' className={cn(buttonVariants(), 'rounded-full')}>
      <Plus className='size-4' />
      Agregar obra
    </Link>
  </TooltipHint>
)

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
    refetch,
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
    <section className='mx-auto max-w-5xl'>
      <title>Obras · Panel · Otakuteca</title>
      <PageHeader
        title='Obras'
        description='Todo tu catálogo en un solo lugar: buscá y filtrá tus animes y mangas, editá sus datos o eliminá los que ya no quieras.'
      >
        <AddWorkLink />
      </PageHeader>
      {deleteError && (
        <p role='alert' className='mt-4 text-sm text-sakura'>
          No pudimos eliminar la obra. Revisá tu conexión y probá de nuevo.
        </p>
      )}
      <div className='mt-8 space-y-4'>
        <WorksFilters filters={filters} onChange={changeFilters} onClear={clearFilters} />
        {loading ? (
          <p className='py-12 text-center text-lavanda'>Cargando…</p>
        ) : error ? (
          <ErrorState what='el catálogo' onRetry={() => refetch()} />
        ) : total === 0 && filtered ? (
          <PanelEmptyState
            icon={SearchX}
            title='No encontramos nada'
            action={
              <TooltipHint label='Quitar la búsqueda y todos los filtros'>
                <Button onClick={clearFilters} className='rounded-full'>
                  <Eraser className='size-4' />
                  Limpiar filtros
                </Button>
              </TooltipHint>
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
          </PanelEmptyState>
        ) : total === 0 ? (
          <PanelEmptyState
            icon={Library}
            title='Todavía no cargaste ninguna obra'
            action={<AddWorkLink />}
          >
            ¡Empezá con la primera!
          </PanelEmptyState>
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
