import { useEffect, useState } from 'react'

import { supabase, type Work, type WorkType } from '@/lib'

type State = { key: string; work: Work | null; error: boolean }

export const useWork = (id: string | undefined, type?: WorkType) => {
  const numericId = id && /^\d+$/.test(id) ? Number(id) : null
  const key = `${numericId}:${type ?? ''}`
  const [state, setState] = useState<State | null>(null)

  useEffect(() => {
    if (numericId === null) return
    let active = true
    let query = supabase.from('works').select('*, genres(id, name)').eq('id', numericId)
    if (type) query = query.eq('type', type)
    query.maybeSingle().then(({ data, error }) => {
      if (active)
        setState({ key, work: error ? null : ((data as Work | null) ?? null), error: !!error })
    })
    return () => {
      active = false
    }
  }, [numericId, type, key])

  if (numericId === null) return { work: null, loading: false, error: false, notFound: true }
  if (!state || state.key !== key)
    return { work: null, loading: true, error: false, notFound: false }
  return {
    work: state.work,
    loading: false,
    error: state.error,
    notFound: !state.error && !state.work,
  }
}
