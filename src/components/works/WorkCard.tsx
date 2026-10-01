import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Link } from 'react-router'

import { useMotionSet } from '@/hooks'
import { cn, TYPE_PATH, type Work } from '@/lib'

import { CoverImage } from './CoverImage'
import { ProgressBar } from './ProgressBar'
import { StarRating } from './StarRating'
import { StatusBadge } from './StatusBadge'

export const WorkCard = ({ work }: { work: Work }) => {
  const m = useMotionSet()
  const shown = work.genres.slice(0, 3)
  const extra = work.genres.length - shown.length

  return (
    <motion.article variants={m.card} whileHover={m.cardHover} className='h-full'>
      <Link
        to={`${TYPE_PATH[work.type]}/${work.id}`}
        className={cn(
          'group flex h-full flex-col overflow-hidden rounded-2xl border bg-abismo transition-[border-color,box-shadow] duration-300 hover:border-sakura hover:shadow-xl hover:shadow-sakura/15 focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none',
          work.is_favorite ? 'border-dorado/60' : 'border-ciruela'
        )}
      >
        <div className='relative overflow-hidden'>
          <CoverImage
            src={work.cover_url}
            title={work.title}
            className='transition-transform duration-500 ease-out motion-safe:group-hover:scale-105'
          />
          <div className='absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-abismo to-transparent' />
          {work.is_favorite && (
            <div
              className='absolute top-3 right-3 grid size-9 place-items-center rounded-full bg-noche/70 backdrop-blur'
              title='Favorita'
            >
              <Star className='size-5 fill-dorado text-dorado' />
              <span className='sr-only'>Favorita</span>
            </div>
          )}
        </div>
        <div className='flex flex-1 flex-col gap-3 p-5'>
          <h2 className='line-clamp-2 font-heading text-lg leading-snug font-bold transition group-hover:text-sakura-claro'>
            {work.title}
          </h2>
          {shown.length > 0 && (
            <ul className='flex flex-wrap gap-1.5 text-xs text-lavanda'>
              {shown.map((g) => (
                <li key={g.id} className='rounded-full bg-uva/50 px-2 py-0.5'>
                  {g.name}
                </li>
              ))}
              {extra > 0 && <li className='rounded-full bg-uva/50 px-2 py-0.5'>+{extra}</li>}
            </ul>
          )}
          {work.short_review && (
            <p className='line-clamp-3 text-sm leading-relaxed text-niebla/80'>
              {work.short_review}
            </p>
          )}
          <div className='mt-auto space-y-3 pt-1'>
            <StarRating rating={work.rating} />
            <div>
              <StatusBadge status={work.status} type={work.type} />
            </div>
            <ProgressBar work={work} />
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
