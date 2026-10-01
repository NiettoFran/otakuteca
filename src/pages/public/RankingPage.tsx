import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'

import { EmptyState, RankingPodiumCard, RankingRow } from '@/components'
import { useCatalog, useMotionSet } from '@/hooks'
import { getRanking } from '@/lib'

export const RankingPage = () => {
  const m = useMotionSet()
  const { works, loading, error } = useCatalog()
  const ranking = getRanking(works)
  const podium = ranking.slice(0, 3)
  const rest = ranking.slice(3)

  return (
    <section className='py-10'>
      <title>Ranking · Otakuteca</title>
      <header className='mx-auto max-w-2xl text-center'>
        <h1 className='font-heading text-3xl font-extrabold tracking-tight sm:text-4xl'>
          Mi top de animes
        </h1>
        <p className='mt-3 text-pretty text-lavanda'>
          Los animes que más disfruté, ordenados de mejor a peor. Tocá cualquiera para ver mi reseña
          completa.
        </p>
      </header>
      <div className='mt-12'>
        {loading ? (
          <p className='py-12 text-center text-lavanda'>Cargando…</p>
        ) : error ? (
          <EmptyState message='No pudimos cargar el catálogo. Probá recargar la página' />
        ) : ranking.length === 0 ? (
          <EmptyState icon={Trophy} message='Todavía no armé mi top. ¡Volvé pronto!' />
        ) : (
          <div className='mx-auto max-w-4xl space-y-8'>
            <motion.ol
              variants={m.grid}
              initial='hidden'
              animate='visible'
              className='grid gap-6 md:grid-cols-3 md:pt-6'
            >
              {podium.map((work, index) => (
                <RankingPodiumCard key={work.id} work={work} position={(index + 1) as 1 | 2 | 3} />
              ))}
            </motion.ol>
            {rest.length > 0 && (
              <motion.ol
                variants={m.grid}
                initial='hidden'
                animate='visible'
                start={4}
                className='space-y-3'
              >
                {rest.map((work, index) => (
                  <RankingRow key={work.id} work={work} position={index + 4} />
                ))}
              </motion.ol>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
