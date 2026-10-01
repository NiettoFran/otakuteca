import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router'

import { DashboardLayout, PublicLayout, RequireAdmin } from '@/components'
import {
  CatalogPage,
  Home,
  NotFoundPage,
  PendingPage,
  RankingPage,
  RoulettePage,
  StatsPage,
  WorkPage,
} from '@/pages'

const LoginPage = lazy(() => import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })))
const DashboardHome = lazy(() =>
  import('@/pages/dashboard').then((m) => ({ default: m.DashboardHome }))
)
const WorkEditPage = lazy(() =>
  import('@/pages/dashboard').then((m) => ({ default: m.WorkEditPage }))
)
const GenresPage = lazy(() => import('@/pages/dashboard').then((m) => ({ default: m.GenresPage })))
const RankingEditorPage = lazy(() =>
  import('@/pages/dashboard').then((m) => ({ default: m.RankingEditorPage }))
)

const Loading = () => <p className='py-24 text-center text-lavanda'>Cargando…</p>

export const OtakutecaApp = () => (
  <Suspense fallback={<Loading />}>
    <Routes>
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path='animes' element={<CatalogPage type='anime' />} />
        <Route path='animes/:id' element={<WorkPage type='anime' />} />
        <Route path='mangas' element={<CatalogPage type='manga' />} />
        <Route path='mangas/:id' element={<WorkPage type='manga' />} />
        <Route path='ranking' element={<RankingPage />} />
        <Route path='estadisticas' element={<StatsPage />} />
        <Route path='pendientes' element={<PendingPage />} />
        <Route path='ruleta' element={<RoulettePage />} />
        <Route path='*' element={<NotFoundPage />} />
      </Route>
      <Route path='login' element={<LoginPage />} />
      <Route path='dashboard' element={<RequireAdmin />}>
        <Route element={<DashboardLayout />}>
          <Route index element={<DashboardHome />} />
          <Route path='obras/nueva' element={<WorkEditPage />} />
          <Route path='obras/:id' element={<WorkEditPage />} />
          <Route path='generos' element={<GenresPage />} />
          <Route path='ranking' element={<RankingEditorPage />} />
          <Route path='*' element={<Navigate to='/dashboard' replace />} />
        </Route>
      </Route>
    </Routes>
  </Suspense>
)
