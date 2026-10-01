type DbError = { code?: string; message?: string; status?: number; details?: string | null }

export type TranslatedError = {
  kind:
    'duplicate-work' | 'duplicate-genre' | 'progress' | 'check' | 'ranking' | 'session' | 'network'
  message: string
}

export const isSessionError = (error: DbError | null | undefined) =>
  !!error && (error.status === 401 || error.code === 'PGRST301' || error.code === '42501')

export const translateDbError = (error: DbError): TranslatedError => {
  const text = `${error.message ?? ''} ${error.details ?? ''}`
  if (isSessionError(error)) return { kind: 'session', message: 'Tu sesión venció.' }
  if (error.code === '23505') {
    if (text.includes('genres_name_key'))
      return { kind: 'duplicate-genre', message: 'Ese género ya existe.' }
    if (text.includes('works_title_type_key'))
      return { kind: 'duplicate-work', message: 'Ya cargaste esa obra.' }
  }
  if (error.code === '22023')
    return {
      kind: 'ranking',
      message:
        'No pudimos guardar el Ranking: hay más de 10 animes o alguno ya no es favorito. Recargá y probá de nuevo.',
    }
  if (error.code === '23514' || error.code === '23502') {
    if (text.includes('works_progress_max'))
      return { kind: 'progress', message: 'Los vistos/leídos no pueden superar el total.' }
    if (text.includes('works_ranking'))
      return {
        kind: 'ranking',
        message: 'No pudimos guardar el Ranking: hay más de 10 animes o alguno ya no es favorito.',
      }
    return { kind: 'check', message: 'Revisá los datos marcados.' }
  }
  return {
    kind: 'network',
    message: 'No pudimos guardar. Revisá tu conexión y probá de nuevo.',
  }
}
