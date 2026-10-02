import { ArrowRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router'

type Props = { title: string; to?: string; linkLabel?: string; children: ReactNode }

export const HomeSection = ({ title, to, linkLabel, children }: Props) => (
  <section className='mt-16'>
    <div className='mb-6 flex items-end justify-between gap-4'>
      <h2 className='font-heading text-2xl font-extrabold tracking-tight'>{title}</h2>
      {to && linkLabel && (
        <Link
          to={to}
          className='inline-flex items-center gap-1.5 text-sm font-medium text-sakura hover:text-sakura-claro'
        >
          {linkLabel}
          <ArrowRight aria-hidden className='size-4' />
        </Link>
      )}
    </div>
    {children}
  </section>
)
