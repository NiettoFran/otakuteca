import { Star, StarHalf } from 'lucide-react'

import { cn } from '@/lib'

type Props = { rating: number | null; onChange?: (rating: number | null) => void }

const formatRating = (rating: number) => String(rating).replace('.', ',')

const ReadOnlyStars = ({ rating }: { rating: number | null }) => {
  if (rating === null) return <span className='text-sm text-lavanda'>Sin calificar</span>
  return (
    <span
      role='img'
      aria-label={`${formatRating(rating)} de 5 estrellas`}
      className='inline-flex items-center gap-0.5'
    >
      {[1, 2, 3, 4, 5].map((n) => {
        if (rating >= n)
          return <Star key={n} aria-hidden className='size-4 fill-dorado text-dorado' />
        if (rating >= n - 0.5)
          return (
            <span key={n} aria-hidden className='relative size-4'>
              <Star className='absolute inset-0 size-4 text-dorado/30' />
              <StarHalf className='absolute inset-0 size-4 fill-dorado text-dorado' />
            </span>
          )
        return <Star key={n} aria-hidden className='size-4 text-dorado/30' />
      })}
    </span>
  )
}

const STEPS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5]

const EditableStars = ({ rating, onChange }: Required<Props>) => (
  <div className='flex flex-wrap items-center gap-2'>
    <div role='radiogroup' aria-label='Calificación' className='flex flex-wrap gap-1'>
      {STEPS.map((step) => (
        <button
          key={step}
          type='button'
          role='radio'
          aria-checked={rating === step}
          aria-label={`${formatRating(step)} de 5 estrellas`}
          onClick={() => onChange(step)}
          className={cn(
            'rounded-md border px-2 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none',
            rating === step
              ? 'border-dorado bg-dorado text-noche'
              : 'border-ciruela text-lavanda hover:border-dorado hover:text-dorado'
          )}
        >
          {formatRating(step)} ★
        </button>
      ))}
    </div>
    <button
      type='button'
      role='radio'
      aria-checked={rating === null}
      onClick={() => onChange(null)}
      className={cn(
        'rounded-md border px-2 py-1 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none',
        rating === null
          ? 'border-sakura bg-sakura text-noche'
          : 'border-ciruela text-lavanda hover:border-sakura hover:text-sakura-claro'
      )}
    >
      Sin calificar
    </button>
  </div>
)

export const StarRating = ({ rating, onChange }: Props) =>
  onChange ? (
    <EditableStars rating={rating} onChange={onChange} />
  ) : (
    <ReadOnlyStars rating={rating} />
  )
