import { CloudOff, RotateCw } from 'lucide-react'

import { Button } from '@/components/ui'

type Props = { what: string; onRetry?: () => void }

export const ErrorState = ({ what, onRetry }: Props) => (
  <div
    role='alert'
    className='mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-dashed border-magenta/50 bg-abismo/60 px-6 py-12 text-center'
  >
    <div className='grid size-14 place-items-center rounded-full bg-magenta/20'>
      <CloudOff aria-hidden className='size-7 text-sakura' />
    </div>
    <div className='space-y-1'>
      <h2 className='font-heading text-xl font-bold'>No pudimos cargar {what}</h2>
      <p className='text-pretty text-lavanda'>Revisá tu conexión y probá de nuevo.</p>
    </div>
    <Button onClick={onRetry ?? (() => window.location.reload())} className='rounded-full px-6'>
      <RotateCw className='size-4' />
      Reintentar
    </Button>
  </div>
)
