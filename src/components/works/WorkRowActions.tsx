import { Pencil, Trash2 } from 'lucide-react'
import { Link } from 'react-router'

import { TooltipHint } from '@/components/common'
import { Button, buttonVariants } from '@/components/ui'
import type { Work } from '@/lib'

type Props = { work: Work; onDelete: (work: Work) => void }

export const WorkRowActions = ({ work, onDelete }: Props) => (
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
)
