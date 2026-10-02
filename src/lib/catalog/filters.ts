import type { Work, WorkStatus } from '../works/types'
import { SLUG_STATUS } from './labels'

export type CatalogFilters = { status: WorkStatus | null; favorites: boolean }

export const parseFilters = (params: URLSearchParams): CatalogFilters => {
  const estado = params.get('estado')
  return {
    status: estado && estado in SLUG_STATUS ? SLUG_STATUS[estado] : null,
    favorites: params.get('favoritos') === '1',
  }
}

export const applyFilters = (works: Work[], filters: CatalogFilters) =>
  works.filter(
    (w) => (!filters.status || w.status === filters.status) && (!filters.favorites || w.is_favorite)
  )

export const hasActiveFilters = (filters: CatalogFilters) =>
  filters.status !== null || filters.favorites
