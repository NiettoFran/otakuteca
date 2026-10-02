import {
  motion,
  MotionConfig,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
} from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router'

import { useMotionSet } from '@/hooks'
import { cn, PUBLIC_NAV, SPRING } from '@/lib'

const BRAND_GRADIENT_X = 'bg-linear-to-r from-violeta via-magenta via-55% to-sakura'

const isSectionActive = (to: string, pathname: string) =>
  to === '/' ? pathname === '/' : pathname === to || pathname.startsWith(`${to}/`)

export const PublicLayout = () => {
  const m = useMotionSet()
  const reduced = useReducedMotion()
  const { pathname } = useLocation()
  const [compact, setCompact] = useState(false)
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

  const { scrollY, scrollYProgress } = useScroll()
  useMotionValueEvent(scrollY, 'change', (y) => setCompact(y > 40))
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 200, damping: 30 })

  return (
    <MotionConfig transition={SPRING} reducedMotion='user'>
      <div className='flex min-h-dvh flex-col bg-noche text-niebla'>
        <motion.div
          aria-hidden
          style={{ scaleX: reduced ? scrollYProgress : smoothProgress }}
          className={`fixed inset-x-0 top-0 z-60 h-0.5 origin-left ${BRAND_GRADIENT_X}`}
        />

        <motion.header
          variants={m.header}
          initial='hidden'
          animate='visible'
          className='fixed inset-x-0 top-0 z-50'
        >
          <motion.div
            aria-hidden
            variants={m.headerBg}
            initial={false}
            animate={compact || menuOpen ? 'compact' : 'top'}
            className='absolute inset-0 origin-top border-b border-ciruela bg-noche/80 backdrop-blur-md'
          />
          {menuOpen && (
            <button
              type='button'
              aria-hidden
              tabIndex={-1}
              onClick={() => setMenuPath(null)}
              className='absolute inset-x-0 top-full h-dvh cursor-default lg:hidden'
            />
          )}
          {menuOpen && (
            <div
              aria-hidden
              className='absolute inset-0 border-b border-ciruela bg-noche/95 backdrop-blur-md lg:hidden'
            />
          )}
          <motion.div
            variants={m.headerRow}
            initial={false}
            animate={compact ? 'compact' : 'top'}
            className='relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6'
          >
            <motion.div initial='hidden' animate='visible' whileHover='hover'>
              <Link to='/' className='flex items-center gap-2.5'>
                <motion.img
                  variants={m.logo}
                  src='/otakuteca-icono.svg'
                  alt=''
                  className='size-10'
                />
                <span className='font-heading text-xl font-extrabold tracking-tight'>
                  <span className='text-niebla'>Otaku</span>
                  <span className='text-sakura'>teca</span>
                </span>
              </Link>
            </motion.div>

            <nav aria-label='Principal' className='hidden items-center gap-1 lg:flex'>
              {PUBLIC_NAV.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={cn(
                    'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none',
                    isSectionActive(to, pathname)
                      ? 'bg-sakura text-noche'
                      : 'text-lavanda hover:text-sakura-claro'
                  )}
                >
                  <Icon className='size-4' aria-hidden />
                  {label}
                </NavLink>
              ))}
            </nav>

            <button
              type='button'
              aria-expanded={menuOpen}
              aria-controls='menu-movil'
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMenuPath(menuOpen ? null : pathname)}
              className='grid size-10 place-items-center rounded-full text-niebla hover:text-sakura-claro focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none lg:hidden'
            >
              {menuOpen ? <X className='size-6' /> : <Menu className='size-6' />}
            </button>
          </motion.div>

          {menuOpen && (
            <motion.nav
              id='menu-movil'
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              aria-label='Principal'
              className='relative mx-auto flex max-w-6xl flex-col gap-1 px-4 pb-4 lg:hidden'
            >
              {PUBLIC_NAV.map(({ label, to, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={cn(
                    'flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-base font-medium transition-colors',
                    isSectionActive(to, pathname)
                      ? 'bg-sakura text-noche'
                      : 'text-lavanda hover:bg-ciruela/60 hover:text-sakura-claro'
                  )}
                >
                  <Icon className='size-4' aria-hidden />
                  {label}
                </NavLink>
              ))}
            </motion.nav>
          )}
        </motion.header>

        <main className='mx-auto w-full max-w-6xl flex-1 px-4 pt-16 sm:px-6'>
          <Outlet />
        </main>

        <footer className='mt-20 border-t border-ciruela py-8 text-center text-sm text-lavanda'>
          <span className='font-heading font-bold'>
            Otaku<span className='text-sakura'>teca</span>
          </span>{' '}
          · hecho por Francisco Nieto
        </footer>
      </div>
    </MotionConfig>
  )
}
