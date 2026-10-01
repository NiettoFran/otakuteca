import { Star, Trophy } from 'lucide-react'
import { Link } from 'react-router'

import { getUnitLabels, TYPE_LABEL, type Work } from '@/lib'

import { CoverImage } from './CoverImage'
import { ProgressBar } from './ProgressBar'
import { StarRating } from './StarRating'
import { StatusBadge } from './StatusBadge'

export const WorkDetail = ({ work }: { work: Work }) => {
  const labels = getUnitLabels(work.type)

  return (
    <article className='grid gap-8 md:grid-cols-[minmax(0,18rem)_1fr]'>
      <CoverImage
        src={work.cover_url}
        title={work.title}
        className='rounded-2xl border border-ciruela'
      />
      <div className='flex min-w-0 flex-col gap-5'>
        <div>
          <p className='text-sm font-medium text-lavanda'>{TYPE_LABEL[work.type]}</p>
          <h1 className='mt-1 font-heading text-3xl font-extrabold tracking-tight wrap-break-word sm:text-4xl'>
            {work.title}
          </h1>
        </div>
        <div className='flex flex-wrap items-center gap-3'>
          <StatusBadge status={work.status} type={work.type} />
          {work.is_favorite && (
            <span className='inline-flex items-center gap-1 rounded-full bg-dorado/10 px-2.5 py-0.5 text-xs font-medium text-dorado ring-1 ring-dorado/40'>
              <Star className='size-3.5 fill-dorado' />
              Favorita
            </span>
          )}
          {work.ranking_position !== null && (
            <Link
              to='/ranking'
              className='inline-flex items-center gap-1 rounded-full bg-sakura/10 px-2.5 py-0.5 text-xs font-medium text-sakura ring-1 ring-sakura/40 hover:text-sakura-claro'
            >
              <Trophy className='size-3.5' />
              En mi top 10
            </Link>
          )}
        </div>
        {work.genres.length > 0 && (
          <ul className='flex flex-wrap gap-1.5 text-sm text-lavanda'>
            {work.genres.map((g) => (
              <li key={g.id} className='rounded-full bg-uva/50 px-3 py-1'>
                {g.name}
              </li>
            ))}
          </ul>
        )}
        <StarRating rating={work.rating} />
        <div className='max-w-md'>
          <ProgressBar work={work} />
        </div>
        {work.parts !== null && (
          <p className='text-sm text-lavanda'>
            {work.parts} {work.parts === 1 ? labels.part : labels.parts}
          </p>
        )}
        {work.short_review && (
          <p className='text-lg text-pretty text-niebla'>{work.short_review}</p>
        )}
        {work.long_review && (
          <p className='leading-relaxed whitespace-pre-line text-niebla/80'>{work.long_review}</p>
        )}
      </div>
    </article>
  )
}
