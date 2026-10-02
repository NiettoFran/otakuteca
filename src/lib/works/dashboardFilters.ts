import type { WorkStatus, WorkType } from './types'

export type DashboardFilters = {
  search: string
  type: WorkType | 'all'
  status: WorkStatus | 'all'
  genreId: number | null
  favorites: boolean
}

export const EMPTY_DASHBOARD_FILTERS: DashboardFilters = {
  search: '',
  type: 'all',
  status: 'all',
  genreId: null,
  favorites: false,
}

export const hasDashboardFilters = (filters: DashboardFilters) =>
  filters.search.trim() !== '' ||
  filters.type !== 'all' ||
  filters.status !== 'all' ||
  filters.genreId !== null ||
  filters.favorites
