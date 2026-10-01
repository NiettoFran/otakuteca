import type { Work } from '../types'

export const sortWorks = (works: Work[]) =>
  [...works].sort((a, b) => {
    if (a.is_favorite !== b.is_favorite) return a.is_favorite ? -1 : 1
    return b.updated_at.localeCompare(a.updated_at)
  })
