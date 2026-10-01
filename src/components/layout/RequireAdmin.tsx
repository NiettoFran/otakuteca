import { useState } from 'react'
import { Navigate, Outlet } from 'react-router'

import { useSession } from '@/hooks'

// Decide solo al entrar. Una vez admitido, perder la sesión no redirige: cada página
// resuelve la falta de sesión al guardar (FR-015).
export const RequireAdmin = () => {
  const { isAdmin, loading } = useSession()
  const [admitted, setAdmitted] = useState(false)

  if (admitted) return <Outlet />
  if (loading) return <p className='py-24 text-center text-lavanda'>Cargando…</p>
  if (!isAdmin) return <Navigate to='/' replace />
  setAdmitted(true)
  return <Outlet />
}
