export type WorkType = 'anime' | 'manga'
export type WorkStatus = 'pending' | 'in_progress' | 'completed' | 'dropped'

export type Genre = { id: number; name: string }

export type Work = {
  id: number
  title: string
  type: WorkType
  status: WorkStatus
  cover_url: string
  short_review: string | null
  long_review: string | null
  parts: number | null
  total_units: number | null
  progress: number
  rating: number | null
  is_favorite: boolean
  ranking_position: number | null
  created_at: string
  updated_at: string
  genres: Genre[]
}

export type WorkFormValues = {
  title: string
  type: WorkType
  status: WorkStatus | ''
  cover_url: string
  short_review: string
  long_review: string
  parts: string
  total_units: string
  progress: string
  rating: number | null
  is_favorite: boolean
  genreIds: number[]
}

export type WorkPayload = {
  title: string
  type: WorkType
  status: WorkStatus
  cover_url: string
  short_review: string | null
  long_review: string | null
  parts: number | null
  total_units: number | null
  progress: number
  rating: number | null
  is_favorite: boolean
}
