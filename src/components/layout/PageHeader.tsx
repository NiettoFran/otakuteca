import type { ReactNode } from 'react'

type Props = { title: string; description: string; children?: ReactNode }

export const PageHeader = ({ title, description, children }: Props) => (
  <header className='flex flex-col items-center gap-3 text-center'>
    <h1 className='font-heading text-3xl font-extrabold'>{title}</h1>
    <p className='max-w-xl text-pretty text-lavanda'>{description}</p>
    {children}
  </header>
)
