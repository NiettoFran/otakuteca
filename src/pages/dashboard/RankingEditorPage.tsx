import { Reorder } from 'framer-motion'
import { ArrowDown, ArrowUp, GripVertical, Plus, Save, Trophy, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { EmptyState, PageHeader, PanelEmptyState, TooltipHint } from '@/components'
import { Button } from '@/components/ui'
import { useCatalog } from '@/hooks'
import {
  getRanking,
  isSessionError,
  MAX_RANKING,
  supabase,
  translateDbError,
  type Work,
} from '@/lib'

const LOGIN_REDIRECT = '/login?next=/dashboard/ranking&motivo=sesion'

const RankingEditor = ({ works, reload }: { works: Work[]; reload: () => void }) => {
  const navigate = useNavigate()
  const [top, setTop] = useState<Work[]>(() => getRanking(works))
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)

  const inTop = new Set(top.map((w) => w.id))
  const available = works.filter((w) => w.type === 'anime' && w.is_favorite && !inTop.has(w.id))
  const full = top.length >= MAX_RANKING

  const move = (index: number, delta: number) =>
    setTop((prev) => {
      const next = [...prev]
      const [item] = next.splice(index, 1)
      next.splice(index + delta, 0, item)
      return next
    })

  const save = async () => {
    setSaving(true)
    setMessage(null)
    const { error } = await supabase.rpc('set_anime_ranking', { p_work_ids: top.map((w) => w.id) })
    setSaving(false)
    if (isSessionError(error)) return navigate(LOGIN_REDIRECT, { replace: true })
    if (error) return setMessage({ kind: 'error', text: translateDbError(error).message })
    setMessage({ kind: 'ok', text: '¡Ranking guardado!' })
    reload()
  }

  const listHeader =
    'border-b border-uva bg-ciruela/60 px-4 py-3 text-xs font-semibold tracking-wider text-lavanda uppercase'

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='font-heading text-xl font-bold'>Mi top</h2>
        {top.length === 0 ? (
          <div className='mt-3'>
            <PanelEmptyState icon={Trophy} title='Todavía no armaste tu top'>
              Agregá animes de la lista de favoritos de abajo.
            </PanelEmptyState>
          </div>
        ) : (
          <div className='mt-3 overflow-hidden rounded-2xl border border-ciruela bg-abismo'>
            <p className={listHeader}>
              {top.length} de {MAX_RANKING} lugares · arrastrá las filas para reordenar
            </p>
            <Reorder.Group
              as='ol'
              axis='y'
              values={top}
              onReorder={setTop}
              className='divide-y divide-ciruela'
            >
              {top.map((work, index) => (
                <Reorder.Item
                  key={work.id}
                  value={work}
                  className='flex cursor-grab items-center gap-2 bg-abismo px-3 py-3 select-none hover:bg-ciruela/30 active:cursor-grabbing sm:gap-3 sm:px-4'
                >
                  <GripVertical className='size-5 shrink-0 text-lavanda' aria-hidden />
                  <span className='w-7 shrink-0 font-heading font-bold text-dorado sm:w-8'>
                    #{index + 1}
                  </span>
                  <span className='min-w-0 flex-1 truncate' title={work.title}>
                    {work.title}
                  </span>
                  <TooltipHint label={`Subir «${work.title}» un puesto`}>
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={index === 0}
                      onClick={() => move(index, -1)}
                    >
                      <ArrowUp />
                      <span className='sr-only sm:not-sr-only'>Subir</span>
                    </Button>
                  </TooltipHint>
                  <TooltipHint label={`Bajar «${work.title}» un puesto`}>
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={index === top.length - 1}
                      onClick={() => move(index, 1)}
                    >
                      <ArrowDown />
                      <span className='sr-only sm:not-sr-only'>Bajar</span>
                    </Button>
                  </TooltipHint>
                  <TooltipHint label={`Sacar «${work.title}» del top`}>
                    <Button
                      size='sm'
                      variant='destructive'
                      onClick={() => setTop((prev) => prev.filter((w) => w.id !== work.id))}
                    >
                      <X />
                      <span className='sr-only sm:not-sr-only'>Quitar</span>
                    </Button>
                  </TooltipHint>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}
        <div className='mt-4 flex flex-wrap items-center justify-center gap-3'>
          <TooltipHint label='Guardar el orden actual del ranking'>
            <Button onClick={save} disabled={saving} className='rounded-full px-6'>
              <Save className='size-4' />
              {saving ? 'Guardando…' : 'Guardar ranking'}
            </Button>
          </TooltipHint>
          {message && (
            <p
              role={message.kind === 'error' ? 'alert' : 'status'}
              className={message.kind === 'error' ? 'text-sm text-sakura' : 'text-sm text-cian'}
            >
              {message.text}
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className='font-heading text-xl font-bold'>Favoritos disponibles</h2>
        {full && (
          <p role='status' className='mt-2 text-sm text-dorado'>
            Solo podés rankear hasta {MAX_RANKING} animes favoritos.
          </p>
        )}
        {available.length === 0 ? (
          <div className='mt-3'>
            <PanelEmptyState icon={Trophy} title='No quedan favoritos para agregar'>
              Todos tus animes favoritos ya están en el top.
            </PanelEmptyState>
          </div>
        ) : (
          <div className='mt-3 overflow-hidden rounded-2xl border border-ciruela bg-abismo'>
            <p className={listHeader}>
              {available.length}{' '}
              {available.length === 1 ? 'anime disponible' : 'animes disponibles'}
            </p>
            <ul className='divide-y divide-ciruela'>
              {available.map((work) => (
                <li key={work.id} className='flex items-center gap-3 px-4 py-3 hover:bg-ciruela/30'>
                  <span className='min-w-0 flex-1 truncate' title={work.title}>
                    {work.title}
                  </span>
                  <TooltipHint label={`Sumar «${work.title}» al final de tu top`}>
                    <Button
                      size='sm'
                      variant='outline'
                      disabled={full}
                      onClick={() => setTop((prev) => [...prev, work])}
                    >
                      <Plus />
                      <span className='sr-only sm:not-sr-only'>Agregar al top</span>
                    </Button>
                  </TooltipHint>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export const RankingEditorPage = () => {
  const { works, loading, error, reload } = useCatalog()
  const hasFavorites = works.some((w) => w.type === 'anime' && w.is_favorite)

  return (
    <section className='mx-auto max-w-3xl'>
      <title>Ranking · Panel · Otakuteca</title>
      <PageHeader
        title='Ranking'
        description='Armá tu top de animes favoritos: arrastrá las filas con el mouse o usá los botones para ordenarlas, y guardalo para que se vea en el sitio.'
      />
      <div className='mt-8'>
        {loading ? (
          <p className='py-12 text-center text-lavanda'>Cargando…</p>
        ) : error ? (
          <EmptyState message='No pudimos cargar el catálogo. Probá recargar la página' />
        ) : !hasFavorites ? (
          <PanelEmptyState icon={Trophy} title='Todavía no tenés animes favoritos'>
            Primero marcá algunos como favoritos desde la edición de cada obra.
          </PanelEmptyState>
        ) : (
          <RankingEditor works={works} reload={reload} />
        )}
      </div>
    </section>
  )
}
