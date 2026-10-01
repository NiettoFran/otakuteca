import { useQueryClient } from '@tanstack/react-query'
import { Trash2 } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'

import { ConfirmDialog, PageHeader, TooltipHint, WorkForm } from '@/components'
import { Button } from '@/components/ui'
import { worksPageKey } from '@/hooks'
import {
  clearDraft,
  draftKey,
  isSessionError,
  saveDraft,
  supabase,
  toWorkPayload,
  translateDbError,
  type Work,
  type WorkFormValues,
} from '@/lib'

const EMPTY_VALUES: WorkFormValues = {
  title: '',
  type: 'anime',
  status: '',
  cover_url: '',
  short_review: '',
  long_review: '',
  parts: '',
  total_units: '',
  progress: '',
  rating: null,
  is_favorite: false,
  genreIds: [],
}

const toFormValues = (work: Work): WorkFormValues => ({
  title: work.title,
  type: work.type,
  status: work.status,
  cover_url: work.cover_url,
  short_review: work.short_review ?? '',
  long_review: work.long_review ?? '',
  parts: work.parts?.toString() ?? '',
  total_units: work.total_units?.toString() ?? '',
  progress: work.progress.toString(),
  rating: work.rating,
  is_favorite: work.is_favorite,
  genreIds: work.genres.map((g) => g.id),
})

const escapeLike = (text: string) => text.replace(/[\\%_]/g, (c) => `\\${c}`)

const GENRES_NOTICE = 'Guardamos la obra, pero no sus géneros. Revisalos y guardá de nuevo.'

const saveGenres = async (workId: number, genreIds: number[]) => {
  const removal = supabase.from('work_genres').delete().eq('work_id', workId)
  const { error: deleteError } = genreIds.length
    ? await removal.not('genre_id', 'in', `(${genreIds.join(',')})`)
    : await removal
  if (deleteError) return deleteError
  if (genreIds.length === 0) return null
  const { error } = await supabase.from('work_genres').upsert(
    genreIds.map((genre_id) => ({ work_id: workId, genre_id })),
    { onConflict: 'work_id,genre_id', ignoreDuplicates: true }
  )
  return error
}

export const WorkEditor = ({ work }: { work: Work | null }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const location = useLocation()
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<ReactNode>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const key = draftKey(work?.id)
  const notice = (location.state as { notice?: string } | null)?.notice ?? null

  const goToLogin = (next: string) =>
    navigate(`/login?next=${encodeURIComponent(next)}&motivo=sesion`, { replace: true })

  const sessionLost = (values: WorkFormValues) => {
    saveDraft(key, values)
    goToLogin(location.pathname)
  }

  const reportDuplicate = async (values: WorkFormValues) => {
    const title = values.title.trim()
    let query = supabase
      .from('works')
      .select('id, title')
      .eq('type', values.type)
      .ilike('title', escapeLike(title))
    if (work) query = query.neq('id', work.id)
    const { data } = await query.limit(1)
    const existing = data?.[0]
    const label = values.type === 'anime' ? 'anime' : 'manga'
    setFormError(
      <p role='alert' className='text-sm text-sakura'>
        Ya cargaste «{existing?.title ?? title}» como {label}.{' '}
        {existing && (
          <Link to={`/dashboard/obras/${existing.id}`} className='font-medium underline'>
            Editar esa obra
          </Link>
        )}
      </p>
    )
  }

  const submit = async (values: WorkFormValues) => {
    setSubmitting(true)
    setFormError(null)
    try {
      const { data: auth } = await supabase.auth.getSession()
      if (!auth.session) return sessionLost(values)

      const payload = toWorkPayload(values)
      let workId: number
      if (work) {
        const { data, error } = await supabase
          .from('works')
          .update(payload)
          .eq('id', work.id)
          .select('id')
        if (isSessionError(error) || (!error && data?.length === 0)) return sessionLost(values)
        if (error) return await showError(error, values)
        workId = work.id
      } else {
        const { data, error } = await supabase.from('works').insert(payload).select('id').single()
        if (isSessionError(error)) return sessionLost(values)
        if (error) return await showError(error, values)
        workId = data.id
      }

      const genresError = await saveGenres(workId, values.genreIds)
      if (genresError) {
        if (!work) {
          saveDraft(draftKey(workId), values)
          clearDraft(key)
          if (isSessionError(genresError)) return goToLogin(`/dashboard/obras/${workId}`)
          return navigate(`/dashboard/obras/${workId}`, {
            replace: true,
            state: { notice: GENRES_NOTICE },
          })
        }
        if (isSessionError(genresError)) return sessionLost(values)
        return setFormError(
          <p role='alert' className='text-sm text-sakura'>
            {translateDbError(genresError).message}
          </p>
        )
      }

      clearDraft(key)
      await queryClient.invalidateQueries({ queryKey: worksPageKey })
      navigate('/dashboard')
    } finally {
      setSubmitting(false)
    }
  }

  const showError = async (
    error: Parameters<typeof translateDbError>[0],
    values: WorkFormValues
  ) => {
    const translated = translateDbError(error)
    if (translated.kind === 'duplicate-work') return reportDuplicate(values)
    setFormError(
      <p role='alert' className='text-sm text-sakura'>
        {translated.message}
      </p>
    )
  }

  const remove = async () => {
    if (!work) return
    const { data, error } = await supabase.from('works').delete().eq('id', work.id).select('id')
    if (isSessionError(error) || (!error && data?.length === 0)) {
      goToLogin(location.pathname)
      return
    }
    if (error) {
      setFormError(
        <p role='alert' className='text-sm text-sakura'>
          {translateDbError(error).message}
        </p>
      )
      return
    }
    clearDraft(key)
    await queryClient.invalidateQueries({ queryKey: worksPageKey })
    navigate('/dashboard')
  }

  return (
    <section className='mx-auto max-w-6xl'>
      <title>{work ? `Editar ${work.title} · Otakuteca` : 'Agregar obra · Otakuteca'}</title>
      <div className='mb-8'>
        <PageHeader
          title={work ? 'Editar obra' : 'Agregar obra'}
          description={
            work
              ? `Modificá los datos de «${work.title}». Los cambios se ven en el sitio apenas guardás.`
              : 'Cargá un anime o manga nuevo a tu catálogo. Necesitás al menos el título, el estado y la URL de la portada.'
          }
        >
          {work && (
            <TooltipHint label={`Eliminar «${work.title}» del catálogo`}>
              <Button variant='destructive' size='sm' onClick={() => setConfirmDelete(true)}>
                <Trash2 />
                Eliminar
              </Button>
            </TooltipHint>
          )}
        </PageHeader>
      </div>
      <WorkForm
        initialValues={work ? toFormValues(work) : EMPTY_VALUES}
        draftKey={key}
        hadRankingPosition={work?.ranking_position != null}
        onSubmit={submit}
        submitting={submitting}
        formError={formError}
        notice={notice}
      />
      {work && (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title={`¿Eliminar «${work.title}»?`}
          description='No se puede deshacer.'
          confirmLabel='Eliminar'
          onConfirm={remove}
        />
      )}
    </section>
  )
}
