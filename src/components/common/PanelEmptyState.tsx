import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

type Props = { icon: LucideIcon; title: string; children: ReactNode; action: ReactNode }

export const PanelEmptyState = ({ icon: Icon, title, children, action }: Props) => (
  <div className='flex flex-col items-center gap-4 rounded-2xl border border-dashed border-uva bg-abismo/60 px-6 py-20 text-center'>
    <div className='grid size-16 place-items-center rounded-full bg-uva/60'>
      <Icon className='size-8 text-sakura' />
    </div>
    <div className='space-y-1'>
      <h2 className='font-heading text-2xl font-bold'>{title}</h2>
      <p className='text-pretty text-lavanda'>{children}</p>
    </div>
    {action}
  </div>
)
