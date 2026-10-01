import type { WorkStatus, WorkType } from '../types'

export const TYPE_LABEL: Record<WorkType, string> = { anime: 'Anime', manga: 'Manga' }

export const TYPE_PATH: Record<WorkType, string> = { anime: '/animes', manga: '/mangas' }

export const getStatusLabel = (status: WorkStatus, type: WorkType) => {
  switch (status) {
    case 'pending':
      return 'Pendiente'
    case 'in_progress':
      return type === 'anime' ? 'Viendo' : 'Leyendo'
    case 'completed':
      return 'Completado'
    case 'dropped':
      return 'Abandonado'
  }
}

export const getUnitLabels = (type: WorkType) =>
  type === 'anime'
    ? { units: 'episodios', parts: 'temporadas', part: 'temporada', done: 'vistos' }
    : { units: 'capítulos', parts: 'tomos', part: 'tomo', done: 'leídos' }

export const STATUS_SLUG: Record<WorkStatus, string> = {
  pending: 'pendiente',
  in_progress: 'en-curso',
  completed: 'completado',
  dropped: 'abandonado',
}

export const SLUG_STATUS: Record<string, WorkStatus> = {
  pendiente: 'pending',
  'en-curso': 'in_progress',
  completado: 'completed',
  abandonado: 'dropped',
}

export const STATUS_ORDER: WorkStatus[] = ['pending', 'in_progress', 'completed', 'dropped']
