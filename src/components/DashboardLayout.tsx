import { LogOut } from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'

import { Button } from '@/components/ui'
import { cn, supabase } from '@/lib'

const DASHBOARD_NAV = [
  { label: 'Obras', to: '/dashboard', end: true },
  { label: 'Géneros', to: '/dashboard/generos', end: false },
  { label: 'Ranking', to: '/dashboard/ranking', end: false },
]

export const DashboardLayout = () => {
  const navigate = useNavigate()

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  return (
    <div className='min-h-dvh bg-noche text-niebla'>
      <header className='border-b border-ciruela bg-abismo'>
        <div className='mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6'>
          <nav aria-label='Panel' className='flex flex-wrap items-center gap-1'>
            <span className='mr-3 font-heading font-extrabold'>
              Otaku<span className='text-sakura'>teca</span>
            </span>
            {DASHBOARD_NAV.map(({ label, to, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-sakura text-noche' : 'text-lavanda hover:text-sakura-claro'
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className='flex items-center gap-3'>
            <Link to='/' className='text-sm text-lavanda hover:text-sakura-claro'>
              Ver el sitio
            </Link>
            <Button variant='outline' size='sm' onClick={signOut}>
              <LogOut className='size-4' />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </header>
      <main className='mx-auto max-w-6xl px-4 py-8 sm:px-6'>
        <Outlet />
      </main>
    </div>
  )
}
