import { ChevronLeft, ChevronRight } from 'lucide-react'

import { TooltipHint } from '@/components/common'
import {
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui'
import { PAGE_SIZE_OPTIONS } from '@/lib'

type Props = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export const PaginationBar = ({ page, pageSize, total, onPageChange, onPageSizeChange }: Props) => {
  const pageCount = Math.max(1, Math.ceil(total / pageSize))

  return (
    <div className='flex flex-wrap items-center justify-between gap-3 text-sm text-lavanda sm:justify-end'>
      <div className='flex w-full flex-wrap items-center justify-between gap-3 sm:w-auto'>
        <label className='flex items-center gap-2'>
          Por página
          <Select value={String(pageSize)} onValueChange={(v) => onPageSizeChange(Number(v))}>
            <SelectTrigger size='sm' aria-label='Filas por página'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
        <div className='flex w-full items-center justify-between gap-2 sm:w-auto sm:justify-start'>
          <TooltipHint label='Ir a la página anterior'>
            <Button
              variant='outline'
              size='sm'
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <ChevronLeft className='size-4' />
              Anterior
            </Button>
          </TooltipHint>
          <span>
            {page} / {pageCount}
          </span>
          <TooltipHint label='Ir a la página siguiente'>
            <Button
              variant='outline'
              size='sm'
              disabled={page >= pageCount}
              onClick={() => onPageChange(page + 1)}
            >
              Siguiente
              <ChevronRight className='size-4' />
            </Button>
          </TooltipHint>
        </div>
      </div>
    </div>
  )
}
