import { getProgress, type Work } from '@/lib'

export const ProgressBar = ({ work }: { work: Work }) => {
  const { percent, text } = getProgress(work)
  if (percent === null) return <p className='text-xs text-lavanda'>{text}</p>

  return (
    <div className='space-y-1'>
      <div
        role='progressbar'
        aria-label='Progreso'
        aria-valuenow={work.progress}
        aria-valuemin={0}
        aria-valuemax={work.total_units ?? undefined}
        className='h-1.5 overflow-hidden rounded-full bg-ciruela'
      >
        <div
          className='h-full rounded-full bg-linear-to-r from-magenta to-sakura'
          style={{ width: `${percent}%` }}
        />
      </div>
      <p className='text-xs text-lavanda'>{text}</p>
    </div>
  )
}
