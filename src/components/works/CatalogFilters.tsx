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
  type WorkStatus,
  type WorkType,
} from '@/lib'

const chip = (active: boolean) =>
  cn(
    'rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none',
    active
      ? 'border-sakura bg-sakura text-noche'
      : 'border-ciruela bg-abismo text-lavanda hover:text-sakura-claro'
  )

type Props = { type: WorkType; counts: { status: WorkStatus; value: number }[] }

export const CatalogFilters = ({ type, counts }: Props) => {
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
    <div
      className='flex flex-wrap items-center justify-center gap-2'
      role='group'
      aria-label='Filtros'
    >
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
            <span className={cn('ml-2 text-xs', active ? 'text-noche/70' : 'text-niebla/50')}>
              {counts.find((c) => c.status === status)?.value ?? 0}
            </span>
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
