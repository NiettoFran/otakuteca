import { Eraser, Search, Star } from 'lucide-react'

import { TooltipHint } from '@/components/common'
import {
  Button,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { useGenres } from '@/hooks'
import {
  cn,
  hasDashboardFilters,
  NEUTRAL_STATUS_LABEL,
  STATUS_ORDER,
  TYPE_LABEL,
  type DashboardFilters,
} from '@/lib'

type Props = {
  filters: DashboardFilters
  onChange: (changes: Partial<DashboardFilters>) => void
  onClear: () => void
}

export const WorksFilters = ({ filters, onChange, onClear }: Props) => {
  const { genres } = useGenres()

  return (
    <div
      className='grid grid-cols-2 gap-3 rounded-2xl border border-ciruela bg-abismo p-3 sm:flex sm:flex-wrap sm:items-center'
      role='search'
    >
      <div className='relative col-span-2 min-w-0 sm:min-w-64 sm:flex-1'>
        <Search className='pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-lavanda' />
        <Input
          type='search'
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder='Buscá por título…'
          aria-label='Buscar obras por título'
          className='h-9 pl-9'
        />
      </div>
      <Select
        value={filters.type}
        onValueChange={(v) => onChange({ type: v as DashboardFilters['type'] })}
      >
        <SelectTrigger aria-label='Filtrar por tipo' className='h-9 w-full sm:w-40'>
          <SelectValue>
            {(v: string) => (v === 'all' ? 'Todos los tipos' : TYPE_LABEL[v as 'anime' | 'manga'])}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>Todos los tipos</SelectItem>
          <SelectItem value='anime'>{TYPE_LABEL.anime}</SelectItem>
          <SelectItem value='manga'>{TYPE_LABEL.manga}</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.status}
        onValueChange={(v) => onChange({ status: v as DashboardFilters['status'] })}
      >
        <SelectTrigger aria-label='Filtrar por estado' className='h-9 w-full sm:w-44'>
          <SelectValue>
            {(v: string) =>
              v === 'all'
                ? 'Todos los estados'
                : NEUTRAL_STATUS_LABEL[v as keyof typeof NEUTRAL_STATUS_LABEL]
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>Todos los estados</SelectItem>
          {STATUS_ORDER.map((status) => (
            <SelectItem key={status} value={status}>
              {NEUTRAL_STATUS_LABEL[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.genreId === null ? 'all' : String(filters.genreId)}
        onValueChange={(v) => onChange({ genreId: v === 'all' ? null : Number(v) })}
      >
        <SelectTrigger
          aria-label='Filtrar por género'
          className='col-span-2 h-9 w-full sm:col-span-1 sm:w-48'
        >
          <SelectValue>
            {(v: string) =>
              v === 'all'
                ? 'Todos los géneros'
                : (genres.find((g) => String(g.id) === v)?.name ?? 'Género')
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>Todos los géneros</SelectItem>
          {genres.map((genre) => (
            <SelectItem key={genre.id} value={String(genre.id)}>
              {genre.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <TooltipHint label='Mostrar solo las obras marcadas como favoritas'>
        <button
          type='button'
          aria-pressed={filters.favorites}
          onClick={() => onChange({ favorites: !filters.favorites })}
          className={cn(
            'inline-flex h-9 items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none',
            filters.favorites
              ? 'border-sakura bg-sakura text-noche'
              : 'border-ciruela bg-abismo text-lavanda hover:text-sakura-claro'
          )}
        >
          <Star className='size-4' />
          Solo favoritas
        </button>
      </TooltipHint>
      {hasDashboardFilters(filters) && (
        <TooltipHint label='Quitar la búsqueda y todos los filtros'>
          <Button
            variant='ghost'
            onClick={onClear}
            className='h-9 text-sakura hover:text-sakura-claro'
          >
            <Eraser className='size-4' />
            Limpiar filtros
          </Button>
        </TooltipHint>
      )}
    </div>
  )
}
