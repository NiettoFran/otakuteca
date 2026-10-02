import { Star } from 'lucide-react'

import { TYPE_LABEL, type Work } from '@/lib'

import { StatusBadge } from './StatusBadge'
import { WorkRowActions } from './WorkRowActions'

type Props = { works: Work[]; onDelete: (work: Work) => void }

const FavoriteStar = () => (
  <Star className='size-4 shrink-0 fill-dorado text-dorado' aria-label='Favorita' />
)

export const WorksTable = ({ works, onDelete }: Props) => (
  <>
    <ul className='divide-y divide-ciruela overflow-hidden rounded-2xl border border-ciruela bg-abismo md:hidden'>
      {works.map((work) => (
        <li key={work.id} className='space-y-3 p-4'>
          <div className='flex items-start justify-between gap-3'>
            <p className='min-w-0 font-medium break-words'>{work.title}</p>
            {work.is_favorite && <FavoriteStar />}
          </div>
          <div className='flex flex-wrap items-center gap-x-3 gap-y-2'>
            <span className='text-sm text-lavanda'>{TYPE_LABEL[work.type]}</span>
            <StatusBadge status={work.status} type={work.type} />
          </div>
          <WorkRowActions work={work} onDelete={onDelete} />
        </li>
      ))}
    </ul>
    <div className='hidden overflow-x-auto rounded-2xl border border-ciruela bg-abismo md:block'>
      <table className='w-full table-fixed text-left text-sm'>
        <thead className='border-b border-uva bg-ciruela/60 text-xs tracking-wider text-lavanda uppercase'>
          <tr>
            <th className='p-4 font-semibold'>Título</th>
            <th className='w-28 p-4 font-semibold'>Tipo</th>
            <th className='w-36 p-4 font-semibold'>Estado</th>
            <th className='w-56 p-4 text-right font-semibold'>Acciones</th>
          </tr>
        </thead>
        <tbody className='divide-y divide-ciruela'>
          {works.map((work) => (
            <tr key={work.id} className='hover:bg-ciruela/30'>
              <td className='p-4'>
                <span className='flex min-w-0 items-center gap-2 font-medium'>
                  <span className='truncate' title={work.title}>
                    {work.title}
                  </span>
                  {work.is_favorite && <FavoriteStar />}
                </span>
              </td>
              <td className='p-4 text-lavanda'>{TYPE_LABEL[work.type]}</td>
              <td className='p-4'>
                <StatusBadge status={work.status} type={work.type} />
              </td>
              <td className='p-4'>
                <WorkRowActions work={work} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </>
)
