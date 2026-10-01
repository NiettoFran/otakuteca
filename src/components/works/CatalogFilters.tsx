import { Star } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router'

import {
  cn,
  getStatusLabel,
  hasActiveFilters,
  parseFilters,
  STATUS_ORDER,
  STATUS_SLUG,
  TYPE_PATH,
  type WorkType,
} from '@/lib'

const chip = (active: boolean) =>
  cn(
    'rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none',
    active
      ? 'border-sakura bg-sakura text-noche'
      : 'border-ciruela bg-abismo text-lavanda hover:text-sakura-claro'
  )

export const CatalogFilters = ({ type }: { type: WorkType }) => {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const filters = parseFilters(params)

  const update = (changes: { estado?: string | null; favoritos?: boolean }) => {
    const next = new URLSearchParams(params)
    if ('estado' in changes) {
      if (changes.estado) next.set('estado', changes.estado)
      else next.delete('estado')
    }
    if ('favoritos' in changes) {
      if (changes.favoritos) next.set('favoritos', '1')
      else next.delete('favoritos')
    }
    setParams(next)
  }

  return (
    <div className='flex flex-wrap items-center gap-2' role='group' aria-label='Filtros'>
      {STATUS_ORDER.map((status) => {
        const active = filters.status === status
        return (
          <button
            key={status}
            type='button'
            aria-pressed={active}
            onClick={() => update({ estado: active ? null : STATUS_SLUG[status] })}
            className={chip(active)}
          >
            {getStatusLabel(status, type)}
          </button>
        )
      })}
      <button
        type='button'
        aria-pressed={filters.favorites}
        onClick={() => update({ favoritos: !filters.favorites })}
        className={cn(chip(filters.favorites), 'inline-flex items-center gap-1.5')}
      >
        <Star className='size-4' />
        Solo favoritos
      </button>
      {hasActiveFilters(filters) && (
        <button
          type='button'
          onClick={() => navigate(TYPE_PATH[type])}
          className='rounded-full px-3 py-2 text-sm font-medium text-sakura hover:text-sakura-claro'
        >
          Ver todo
        </button>
      )}
    </div>
  )
}
