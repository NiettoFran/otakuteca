import { Route } from 'react-router'

import { PublicLayout } from '@/components'
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

export const publicRoutes = (
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
)
