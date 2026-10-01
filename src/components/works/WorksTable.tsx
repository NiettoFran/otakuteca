import { Pencil, Star, Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import { TooltipHint } from '@/components/common'
import { Button, buttonVariants } from '@/components/ui'
import { TYPE_LABEL, type Work } from '@/lib'

import { StatusBadge } from './StatusBadge'

type Props = { works: Work[]; onDelete: (work: Work) => void }

export const WorksTable = ({ works, onDelete }: Props) => (
  <div className='overflow-x-auto rounded-2xl border border-ciruela bg-abismo'>
    <table className='w-full table-fixed text-left text-sm'>
      <thead className='border-b border-uva bg-ciruela/60 text-xs tracking-wider text-lavanda uppercase'>
        <tr>
          <th className='p-4 font-semibold'>Título</th>
          <th className='hidden w-28 p-4 font-semibold sm:table-cell'>Tipo</th>
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
                {work.is_favorite && (
                  <Star className='size-4 shrink-0 fill-dorado text-dorado' aria-label='Favorita' />
                )}
              </span>
            </td>
            <td className='hidden p-4 text-lavanda sm:table-cell'>{TYPE_LABEL[work.type]}</td>
            <td className='p-4'>
              <StatusBadge status={work.status} type={work.type} />
            </td>
            <td className='p-4'>
              <div className='flex justify-end gap-2'>
                <TooltipHint label={`Editar «${work.title}»`}>
                  <Link
                    to={`/dashboard/obras/${work.id}`}
                    className={buttonVariants({ variant: 'outline', size: 'sm' })}
                  >
                    <Pencil />
                    Editar
                  </Link>
                </TooltipHint>
                <TooltipHint label={`Eliminar «${work.title}»`}>
                  <Button variant='destructive' size='sm' onClick={() => onDelete(work)}>
                    <Trash2 />
                    Eliminar
                  </Button>
                </TooltipHint>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)
