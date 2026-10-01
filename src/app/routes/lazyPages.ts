import { lazy } from 'react'

export const LoginPage = lazy(() => import('@/pages/auth').then((m) => ({ default: m.LoginPage })))
export const DashboardHome = lazy(() =>
  import('@/pages/dashboard').then((m) => ({ default: m.DashboardHome }))
)
export const WorkEditPage = lazy(() =>
  import('@/pages/dashboard').then((m) => ({ default: m.WorkEditPage }))
)
export const GenresPage = lazy(() =>
  import('@/pages/dashboard').then((m) => ({ default: m.GenresPage }))
)
export const RankingEditorPage = lazy(() =>
  import('@/pages/dashboard').then((m) => ({ default: m.RankingEditorPage }))
)
