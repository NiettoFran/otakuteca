import { ExternalLink, Library, LogOut, Menu, Tags, Trophy, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'

import { Button, TooltipProvider } from '@/components/ui'
import { cn, supabase } from '@/lib'

const DASHBOARD_NAV = [
  { label: 'Obras', to: '/dashboard', end: true, icon: Library },
  { label: 'Géneros', to: '/dashboard/generos', end: false, icon: Tags },
  { label: 'Ranking', to: '/dashboard/ranking', end: false, icon: Trophy },
]

const SITE_LINK_CLASS =
  'inline-flex items-center gap-1.5 text-sm text-lavanda hover:text-sakura-claro'

export const DashboardLayout = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [menuPath, setMenuPath] = useState<string | null>(null)
  const menuOpen = menuPath === pathname

  useEffect(() => {
    if (!menuOpen) return
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuPath(null)
    }
    window.addEventListener('keydown', close)
    return () => window.removeEventListener('keydown', close)
  }, [menuOpen])

  const signOut = async () => {
    await supabase.auth.signOut()
    navigate('/', { replace: true })
  }

  const navLinkClass = (isActive: boolean, mobile: boolean) =>
    cn(
      'inline-flex items-center gap-2 rounded-full text-sm font-medium transition-colors',
      mobile ? 'rounded-xl px-4 py-2.5 text-base' : 'gap-1.5 px-3 py-1.5',
      isActive
        ? 'bg-sakura text-noche'
        : mobile
          ? 'text-lavanda hover:bg-ciruela/60 hover:text-sakura-claro'
          : 'text-lavanda hover:text-sakura-claro'
    )

  return (
    <div className='min-h-dvh bg-noche text-niebla'>
      <header className='relative border-b border-ciruela bg-abismo'>
        <div className='mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6'>
          <span className='font-heading font-extrabold sm:mr-3'>
            Otaku<span className='text-sakura'>teca</span>
          </span>
          <nav aria-label='Panel' className='hidden flex-1 items-center gap-1 sm:flex'>
            {DASHBOARD_NAV.map(({ label, to, end, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) => navLinkClass(isActive, false)}
              >
                <Icon className='size-4' />
                {label}
              </NavLink>
            ))}
          </nav>
          <div className='hidden items-center gap-3 sm:flex'>
            <Link to='/' target='_blank' rel='noopener noreferrer' className={SITE_LINK_CLASS}>
              <ExternalLink className='size-4' />
              Ver el sitio
            </Link>
            <Button variant='outline' size='sm' onClick={signOut}>
              <LogOut className='size-4' />
              Cerrar sesión
            </Button>
          </div>
          <button
            type='button'
            aria-expanded={menuOpen}
            aria-controls='menu-panel'
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuPath(menuOpen ? null : pathname)}
            className='grid size-10 place-items-center rounded-full text-niebla hover:text-sakura-claro focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none sm:hidden'
          >
            {menuOpen ? <X className='size-6' /> : <Menu className='size-6' />}
          </button>
        </div>

        {menuOpen && (
          <>
            <button
              type='button'
              aria-hidden
              tabIndex={-1}
              onClick={() => setMenuPath(null)}
              className='absolute inset-x-0 top-full z-40 h-dvh cursor-default sm:hidden'
            />
            <nav
              id='menu-panel'
              aria-label='Panel'
              className='absolute inset-x-0 top-full z-50 flex flex-col gap-1 border-b border-ciruela bg-abismo px-4 pt-1 pb-4 sm:hidden'
            >
              {DASHBOARD_NAV.map(({ label, to, end, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) => navLinkClass(isActive, true)}
                >
                  <Icon className='size-4' />
                  {label}
                </NavLink>
              ))}
              <div className='mt-2 flex flex-col gap-3 border-t border-ciruela pt-4'>
                <Link
                  to='/'
                  target='_blank'
                  rel='noopener noreferrer'
                  className={cn(SITE_LINK_CLASS, 'px-4')}
                >
                  <ExternalLink className='size-4' />
                  Ver el sitio
                </Link>
                <Button variant='outline' onClick={signOut}>
                  <LogOut className='size-4' />
                  Cerrar sesión
                </Button>
              </div>
            </nav>
          </>
        )}
      </header>
      <main className='mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8'>
        <TooltipProvider delay={400}>
          <Outlet />
        </TooltipProvider>
      </main>
    </div>
  )
}
