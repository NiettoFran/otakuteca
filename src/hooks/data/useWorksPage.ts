import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { pageRange, supabase, type Work } from '@/lib'

export const worksPageKey = ['works', 'page'] as const

export const useWorksPage = (page: number, pageSize: number) =>
  useQuery({
    queryKey: [...worksPageKey, page, pageSize],
    placeholderData: keepPreviousData,
    queryFn: async () => {
      const { from, to } = pageRange(page, pageSize)
      const { data, error, count } = await supabase
        .from('works')
        .select('*, genres(id, name)', { count: 'exact' })
        .order('is_favorite', { ascending: false })
        .order('updated_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, to)
      if (error) throw error
      return { works: (data ?? []) as Work[], total: count ?? 0 }
    },
  })
