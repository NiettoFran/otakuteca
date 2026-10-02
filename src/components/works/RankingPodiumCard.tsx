import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import { Link } from 'react-router'

import { useMotionSet } from '@/hooks'
import { cn, type Work } from '@/lib'

import { CoverImage } from './CoverImage'
import { StarRating } from './StarRating'

const MEDAL = [
  { badge: 'bg-dorado text-noche', border: 'border-dorado/70 shadow-dorado/20' },
  { badge: 'bg-niebla text-noche', border: 'border-niebla/50 shadow-niebla/10' },
  { badge: 'bg-sakura text-noche', border: 'border-sakura/60 shadow-sakura/15' },
] as const

type Props = { work: Work; position: 1 | 2 | 3 }

export const RankingPodiumCard = ({ work, position }: Props) => {
  const m = useMotionSet()
  const medal = MEDAL[position - 1]
  const first = position === 1

  return (
    <motion.li
      variants={m.card}
      className={cn(
        // En escritorio el podio se acomoda 2 · 1 · 3, con el primero más arriba.
        position === 1 && 'md:order-2 md:-mt-6',
        position === 2 && 'md:order-1',
        position === 3 && 'md:order-3'
      )}
    >
      <Link
        to={`/animes/${work.id}`}
        className={cn(
          'group flex h-full flex-col overflow-hidden rounded-2xl border-2 bg-abismo shadow-xl transition-transform duration-300 hover:-translate-y-1 focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none',
          medal.border
        )}
      >
        <div className='relative overflow-hidden'>
          <CoverImage
            src={work.cover_url}
            title={work.title}
            className='transition-transform duration-500 ease-out motion-safe:group-hover:scale-105'
          />
          <div className='absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-abismo to-transparent' />
          <span
            className={cn(
              'absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-heading text-lg font-extrabold',
              medal.badge
            )}
          >
            {first && <Crown className='size-5' aria-hidden />}#{position}
          </span>
        </div>
        <div className='flex flex-1 flex-col items-center gap-3 p-5 text-center'>
          <h2 className='line-clamp-2 font-heading text-lg leading-snug font-bold group-hover:text-sakura-claro'>
            {work.title}
          </h2>
          <div className='mt-auto'>
            <StarRating rating={work.rating} />
          </div>
        </div>
      </Link>
    </motion.li>
  )
}
