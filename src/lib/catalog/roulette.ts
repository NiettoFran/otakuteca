import type { Work, WorkType } from '../works/types'

export const pickRandomPending = (works: Work[], type: WorkType, previousId: number | null) => {
  const candidates = works.filter((w) => w.status === 'pending' && w.type === type)
  const pool = candidates.length > 1 ? candidates.filter((w) => w.id !== previousId) : candidates
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)]
}
