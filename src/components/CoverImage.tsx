import { useState } from 'react'

import { cn } from '@/lib'

const FALLBACK = '/cover-fallback.svg'

type Props = { src: string; title: string; className?: string }

export const CoverImage = ({ src, title, className }: Props) => {
  const [failed, setFailed] = useState<string | null>(null)
  const current = failed === src ? FALLBACK : src

  return (
    <img
      src={current}
      alt={title}
      loading='lazy'
      decoding='async'
      onError={() => {
        if (current !== FALLBACK) setFailed(src)
      }}
      className={cn('aspect-3/4 w-full object-cover', className)}
    />
  )
}
