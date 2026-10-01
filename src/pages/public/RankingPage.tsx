import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import { Link } from 'react-router'

import { CoverImage, EmptyState, StarRating } from '@/components'
import { useCatalog, useMotionSet } from '@/hooks'
import { getRanking } from '@/lib'

export const RankingPage = () => {
  const m = useMotionSet()
  const { works, loading, error } = useCatalog()
  const ranking = getRanking(works)

  return (
    <section className='py-10'>
      <title>Ranking · Otakuteca</title>
      <h1 className='font-heading text-3xl font-extrabold tracking-tight sm:text-4xl'>
        Mi top de animes
      </h1>
      <div className='mt-8'>
        {loading ? (
          <p className='py-12 text-center text-lavanda'>Cargando…</p>
        ) : error ? (
          <EmptyState message='No pudimos cargar el catálogo. Probá recargar la página' />
        ) : ranking.length === 0 ? (
          <EmptyState icon={Trophy} message='Todavía no armé mi top. ¡Volvé pronto!' />
        ) : (
          <motion.ol variants={m.grid} initial='hidden' animate='visible' className='space-y-4'>
            {ranking.map((work, index) => (
              <motion.li key={work.id} variants={m.card}>
                <Link
                  to={`/animes/${work.id}`}
                  className='group flex items-center gap-4 rounded-2xl border border-ciruela bg-abismo p-3 transition-colors hover:border-sakura focus-visible:ring-2 focus-visible:ring-cian focus-visible:outline-none sm:gap-6 sm:p-4'
                >
                  <span className='w-10 text-center font-heading text-3xl font-extrabold text-dorado sm:w-14 sm:text-4xl'>
                    #{index + 1}
                  </span>
                  <CoverImage
                    src={work.cover_url}
                    title={work.title}
                    className='w-16 shrink-0 rounded-lg sm:w-20'
                  />
                  <div className='min-w-0 space-y-2'>
                    <h2 className='line-clamp-2 font-heading text-lg leading-snug font-bold group-hover:text-sakura-claro'>
                      {work.title}
                    </h2>
                    <StarRating rating={work.rating} />
                  </div>
                </Link>
              </motion.li>
            ))}
          </motion.ol>
        )}
      </div>
    </section>
  )
}
