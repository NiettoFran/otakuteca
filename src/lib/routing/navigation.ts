import { BookOpen, ChartColumn, Clock, Dices, House, Trophy, Tv } from 'lucide-react'

export const PUBLIC_NAV = [
  { label: 'Inicio', to: '/', icon: House },
  { label: 'Animes', to: '/animes', icon: Tv },
  { label: 'Mangas', to: '/mangas', icon: BookOpen },
  { label: 'Ranking', to: '/ranking', icon: Trophy },
  { label: 'Estadísticas', to: '/estadisticas', icon: ChartColumn },
  { label: 'Pendientes', to: '/pendientes', icon: Clock },
  { label: 'Ruleta', to: '/ruleta', icon: Dices },
] as const
