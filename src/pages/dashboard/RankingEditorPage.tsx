import { ArrowDown, ArrowUp, Trophy, X } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { EmptyState } from '@/components'
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

  return (
    <div className='space-y-8'>
      <div>
        <h2 className='font-heading text-xl font-bold'>Mi top</h2>
        {top.length === 0 ? (
          <p className='mt-3 text-lavanda'>Todavía no armaste tu top. Agregá animes de la lista.</p>
        ) : (
          <ol className='mt-3 divide-y divide-ciruela rounded-2xl border border-ciruela bg-abismo'>
            {top.map((work, index) => (
              <li key={work.id} className='flex items-center gap-2 p-3'>
                <span className='w-8 font-heading font-bold text-dorado'>#{index + 1}</span>
                <span className='flex-1 truncate'>{work.title}</span>
                <Button
                  size='icon'
                  variant='outline'
                  aria-label={`Subir ${work.title}`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className='size-4' />
                </Button>
                <Button
                  size='icon'
                  variant='outline'
                  aria-label={`Bajar ${work.title}`}
                  disabled={index === top.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className='size-4' />
                </Button>
                <Button
                  size='icon'
                  variant='destructive'
                  aria-label={`Quitar ${work.title}`}
                  onClick={() => setTop((prev) => prev.filter((w) => w.id !== work.id))}
                >
                  <X className='size-4' />
                </Button>
              </li>
            ))}
          </ol>
        )}
        <div className='mt-4 flex flex-wrap items-center gap-3'>
          <Button onClick={save} disabled={saving} className='rounded-full px-6'>
            {saving ? 'Guardando…' : 'Guardar Ranking'}
          </Button>
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
            Solo podés rankear hasta 10 animes favoritos.
          </p>
        )}
        {available.length === 0 ? (
          <p className='mt-3 text-lavanda'>No quedan animes favoritos para agregar.</p>
        ) : (
          <ul className='mt-3 divide-y divide-ciruela rounded-2xl border border-ciruela bg-abismo'>
            {available.map((work) => (
              <li key={work.id} className='flex items-center gap-2 p-3'>
                <span className='flex-1 truncate'>{work.title}</span>
                <Button
                  size='sm'
                  variant='outline'
                  disabled={full}
                  onClick={() => setTop((prev) => [...prev, work])}
                >
                  Agregar al top
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export const RankingEditorPage = () => {
  const { works, loading, error, reload } = useCatalog()
  const hasFavorites = works.some((w) => w.type === 'anime' && w.is_favorite)

  return (
    <section className='max-w-2xl'>
      <title>Ranking · Panel · Otakuteca</title>
      <h1 className='font-heading text-3xl font-extrabold'>Ranking</h1>
      <div className='mt-6'>
        {loading ? (
          <p className='py-12 text-center text-lavanda'>Cargando…</p>
        ) : error ? (
          <EmptyState message='No pudimos cargar el catálogo. Probá recargar la página' />
        ) : !hasFavorites ? (
          <EmptyState
            icon={Trophy}
            message='Todavía no tenés animes favoritos. Primero marcá algunos como favoritos desde la edición de cada obra.'
          />
        ) : (
          <RankingEditor works={works} reload={reload} />
        )}
      </div>
    </section>
  )
}
