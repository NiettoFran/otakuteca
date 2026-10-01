import { useCallback, useEffect, useState } from 'react'

import { supabase, type Genre } from '@/lib'

export const useGenres = () => {
  const [genres, setGenres] = useState<Genre[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    supabase
      .from('genres')
      .select('id, name')
      .order('name')
      .then(({ data, error }) => {
        if (!active) return
        if (error) setError(true)
        else {
          setError(false)
          setGenres(data ?? [])
        }
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  return { genres, loading, error, reload }
}
