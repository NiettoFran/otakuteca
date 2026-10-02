import { Suspense } from 'react'
import { Routes } from 'react-router'

import { PageLoading } from '@/components'

import { authRoutes } from './authRoutes'
import { dashboardRoutes } from './dashboardRoutes'
import { publicRoutes } from './publicRoutes'

export const AppRoutes = () => (
  <Suspense fallback={<PageLoading />}>
    <Routes>
      {publicRoutes}
      {authRoutes}
      {dashboardRoutes}
    </Routes>
  </Suspense>
)
