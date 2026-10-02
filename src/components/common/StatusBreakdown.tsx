import { motion, useReducedMotion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'

import { cn, STATUS_BG, type WorkStatus } from '@/lib'

import { EmptyState } from './EmptyState'

type Segment = { status: WorkStatus; label: string; value: number }

type Props = { title: string; total?: number; segments: Segment[] }

export const StatusBreakdown = ({ title, total, segments }: Props) => {
  const reduced = useReducedMotion()
  const sum = segments.reduce((acc, s) => acc + s.value, 0)

  return (
    <section className='rounded-2xl border border-ciruela bg-abismo p-5'>
      <div className='flex items-baseline justify-between gap-3'>
        <h2 className='font-heading text-lg font-bold'>{title}</h2>
        <p className='text-sm text-lavanda'>
          <span className='font-heading text-xl font-extrabold text-niebla'>{total ?? sum}</span>{' '}
          {(total ?? sum) === 1 ? 'obra' : 'obras'}
        </p>
      </div>
      {sum === 0 ? (
        <div className='mt-4'>
          <EmptyState icon={BarChart3} message='Todavía no hay datos para este gráfico' />
        </div>
      ) : (
        <>
          <div aria-hidden className='mt-4 flex h-4 gap-0.5 overflow-hidden rounded-full'>
            {segments
              .filter((s) => s.value > 0)
              .map((s) => (
                <motion.span
                  key={s.status}
                  initial={reduced ? { opacity: 0 } : { flexGrow: 0 }}
                  animate={reduced ? { opacity: 1 } : { flexGrow: s.value }}
                  style={reduced ? { flexGrow: s.value } : undefined}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={cn('block basis-0', STATUS_BG[s.status])}
                />
              ))}
          </div>
          <ul className='mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm'>
            {segments.map((s) => (
              <li key={s.status} className='flex items-center gap-2'>
                <span
                  aria-hidden
                  className={cn('size-2.5 shrink-0 rounded-full', STATUS_BG[s.status])}
                />
                <span className='truncate text-lavanda'>{s.label}</span>
                <span className='ml-auto font-medium'>{s.value}</span>
                <span className='w-10 text-right text-xs text-niebla/60'>
                  {Math.round((s.value / sum) * 100)}%
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}
