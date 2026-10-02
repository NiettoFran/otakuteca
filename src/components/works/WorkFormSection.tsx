import type { ReactNode } from 'react'

type Props = { title: string; children: ReactNode }

export const WorkFormSection = ({ title, children }: Props) => (
  <section className='space-y-4 rounded-2xl border border-ciruela bg-abismo p-5'>
    <h2 className='font-heading text-lg font-bold'>{title}</h2>
    {children}
  </section>
)
