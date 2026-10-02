import { motion } from 'framer-motion'
import { BookOpen, Star, Tv } from 'lucide-react'
import { Link } from 'react-router'

import { useMotionSet } from '@/hooks'
import { cn, getUnitLabels, TYPE_LABEL, TYPE_PATH, type Work } from '@/lib'

import { CoverImage } from './CoverImage'

export const PendingCard = ({ work }: { work: Work }) => {
  const m = useMotionSet()
  const TypeIcon = work.type === 'anime' ? Tv : BookOpen
  const units = getUnitLabels(work.type)
  const info = [
    work.total_units ? `${work.total_units} ${units.units}` : null,
    work.parts ? `${work.parts} ${work.parts === 1 ? units.part : units.parts}` : null,
  ].filter(Boolean)

  return (
    <motion.article variants={m.card} whileHover={m.cardHover} className='h-full'>
      <Link
        to={`${TYPE_PATH[work.type]}/${work.id}`}
        className={cn(
          'group flex h-full flex-col overflow-hidden rounded-2xl border bg-abismo transition-[border-color,box-shadow] duration-300 hover:border-lavanda hover:shadow-xl hover:shadow-lavanda/15 focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none',
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
          <span className='absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-noche/70 px-2.5 py-1 text-xs font-medium text-lavanda backdrop-blur'>
            <TypeIcon aria-hidden className='size-3.5' />
            {TYPE_LABEL[work.type]}
          </span>
          {work.is_favorite && (
            <div
              className='absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-noche/70 backdrop-blur'
              title='Favorita'
            >
              <Star className='size-4 fill-dorado text-dorado' />
              <span className='sr-only'>Favorita</span>
            </div>
          )}
        </div>
        <div className='flex flex-1 flex-col gap-2 p-4'>
          <h2 className='line-clamp-2 font-heading text-base leading-snug font-bold transition group-hover:text-sakura-claro'>
            {work.title}
          </h2>
          {work.genres.length > 0 && (
            <p className='line-clamp-1 text-xs text-lavanda'>
              {work.genres.map((g) => g.name).join(' · ')}
            </p>
          )}
          {info.length > 0 && (
            <p className='mt-auto pt-1 text-xs text-niebla/60'>{info.join(' · ')}</p>
          )}
        </div>
      </Link>
    </motion.article>
  )
}
