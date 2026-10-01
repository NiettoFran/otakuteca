import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = { message: string; icon?: LucideIcon; children?: ReactNode }

export const EmptyState = ({ message, icon: Icon, children }: Props) => (
  <div className='mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed border-ciruela bg-abismo/60 px-6 py-12 text-center'>
    {Icon && (
      <div className='grid size-12 place-items-center rounded-full bg-uva/60'>
        <Icon className='size-6 text-lavanda' />
      </div>
    )}
    <p className='text-lg text-pretty text-lavanda'>{message}</p>
    {children}
  </div>
)
