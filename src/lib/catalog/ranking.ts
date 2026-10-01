import type { Work } from '../works/types'

export const MAX_RANKING = 10

export const getRanking = (works: Work[]) =>
  works
    .filter((w) => w.type === 'anime' && w.ranking_position !== null)
    .sort((a, b) => a.ranking_position! - b.ranking_position!)
    .slice(0, MAX_RANKING)

export const getRankableAnimes = (works: Work[]) =>
  works.filter((w) => w.type === 'anime' && w.is_favorite && w.ranking_position === null)
