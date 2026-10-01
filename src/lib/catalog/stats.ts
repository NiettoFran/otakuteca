import type { Work, WorkStatus, WorkType } from '../types'
import { STATUS_ORDER } from './labels'

export const getHomeCounters = (works: Work[]) => ({
  animesWatched: works.filter((w) => w.type === 'anime' && w.status === 'completed').length,
  favorites: works.filter((w) => w.is_favorite).length,
  mangasRead: works.filter((w) => w.type === 'manga' && w.status === 'completed').length,
})

export const NEUTRAL_STATUS_LABEL: Record<WorkStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En curso',
  completed: 'Completado',
  dropped: 'Abandonado',
}

export const countByStatus = (works: Work[]) =>
  STATUS_ORDER.map((status) => ({
    status,
    label: NEUTRAL_STATUS_LABEL[status],
    value: works.filter((w) => w.status === status).length,
  }))

export const countByType = (works: Work[]) =>
  (['anime', 'manga'] as WorkType[]).map((type) => {
    const ofType = works.filter((w) => w.type === type)
    return {
      type,
      total: ofType.length,
      byStatus: STATUS_ORDER.map((status) => ({
        status,
        label: NEUTRAL_STATUS_LABEL[status],
        value: ofType.filter((w) => w.status === status).length,
      })),
    }
  })

export const countByGenre = (works: Work[]) => {
  const counts = new Map<string, number>()
  for (const work of works) {
    const names = work.genres.length ? work.genres.map((g) => g.name) : ['Sin género']
    for (const name of names) counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  return [...counts]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, 'es'))
}
