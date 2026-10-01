import { Badge } from '@/components/ui'
import { cn, getStatusLabel, type WorkStatus, type WorkType } from '@/lib'

const STATUS_CLASS: Record<WorkStatus, string> = {
  pending: 'bg-ciruela text-niebla/70 ring-1 ring-uva',
  in_progress: 'bg-lavanda/10 text-lavanda ring-1 ring-lavanda/30',
  completed: 'bg-cian/10 text-cian ring-1 ring-cian/30',
  dropped: 'bg-magenta/15 text-sakura ring-1 ring-magenta/40',
}

type Props = { status: WorkStatus; type: WorkType }

export const StatusBadge = ({ status, type }: Props) => (
  <Badge variant='outline' className={cn('border-transparent', STATUS_CLASS[status])}>
    {getStatusLabel(status, type)}
  </Badge>
)
