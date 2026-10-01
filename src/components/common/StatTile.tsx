import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib'

type Props = { icon: LucideIcon; label: string; value: string; accentClass: string }

export const StatTile = ({ icon: Icon, label, value, accentClass }: Props) => (
  <div className='flex items-center gap-4 rounded-2xl border border-ciruela bg-abismo p-4'>
    <span
      aria-hidden
      className={cn('grid size-11 shrink-0 place-items-center rounded-xl bg-ciruela', accentClass)}
    >
      <Icon className='size-5' />
    </span>
    <div className='min-w-0'>
      <p className='font-heading text-2xl leading-none font-extrabold'>{value}</p>
      <p className='mt-1 truncate text-sm text-lavanda'>{label}</p>
    </div>
  </div>
)
