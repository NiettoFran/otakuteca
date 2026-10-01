import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { pageRange, supabase, type DashboardFilters, type Work } from '@/lib'

export const worksPageKey = ['works', 'page'] as const

// Escapa los comodines de LIKE para que la búsqueda sea literal.
const escapeLike = (text: string) => text.replace(/[\\%_]/g, '\\$&')

export const useWorksPage = (page: number, pageSize: number, filters: DashboardFilters) =>
  useQuery({
    queryKey: [...worksPageKey, page, pageSize, filters],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { from, to } = pageRange(page, pageSize)
      const { search, type, status, genreId, favorites } = filters
      // `!inner` filtra las obras por género; solo se usa cuando hay un género elegido.
      const genres = genreId === null ? 'genres(id, name)' : 'genres!inner(id, name)'
      let query = supabase.from('works').select(`*, ${genres}`, { count: 'exact' })
      if (search.trim()) query = query.ilike('title', `%${escapeLike(search.trim())}%`)
      if (type !== 'all') query = query.eq('type', type)
      if (status !== 'all') query = query.eq('status', status)
      if (genreId !== null) query = query.eq('genres.id', genreId)
      if (favorites) query = query.eq('is_favorite', true)
      const { data, error, count } = await query
        .order('is_favorite', { ascending: false })
        .order('updated_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, to)
      if (error) throw error
      return { works: (data ?? []) as Work[], total: count ?? 0 }
    },
  })
