import { motion, useReducedMotion } from 'framer-motion'
import { BarChart3 } from 'lucide-react'

import { EmptyState } from './EmptyState'

type Item = { label: string; value: number; colorClass: string }

export const BarChart = ({ title, items }: { title: string; items: Item[] }) => {
  const reduced = useReducedMotion()
  const max = Math.max(0, ...items.map((i) => i.value))

  return (
    <section className='rounded-2xl border border-ciruela bg-abismo p-5'>
      <h2 className='font-heading text-lg font-bold'>{title}</h2>
      {max === 0 ? (
        <div className='mt-4'>
          <EmptyState icon={BarChart3} message='Todavía no hay datos para este gráfico' />
        </div>
      ) : (
        <ul className='mt-4 space-y-3'>
          {items.map(({ label, value, colorClass }) => (
            <li
              key={label}
              aria-label={`${label}: ${value} ${value === 1 ? 'obra' : 'obras'}`}
              className='grid grid-cols-[minmax(0,7rem)_1fr_2rem] items-center gap-3 text-sm sm:grid-cols-[minmax(0,9rem)_1fr_2rem]'
            >
              <span className='truncate text-lavanda' aria-hidden>
                {label}
              </span>
              <span aria-hidden className='h-3 overflow-hidden rounded-full bg-ciruela'>
                <motion.span
                  initial={reduced ? { opacity: 0 } : { width: 0 }}
                  animate={reduced ? { opacity: 1 } : { width: `${(value / max) * 100}%` }}
                  style={reduced ? { width: `${(value / max) * 100}%` } : undefined}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className={`block h-full rounded-full ${colorClass}`}
                />
              </span>
              <span aria-hidden className='text-right font-medium'>
                {value}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
