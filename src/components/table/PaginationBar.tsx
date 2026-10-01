import { ChevronLeft, ChevronRight } from 'lucide-react'

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
    <div className='flex flex-wrap items-center justify-end gap-3 text-sm text-lavanda'>
      <div className='flex flex-wrap items-center gap-3'>
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
        <div className='flex items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label='Página anterior'
          >
            <ChevronLeft className='size-4' />
          </Button>
          <span>
            {page} / {pageCount}
          </span>
          <Button
            variant='outline'
            size='sm'
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            aria-label='Página siguiente'
          >
            <ChevronRight className='size-4' />
          </Button>
        </div>
      </div>
    </div>
  )
}
