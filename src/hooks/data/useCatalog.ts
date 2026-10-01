import { useCallback, useEffect, useState } from 'react'

import { supabase, type Work } from '@/lib'

export const useCatalog = () => {
  const [works, setWorks] = useState<Work[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    let active = true
    supabase
      .from('works')
      .select('*, genres(id, name)')
      .then(({ data, error }) => {
        if (!active) return
        if (error) setError(true)
        else {
          setError(false)
          setWorks((data ?? []) as Work[])
        }
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])

  return { works, loading, error, reload }
}
