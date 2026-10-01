import type { WorkFormValues, WorkPayload } from './types'

export type WorkFormErrors = Partial<
  Record<'title' | 'status' | 'cover_url' | 'parts' | 'total_units' | 'progress', string>
>

const isPositiveInt = (value: string, min: number) => {
  const n = Number(value)
  return Number.isInteger(n) && n >= min
}

export const validateWork = (values: WorkFormValues): WorkFormErrors => {
  const errors: WorkFormErrors = {}
  const title = values.title.trim()
  if (!title) errors.title = 'Poné un título'
  else if (title.length > 200) errors.title = 'Máximo 200 caracteres'
  if (!values.status) errors.status = 'Elegí un estado'
  const cover = values.cover_url.trim()
  if (!cover) errors.cover_url = 'Pegá la URL de la portada'
  else if (!/^https?:\/\//i.test(cover))
    errors.cover_url = 'Tiene que empezar con http:// o https://'
  if (values.parts.trim() && !isPositiveInt(values.parts, 1)) errors.parts = 'Tiene que ser 1 o más'
  if (values.total_units.trim() && !isPositiveInt(values.total_units, 1))
    errors.total_units = 'Tiene que ser 1 o más'
  if (values.progress.trim()) {
    if (!isPositiveInt(values.progress, 0)) errors.progress = 'Tiene que ser 0 o más'
    else if (
      values.total_units.trim() &&
      !errors.total_units &&
      Number(values.progress) > Number(values.total_units)
    )
      errors.progress = `No puede superar el total (${Number(values.total_units)})`
  }
  return errors
}

const toNumberOrNull = (value: string) => (value.trim() ? Number(value) : null)
const toTextOrNull = (value: string) => (value.trim() ? value.trim() : null)

export const toWorkPayload = (values: WorkFormValues): WorkPayload => ({
  title: values.title.trim(),
  type: values.type,
  status: values.status as WorkPayload['status'],
  cover_url: values.cover_url.trim(),
  short_review: toTextOrNull(values.short_review),
  long_review: toTextOrNull(values.long_review),
  parts: toNumberOrNull(values.parts),
  total_units: toNumberOrNull(values.total_units),
  progress: values.progress.trim() ? Number(values.progress) : 0,
  rating: values.rating,
  is_favorite: values.is_favorite,
})
