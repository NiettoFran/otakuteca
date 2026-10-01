import { Dices } from 'lucide-react'
import { useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import { EmptyState, WorkDetail } from '@/components'
import { Button, ToggleGroup, ToggleGroupItem } from '@/components/ui'
import { useCatalog } from '@/hooks'
import { pickRandomPending, TYPE_PATH, type Work, type WorkType } from '@/lib'

export const RoulettePage = () => {
  const [params, setParams] = useSearchParams()
  const { works, loading, error } = useCatalog()
  const type: WorkType = params.get('tipo') === 'manga' ? 'manga' : 'anime'
  const [result, setResult] = useState<Work | null>(null)
  const [spun, setSpun] = useState(false)

  const changeType = (next: WorkType) => {
    setResult(null)
    setSpun(false)
    setParams(next === 'anime' ? {} : { tipo: next }, { replace: true })
  }

  const spin = () => {
    setResult(pickRandomPending(works, type, result?.id ?? null))
    setSpun(true)
  }

  const other: WorkType = type === 'anime' ? 'manga' : 'anime'
  const plural = (t: WorkType) => (t === 'anime' ? 'animes' : 'mangas')
  const current = result && result.type === type ? result : null

  return (
    <section className='py-10'>
      <title>Ruleta · Otakuteca</title>
      <h1 className='font-heading text-3xl font-extrabold tracking-tight sm:text-4xl'>Ruleta</h1>
      <p className='mt-2 text-lavanda'>¿No sabés qué mirar o leer? Dejá que decida la suerte.</p>

      <div className='mt-6 flex flex-wrap items-center gap-4'>
        <ToggleGroup
          value={[type]}
          onValueChange={(v) => {
            if (v[0]) changeType(v[0] as WorkType)
          }}
          aria-label='Tipo de obra'
        >
          <ToggleGroupItem value='anime' variant='outline'>
            Anime
          </ToggleGroupItem>
          <ToggleGroupItem value='manga' variant='outline'>
            Manga
          </ToggleGroupItem>
        </ToggleGroup>
        <Button onClick={spin} disabled={loading} className='rounded-full px-6'>
          <Dices className='size-4' />
          {current ? 'Otra opción' : '¡Girá la ruleta!'}
        </Button>
      </div>

      <div className='mt-10'>
        {error ? (
          <EmptyState message='No pudimos cargar el catálogo. Probá recargar la página' />
        ) : current ? (
          <div className='space-y-4' aria-live='polite'>
            <WorkDetail work={current} />
            <Link
              to={`${TYPE_PATH[current.type]}/${current.id}`}
              className='inline-block text-sakura hover:text-sakura-claro'
            >
              Ver el detalle
            </Link>
          </div>
        ) : spun ? (
          <EmptyState
            icon={Dices}
            message={`No tengo ${plural(type)} pendientes. Probá con ${plural(other)}`}
          >
            <Button variant='outline' onClick={() => changeType(other)} className='rounded-full'>
              Probar con {plural(other)}
            </Button>
          </EmptyState>
        ) : null}
      </div>
    </section>
  )
}
