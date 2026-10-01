import { motion, useReducedMotion } from 'framer-motion'
import { Dices } from 'lucide-react'

import type { Work } from '@/lib'

import { CoverImage } from './CoverImage'

type Props = { work: Work | null; spinning: boolean }

export const RouletteReel = ({ work, spinning }: Props) => {
  const reduced = useReducedMotion()

  return (
    <div className='relative mx-auto w-56 sm:w-64'>
      <div className='relative aspect-3/4 overflow-hidden rounded-2xl border border-ciruela bg-abismo'>
        {work ? (
          <CoverImage
            src={work.cover_url}
            title={work.title}
            className={spinning ? 'h-full scale-105 blur-[2px] brightness-75' : 'h-full'}
          />
        ) : (
          <div className='grid h-full place-items-center'>
            <motion.div
              aria-hidden
              animate={reduced ? undefined : { y: [0, -10, 0], rotate: [0, -12, 12, 0] }}
              transition={{ duration: 2.4, ease: 'easeInOut', repeat: Infinity }}
            >
              <Dices className='size-16 text-lavanda/60' />
            </motion.div>
          </div>
        )}
        {spinning && (
          <motion.div
            aria-hidden
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, ease: 'linear', repeat: Infinity }}
            className='absolute inset-0 m-auto grid size-16 place-items-center rounded-full bg-noche/70 backdrop-blur'
          >
            <Dices className='size-8 text-sakura' />
          </motion.div>
        )}
      </div>
    </div>
  )
}
