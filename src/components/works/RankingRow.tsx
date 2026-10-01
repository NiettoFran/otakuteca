import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'

import { useMotionSet } from '@/hooks'
import type { Work } from '@/lib'

import { CoverImage } from './CoverImage'
import { StarRating } from './StarRating'

type Props = { work: Work; position: number }

export const RankingRow = ({ work, position }: Props) => {
  const m = useMotionSet()

  return (
    <motion.li variants={m.card}>
      <Link
        to={`/animes/${work.id}`}
        className='group flex items-center gap-4 rounded-2xl border border-ciruela bg-abismo p-3 transition-colors hover:border-sakura focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none sm:gap-6 sm:p-4'
      >
        <span className='w-10 text-center font-heading text-2xl font-extrabold text-lavanda sm:w-14 sm:text-3xl'>
          #{position}
        </span>
        <CoverImage
          src={work.cover_url}
          title={work.title}
          className='w-14 shrink-0 rounded-lg sm:w-16'
        />
        <div className='min-w-0 flex-1 space-y-2'>
          <h2 className='line-clamp-2 font-heading text-lg leading-snug font-bold group-hover:text-sakura-claro'>
            {work.title}
          </h2>
          <StarRating rating={work.rating} />
        </div>
        <ChevronRight
          className='hidden size-5 shrink-0 text-lavanda transition-transform group-hover:translate-x-1 group-hover:text-sakura sm:block'
          aria-hidden
        />
      </Link>
    </motion.li>
  )
}
