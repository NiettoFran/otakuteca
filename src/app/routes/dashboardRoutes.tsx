import { Navigate, Route } from 'react-router'

import { DashboardLayout, RequireAdmin } from '@/components'

import { DashboardHome, GenresPage, RankingEditorPage, WorkEditPage } from './lazyPages'

export const dashboardRoutes = (
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
)
