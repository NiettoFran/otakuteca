import { Eraser, Save, X } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router'

import { TooltipHint } from '@/components/common'
import {
  Button,
  buttonVariants,
  Checkbox,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
  ToggleGroup,
  ToggleGroupItem,
} from '@/components/ui'
import { useGenres } from '@/hooks'
import {
  clearDraft,
  cn,
  getStatusLabel,
  getUnitLabels,
  loadDraft,
  saveDraft,
  STATUS_ORDER,
  validateWork,
  type WorkFormErrors,
  type WorkFormValues,
  type WorkStatus,
  type WorkType,
} from '@/lib'

import { CoverImage } from './CoverImage'
import { StarRating } from './StarRating'
import { WorkFormSection } from './WorkFormSection'

type Props = {
  initialValues: WorkFormValues
  draftKey: string
  hadRankingPosition: boolean
  onSubmit: (values: WorkFormValues) => void
  submitting: boolean
  formError?: ReactNode
  notice?: string | null
}

const FieldError = ({ message }: { message?: string }) =>
  message ? (
    <p role='alert' className='text-sm text-sakura'>
      {message}
    </p>
  ) : null

export const WorkForm = ({
  initialValues,
  draftKey,
  hadRankingPosition,
  onSubmit,
  submitting,
  formError,
  notice,
}: Props) => {
  const { genres, loading: genresLoading } = useGenres()
  const [draft] = useState(() => loadDraft(draftKey))
  const [values, setValues] = useState<WorkFormValues>(() => draft ?? initialValues)
  const [hasDraft, setHasDraft] = useState(draft !== null)
  const [errors, setErrors] = useState<WorkFormErrors>({})
  const labels = getUnitLabels(values.type)

  const change = (changes: Partial<WorkFormValues>) => {
    setValues((prev) => {
      const next = { ...prev, ...changes }
      if (next.status === 'completed' && next.total_units.trim()) next.progress = next.total_units
      saveDraft(draftKey, next)
      return next
    })
  }

  const discardDraft = () => {
    clearDraft(draftKey)
    setHasDraft(false)
    setValues(initialValues)
    setErrors({})
  }

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const found = validateWork(values)
    setErrors(found)
    if (Object.keys(found).length === 0) onSubmit(values)
  }

  const toggleGenre = (id: number, checked: boolean) =>
    change({
      genreIds: checked ? [...values.genreIds, id] : values.genreIds.filter((g) => g !== id),
    })

  const losesRanking = hadRankingPosition && (!values.is_favorite || values.type === 'manga')

  return (
    <form onSubmit={submit} noValidate className='space-y-6'>
      {notice && (
        <p
          role='status'
          className='rounded-xl border border-dorado/40 bg-dorado/10 p-3 text-sm text-dorado'
        >
          {notice}
        </p>
      )}
      {hasDraft && (
        <div
          role='status'
          className='flex flex-wrap items-center justify-between gap-2 rounded-xl border border-cian/40 bg-cian/10 p-3 text-sm text-cian'
        >
          <span>Recuperamos lo que estabas cargando</span>
          <TooltipHint label='Borrar el borrador y volver a los datos guardados'>
            <Button type='button' variant='outline' size='sm' onClick={discardDraft}>
              <Eraser />
              Descartar borrador
            </Button>
          </TooltipHint>
        </div>
      )}

      <div className='grid items-start gap-6 lg:grid-cols-5'>
        <div className='space-y-6 lg:col-span-3'>
          <WorkFormSection title='Información'>
            <div className='space-y-2'>
              <Label htmlFor='title'>Título</Label>
              <Input
                id='title'
                value={values.title}
                aria-invalid={!!errors.title}
                onChange={(e) => change({ title: e.target.value })}
              />
              <FieldError message={errors.title} />
            </div>
            <div className='grid gap-4 sm:grid-cols-2'>
              <div className='space-y-2'>
                <Label>Tipo</Label>
                <ToggleGroup
                  value={[values.type]}
                  onValueChange={(v) => v[0] && change({ type: v[0] as WorkType })}
                  aria-label='Tipo'
                >
                  <ToggleGroupItem value='anime' variant='outline'>
                    Anime
                  </ToggleGroupItem>
                  <ToggleGroupItem value='manga' variant='outline'>
                    Manga
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className='space-y-2'>
                <Label>Estado</Label>
                <Select
                  value={values.status || null}
                  onValueChange={(v) => v && change({ status: v as WorkStatus })}
                  items={STATUS_ORDER.map((s) => ({
                    value: s,
                    label: getStatusLabel(s, values.type),
                  }))}
                >
                  <SelectTrigger className='w-full' aria-invalid={!!errors.status}>
                    <SelectValue placeholder='Elegí un estado' />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDER.map((s) => (
                      <SelectItem key={s} value={s}>
                        {getStatusLabel(s, values.type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError message={errors.status} />
              </div>
            </div>
          </WorkFormSection>

          <WorkFormSection title='Géneros'>
            {genresLoading ? (
              <p className='text-sm text-lavanda'>Cargando géneros…</p>
            ) : genres.length === 0 ? (
              <p className='text-sm text-lavanda'>
                Todavía no hay géneros. Creá algunos desde la sección Géneros del panel.
              </p>
            ) : (
              <fieldset className='flex max-h-72 flex-wrap gap-2 overflow-y-auto'>
                <legend className='sr-only'>Géneros</legend>
                {genres.map((g) => (
                  <Label
                    key={g.id}
                    className='cursor-pointer rounded-full border border-ciruela px-3 py-1.5 font-normal hover:border-sakura'
                  >
                    <Checkbox
                      checked={values.genreIds.includes(g.id)}
                      onCheckedChange={(checked) => toggleGenre(g.id, checked)}
                    />
                    {g.name}
                  </Label>
                ))}
              </fieldset>
            )}
          </WorkFormSection>

          <WorkFormSection title='Reseñas'>
            <div className='space-y-2'>
              <Label htmlFor='short_review'>Reseña breve</Label>
              <Textarea
                id='short_review'
                value={values.short_review}
                onChange={(e) => change({ short_review: e.target.value })}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='long_review'>Reseña ampliada</Label>
              <Textarea
                id='long_review'
                rows={6}
                value={values.long_review}
                onChange={(e) => change({ long_review: e.target.value })}
              />
            </div>
          </WorkFormSection>
        </div>

        <div className='space-y-6 lg:col-span-2'>
          <WorkFormSection title='Portada'>
            <div className='space-y-2'>
              <Label htmlFor='cover_url'>URL de la portada</Label>
              <Input
                id='cover_url'
                type='url'
                value={values.cover_url}
                aria-invalid={!!errors.cover_url}
                onChange={(e) => change({ cover_url: e.target.value })}
              />
              <FieldError message={errors.cover_url} />
            </div>
            {/^https?:\/\//i.test(values.cover_url.trim()) && (
              <CoverImage
                src={values.cover_url.trim()}
                title='Vista previa de la portada'
                className='mx-auto max-w-48 rounded-lg border border-ciruela'
              />
            )}
          </WorkFormSection>

          <WorkFormSection title='Progreso'>
            <div className='grid gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='parts' className='capitalize'>
                  {labels.parts}
                </Label>
                <Input
                  id='parts'
                  type='number'
                  min={1}
                  value={values.parts}
                  aria-invalid={!!errors.parts}
                  onChange={(e) => change({ parts: e.target.value })}
                />
                <FieldError message={errors.parts} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='total_units'>Total de {labels.units}</Label>
                <Input
                  id='total_units'
                  type='number'
                  min={1}
                  value={values.total_units}
                  aria-invalid={!!errors.total_units}
                  onChange={(e) => change({ total_units: e.target.value })}
                />
                <FieldError message={errors.total_units} />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='progress' className='capitalize'>
                  {labels.done}
                </Label>
                <Input
                  id='progress'
                  type='number'
                  min={0}
                  value={values.progress}
                  aria-invalid={!!errors.progress}
                  onChange={(e) => change({ progress: e.target.value })}
                />
                <FieldError message={errors.progress} />
              </div>
            </div>
          </WorkFormSection>

          <WorkFormSection title='Valoración'>
            <div className='space-y-2'>
              <Label>Calificación</Label>
              <StarRating rating={values.rating} onChange={(rating) => change({ rating })} />
            </div>
            <div className='space-y-2'>
              <Label className='cursor-pointer'>
                <Checkbox
                  checked={values.is_favorite}
                  onCheckedChange={(checked) => change({ is_favorite: checked })}
                />
                Favorita
              </Label>
              {losesRanking && (
                <p role='status' className='text-sm text-dorado'>
                  Sale del Ranking
                </p>
              )}
            </div>
          </WorkFormSection>
        </div>
      </div>

      <div className='sticky bottom-0 -mx-4 space-y-3 border-t border-ciruela bg-noche/90 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6'>
        {formError}
        <div className='flex flex-wrap items-center justify-center gap-3'>
          <TooltipHint label='Guardar los datos de la obra'>
            <Button type='submit' disabled={submitting} className='rounded-full px-6'>
              <Save className='size-4' />
              {submitting ? 'Guardando…' : 'Guardar obra'}
            </Button>
          </TooltipHint>
          <TooltipHint label='Volver al listado sin guardar'>
            <Link
              to='/dashboard'
              className={cn(buttonVariants({ variant: 'outline' }), 'rounded-full px-6')}
            >
              <X className='size-4' />
              Cancelar
            </Link>
          </TooltipHint>
        </div>
      </div>
    </form>
  )
}
