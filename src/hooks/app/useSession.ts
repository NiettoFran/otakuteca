import type { Session } from '@supabase/supabase-js'
import { useEffect, useState } from 'react'

import { supabase } from '@/lib'

export const useSession = () => {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionReady, setSessionReady] = useState(false)
  const [admin, setAdmin] = useState<{ userId: string; value: boolean } | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionReady(true)
    })
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setSessionReady(true)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id ?? null

  useEffect(() => {
    if (!userId) return
    let active = true
    supabase.rpc('is_admin').then(({ data }) => {
      if (active) setAdmin({ userId, value: data === true })
    })
    return () => {
      active = false
    }
  }, [userId])

  const adminResolved = userId === null || admin?.userId === userId
  return {
    session,
    isAdmin: userId !== null && admin?.userId === userId && admin.value,
    loading: !sessionReady || !adminResolved,
  }
}
